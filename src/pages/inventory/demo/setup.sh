#!/bin/bash

# Demo Management Module Setup Guide
# Run this script to verify all dependencies and setup

echo "=========================================="
echo "Demo Management Module - Setup Verification"
echo "=========================================="

# Check Node modules
echo ""
echo "Checking required dependencies..."

# Check for React Router
if grep -q "react-router" package.json; then
    echo "✓ react-router found"
else
    echo "✗ react-router NOT found - Install with: npm install react-router"
fi

# Check for Tailwind CSS
if grep -q "tailwindcss" package.json; then
    echo "✓ tailwindcss found"
else
    echo "✗ tailwindcss NOT found - Install with: npm install -D tailwindcss"
fi

# Check for Lucide React
if grep -q "lucide-react" package.json; then
    echo "✓ lucide-react found"
else
    echo "✗ lucide-react NOT found - Install with: npm install lucide-react"
fi

# Check file structure
echo ""
echo "Checking file structure..."

files=(
    "src/pages/inventory/demo/CheckDemoProductAvailability.tsx"
    "src/pages/inventory/demo/InventoryReceivesDemoRequest.tsx"
    "src/pages/inventory/demo/index.ts"
    "src/pages/inventory/demo/IMPLEMENTATION_GUIDE.md"
    "src/types/demo.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file NOT found"
    fi
done

echo ""
echo "=========================================="
echo "Setup verification complete!"
echo "=========================================="

echo ""
echo "Next steps:"
echo "1. Import components in your routing file"
echo "2. Add routes to your router configuration"
echo "3. Replace sample data with API calls"
echo "4. Update backend endpoints"
echo "5. Add user authentication guards"
echo "6. Configure notifications"
