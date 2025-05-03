#!/usr/bin/env bash
set -euo pipefail

# 1) configuration
HUGO_VERSION="0.126.2"         # or bump to 0.127.0+ if you prefer
THEME_MODULE="github.com/stradichenko/PKB-theme"
WORKSPACE="$(pwd)"
EXAMPLE_DIR="exampleSite"

# 2) install Hugo extended
echo "==> Installing Hugo ${HUGO_VERSION} (extended)…"
wget -qO hugo.tar.gz \
  "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz"
sudo tar -C /usr/local/bin -xzf hugo.tar.gz hugo
rm hugo.tar.gz

# 3) install htmltest
echo "==> Installing htmltest (latest)…"
LATEST_TAG="$(curl -s https://api.github.com/repos/wjdp/htmltest/releases/latest \
  | grep '"tag_name":' | cut -d '"' -f 4)"
wget -qO htmltest.tar.gz \
  "https://github.com/wjdp/htmltest/releases/download/${LATEST_TAG}/htmltest_${LATEST_TAG#v}_linux_amd64.tar.gz"
tar xzf htmltest.tar.gz htmltest
sudo mv htmltest /usr/local/bin/
rm htmltest.tar.gz

# 4) init module in repo root
echo
echo "==> Initializing Hugo module in repo root"
rm -f go.mod go.sum
hugo mod init "${THEME_MODULE}"

# 5) point your theme import at your local checkout
export HUGO_MODULE_REPLACEMENTS="${THEME_MODULE}->${WORKSPACE}"
echo "==> Module replacements: ${HUGO_MODULE_REPLACEMENTS}"

echo "-- go.mod:"
cat go.mod

# 6) build & test the exampleSite
echo
echo "==> Building ${EXAMPLE_DIR}"
pushd "${EXAMPLE_DIR}" >/dev/null

echo "-- tidying & verifying modules"
hugo mod tidy
hugo mod verify

echo "-- building site"
hugo \
  --minify \
  --cleanDestinationDir \
  --environment _default \
  --logLevel debug \
  --source .

echo "-- running htmltest"
htmltest -c .htmltest.yml --log-level 3 --skip-external

popd >/dev/null

echo
echo "✅ All done!"
