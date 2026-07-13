#!/bin/bash

# Migration script to update VCS imports from old packages to new @bitcode/vcs package

echo "Migrating VCS imports from old packages to @bitcode/vcs..."

# Find all TypeScript and JavaScript files
find ../.. -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" | while read -r file; do
  
  # Check if file contains old imports
  if grep -q "@bitcode/vcs-core\|@bitcode/vcs-service\|@bitcode/vcs-generics" "$file"; then
    echo "Updating imports in: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace imports
    sed -i '' \
      -e 's|from ["'"'"']@bitcode/vcs-core["'"'"']|from "@bitcode/vcs"|g' \
      -e 's|from ["'"'"']@bitcode/vcs-service["'"'"']|from "@bitcode/vcs"|g' \
      -e 's|from ["'"'"']@bitcode/vcs-generics["'"'"']|from "@bitcode/vcs"|g' \
      -e 's|import("@bitcode/vcs-core")|import("@bitcode/vcs")|g' \
      -e 's|import("@bitcode/vcs-service")|import("@bitcode/vcs")|g' \
      -e 's|import("@bitcode/vcs-generics")|import("@bitcode/vcs")|g' \
      -e 's|require("@bitcode/vcs-core")|require("@bitcode/vcs")|g' \
      -e 's|require("@bitcode/vcs-service")|require("@bitcode/vcs")|g' \
      -e 's|require("@bitcode/vcs-generics")|require("@bitcode/vcs")|g' \
      "$file"
    
    # Check if changes were made
    if ! diff -q "$file" "$file.bak" > /dev/null; then
      echo "  ✓ Updated imports"
      rm "$file.bak"
    else
      echo "  - No changes needed"
      rm "$file.bak"
    fi
  fi
done

# Update package.json dependencies
echo ""
echo "Updating package.json dependencies..."
find ../.. -name "package.json" -not -path "*/node_modules/*" | while read -r file; do
  if grep -q '"@bitcode/vcs-core"\|"@bitcode/vcs-service"\|"@bitcode/vcs-generics"' "$file"; then
    echo "Updating dependencies in: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace dependencies
    sed -i '' \
      -e 's|"@bitcode/vcs-core": "[^"]*"|"@bitcode/vcs": "workspace:*"|g' \
      -e 's|"@bitcode/vcs-service": "[^"]*"|"@bitcode/vcs": "workspace:*"|g' \
      -e 's|"@bitcode/vcs-generics": "[^"]*"|"@bitcode/vcs": "workspace:*"|g' \
      "$file"
    
    # Remove duplicates if @bitcode/vcs already exists
    # This is more complex and would read a proper JSON parser
    
    echo "  ✓ Updated dependencies"
    rm "$file.bak"
  fi
done

echo ""
echo "Migration complete! Please review the changes and run tests."
echo ""
echo "Note: Some imports might read manual adjustment if they were importing specific paths like:"
echo "  - @bitcode/vcs-core/utils"
echo "  - @bitcode/vcs-service/cache"
echo ""
echo "These should be updated to:"
echo "  - @bitcode/vcs"
echo ""
echo "Also check for any type-only imports that might read adjustment."