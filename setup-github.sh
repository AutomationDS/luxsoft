#!/bin/bash

mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE

cat > .github/CODEOWNERS << 'EOF'
* @AutomationDS
EOF

cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## Summary

Describe your changes.

## Type of Change

- [ ] Feature
- [ ] Bug Fix
- [ ] Documentation

## Testing

Describe your testing.

## Checklist

- [ ] Build Passed
- [ ] Tests Passed

## Related Issue

Fixes #
EOF

cat > .github/CONTRIBUTING.md << 'EOF'
# Contributing

1. Create a feature branch.
2. Commit your changes.
3. Open a Pull Request.
EOF

cat > .github/SECURITY.md << 'EOF'
# Security Policy

Please report vulnerabilities privately.
EOF

cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug Report
about: Report a bug
---

## Description

## Steps

## Expected

## Actual
EOF

cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature Request
about: Suggest a feature
---

## Description

## Benefits

## Proposed Solution
EOF

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches:
      - main
      - develop

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - run: echo "CI Started"
EOF

echo "GitHub repository structure created successfully."
