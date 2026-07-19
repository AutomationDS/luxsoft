import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutList, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { client } from '@/lib/client';
import { useUserStore } from '@/lib/store';
import type { Category, Product } from '@/lib/types';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('newest');
  const [totalProducts, setTotalProducts] = useState(0);
  const { checkAuth } = useUserStore();

  const activeCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    checkAuth();
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [activeCategory, searchQuery, sortBy]);

  const loadCategories = async () => {
    try {
      const res = await client.entities.categories.query({ query: {}, sort: 'display_order' });
      setCategories(res?.data?.items || []);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const query: Record<string, unknown> = {};
      if (activeCategory) {
        const cat = categories.find((c) => c.slug === activeCategory);
        if (cat) query.category_id = cat.id;
      }

      let sort = '-created_at';
      if (sortBy === 'price-low') sort = 'price';
      else if (sortBy === 'price-high') sort = '-price';
      else if (sortBy === 'rating') sort = '-rating';
      else if (sortBy === 'popular') sort = '-review_count';

      const res = await client.entities.products.query({ query, sort, limit: 50 });
      let items = res?.data?.items || [];

      // Client-side search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(
          (p: Product) =>
            p.name.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.tags?.toLowerCase().includes(q)
        );
      }

      // Client-side price filter
      items = items.filter(
        (p: Product) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );

      setProducts(items);
      setTotalProducts(items.length);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (slug: string) => {
    if (slug === activeCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 3000]);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {searchQuery ? `Results for "${searchQuery}"` : activeCategory ? categories.find(c => c.slug === activeCategory)?.name || 'Shop' : 'All Products'}
            </h1>
            <p className="text-muted-foreground mt-1">{totalProducts} products found</p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={!activeCategory ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-1.5 text-sm rounded-full hover:bg-primary hover:text-white transition-colors"
              onClick={() => clearFilters()}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={activeCategory === cat.slug ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 text-sm rounded-full hover:bg-primary hover:text-white transition-colors"
                onClick={() => handleCategoryClick(cat.slug)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              {(activeCategory || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 rounded-full h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center gap-1 border rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 p-6 bg-card rounded-2xl border border-border/50 animate-slide-up">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Price Range</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={3000}
                    step={50}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={loadProducts} className="rounded-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters} className="mt-4 rounded-full">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}