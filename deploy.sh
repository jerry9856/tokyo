#!/bin/bash

# Get current date and time
VERSION="v.$(date +'%Y.%m.%d.%H%M')"

# Update the version tag in index.html
# Works on macOS (sed -i '')
sed -i '' "s|<div class=\"version-tag\">.*</div>|<div class=\"version-tag\">$VERSION</div>|g" index.html

# Get commit message from parameter or use default
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    COMMIT_MSG="Update version to $VERSION"
fi

# Add the file, commit, and push
git add .
git commit -m "$COMMIT_MSG"
git push

echo "Deployed version $VERSION with message: $COMMIT_MSG"
