#!/bin/bash

# Get current date and time
VERSION="v.$(date +'%Y.%m.%d.%H%M')"

# Update the version tag in index.html
# Works on macOS (sed -i '')
sed -i '' "s/v\.[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}\.[0-9]\{4\}/$VERSION/g" index.html

# Add the file, commit, and push
git add index.html
git commit -m "Update version to $VERSION"
git push

echo "Deployed version $VERSION"
