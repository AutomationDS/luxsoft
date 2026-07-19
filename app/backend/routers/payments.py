import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import stripe

from core.database import get_db
from core.config import settings
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.orders import Orders
from models.order_items import Order_items
from models.cart_items import Cart_items
from models.products import Products

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])

logger = logging.getLogger(__name__)


class CheckoutSessionRequest(BaseModel):
    success_url: str = ""
    cancel_url: str = ""


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class PaymentVerificationRequest(BaseModel):
    session_id: str


class PaymentStatusResponse(BaseModel):
    status: str
    order_id: int = None
    payment_status: str


@router.post("/create_payment_session", response_model=CheckoutSessionResponse)
async def create_payment_session(
    data: CheckoutSessionRequest,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe checkout session from the user's cart items"""
    try:
        frontend_host = request.headers.get("App-Host")
        if frontend_host and not frontend_host.startswith(("http://", "https://")):
            frontend_host = f"https://{frontend_host}"

        # Get cart items for the user
        cart_result = await db.execute(
            select(Cart_items).where(Cart_items.user_id == current_user.id)
        )
        cart_items = cart_result.scalars().all()

        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # Get product details for cart items
        product_ids = [item.product_id for item in cart_items]
        products_result = await db.execute(
            select(Products).where(Products.id.in_(product_ids))
        )
        products_map = {p.id: p for p in products_result.scalars().all()}

        # Calculate total and build line items
        total_amount = 0
        line_items = []
        order_items_data = []

        for cart_item in cart_items:
            product = products_map.get(cart_item.product_id)
            if not product:
                continue

            item_total = product.price * cart_item.quantity
            total_amount += item_total

            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": product.name,
                        "description": product.description[:200] if product.description else "",
                    },
                    "unit_amount": int(product.price * 100),
                },
                "quantity": cart_item.quantity,
            })

            order_items_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "product_image": product.image_url,
                "quantity": cart_item.quantity,
                "price": product.price,
                "color": cart_item.color,
                "size": cart_item.size,
            })

        # Create order
        order = Orders(
            user_id=current_user.id,
            total_amount=total_amount,
            status="pending",
            payment_status="pending",
        )
        db.add(order)
        await db.flush()

        # Create order items
        for item_data in order_items_data:
            order_item = Order_items(
                user_id=current_user.id,
                order_id=order.id,
                **item_data,
            )
            db.add(order_item)

        await db.commit()
        await db.refresh(order)

        # End DB transaction before Stripe call
        await db.rollback()

        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{frontend_host}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_host}/checkout",
            metadata={
                "order_id": str(order.id),
                "user_id": current_user.id,
            },
        )

        # Save session_id to order
        order_update = await db.execute(
            select(Orders).where(Orders.id == order.id)
        )
        order_obj = order_update.scalar_one()
        order_obj.session_id = session.id
        await db.commit()

        return CheckoutSessionResponse(
            session_id=session.id,
            url=session.url,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment session creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create payment session: {str(e)}")


@router.post("/verify_payment", response_model=PaymentStatusResponse)
async def verify_payment(
    data: PaymentVerificationRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify payment status and update order"""
    try:
        session = stripe.checkout.Session.retrieve(data.session_id)
        order_id = session.metadata.get("order_id")

        if not order_id:
            raise HTTPException(status_code=400, detail="Invalid session")

        # Update order status
        order_result = await db.execute(
            select(Orders).where(Orders.id == int(order_id), Orders.user_id == current_user.id)
        )
        order = order_result.scalar_one_or_none()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        status_mapping = {"complete": "paid", "open": "pending", "expired": "cancelled"}
        payment_status = status_mapping.get(session.status, "pending")

        order.payment_status = payment_status
        if payment_status == "paid":
            order.status = "confirmed"
            # Clear cart after successful payment
            cart_result = await db.execute(
                select(Cart_items).where(Cart_items.user_id == current_user.id)
            )
            cart_items = cart_result.scalars().all()
            for item in cart_items:
                await db.delete(item)

        await db.commit()

        return PaymentStatusResponse(
            status=payment_status,
            order_id=int(order_id),
            payment_status=session.payment_status,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to verify payment: {str(e)}")