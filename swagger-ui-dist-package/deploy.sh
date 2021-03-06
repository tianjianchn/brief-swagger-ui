# Deploy `swagger-ui-dist` to npm.

# Parameter Expansion: http://stackoverflow.com/questions/6393551/what-is-the-meaning-of-0-in-a-bash-script
# cd "${0%/*}"

if [ "${PWD##*/}" != "swagger-ui-dist-package" ]; then
  echo "must be run under swagger-ui-dist-package dir"
  exit 1
fi

# Get UI version
UI_VERSION=$(node -p "require('../package.json').version")
echo $UI_VERSION

# Replace our version placeholder with UI's version
perl -i -pe"s|\"version\": \".*?\",|\"version\": \"$UI_VERSION\",|g" package.json

# Copy UI's dist files to our directory
cp ../dist/* .

PUBLISH_DIST=true
if [ "$PUBLISH_DIST" = "true" ] || [ "$TRAVIS" = "true" ] ; then
  npm publish .
else
  npm pack .
fi

find . -not -name .npmignore -not -name .npmrc -not -name deploy.sh -not -name index.js -not -name package.json -not -name README.md -not -name "*.tgz" -not -name absolute-path.js -not -name brief-swagger-ui-markdown.png -not -name brief-swagger-ui.gif -delete
