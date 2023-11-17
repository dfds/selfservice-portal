#!/usr/bin/env bash

./setup-tooling.sh

echo "Creating pre-commit hook"
mkdir .git/hooks 2>&-
echo "#!/usr/bin/env bash" > .git/hooks/pre-commit
echo "npx prettier . --write" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "Done"