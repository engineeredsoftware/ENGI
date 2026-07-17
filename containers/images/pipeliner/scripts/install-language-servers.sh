#!/usr/bin/env bash
# Install native language servers into the Pipeliner image PATH.
# npm-bundled servers ship with @bitcode/lsp (pnpm install) — not listed here.
#
# Target: /usr/local/bin (and Go bin for gopls/sqls).
# Safe to re-run; fails the image build on hard errors.

set -euo pipefail

ARCH="$(uname -m)"
case "${ARCH}" in
  x86_64|amd64) GO_ARCH=amd64; RA_ARCH=x86_64; TF_ARCH=amd64; MARKS_ARCH=x64; LUA_ARCH=x64 ;;
  aarch64|arm64) GO_ARCH=arm64; RA_ARCH=aarch64; TF_ARCH=arm64; MARKS_ARCH=arm64; LUA_ARCH=arm64 ;;
  *) echo "Unsupported arch: ${ARCH}" >&2; exit 1 ;;
esac

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  xz-utils \
  gzip \
  unzip \
  clangd \
  git
rm -rf /var/lib/apt/lists/*

install -d /usr/local/bin /opt/go

# ---------------------------------------------------------------------------
# Go toolchain + gopls + sqls (gopls needs a real Go for customer modules)
# ---------------------------------------------------------------------------
GO_VERSION="${BITCODE_GO_VERSION:-1.24.2}"
curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz" \
  | tar -C /usr/local -xz
export PATH="/usr/local/go/bin:${PATH}"
export GOPATH=/opt/go
export GOBIN=/usr/local/bin
go install golang.org/x/tools/gopls@latest
go install github.com/sqls-server/sqls@latest

# ---------------------------------------------------------------------------
# rust-analyzer (static binary; no full Rust toolchain required for LSP)
# ---------------------------------------------------------------------------
curl -fsSL \
  "https://github.com/rust-lang/rust-analyzer/releases/latest/download/rust-analyzer-${RA_ARCH}-unknown-linux-gnu.gz" \
  | gunzip -c > /usr/local/bin/rust-analyzer
chmod +x /usr/local/bin/rust-analyzer

# ---------------------------------------------------------------------------
# marksman (Markdown)
# ---------------------------------------------------------------------------
MARKS_TAG="${BITCODE_MARKSMAN_TAG:-2024-12-18}"
curl -fsSL \
  "https://github.com/artempyanykh/marksman/releases/download/${MARKS_TAG}/marksman-linux-${MARKS_ARCH}" \
  -o /usr/local/bin/marksman
chmod +x /usr/local/bin/marksman

# ---------------------------------------------------------------------------
# terraform-ls
# ---------------------------------------------------------------------------
TF_LS_VERSION="${BITCODE_TERRAFORM_LS_VERSION:-0.36.4}"
curl -fsSL \
  "https://releases.hashicorp.com/terraform-ls/${TF_LS_VERSION}/terraform-ls_${TF_LS_VERSION}_linux_${TF_ARCH}.zip" \
  -o /tmp/terraform-ls.zip
unzip -o /tmp/terraform-ls.zip -d /usr/local/bin
chmod +x /usr/local/bin/terraform-ls
rm -f /tmp/terraform-ls.zip

# ---------------------------------------------------------------------------
# lua-language-server
# ---------------------------------------------------------------------------
LUA_LS_VERSION="${BITCODE_LUA_LS_VERSION:-3.13.9}"
curl -fsSL \
  "https://github.com/LuaLS/lua-language-server/releases/download/${LUA_LS_VERSION}/lua-language-server-${LUA_LS_VERSION}-linux-${LUA_ARCH}.tar.gz" \
  -o /tmp/lua-ls.tar.gz
mkdir -p /opt/lua-language-server
tar -xzf /tmp/lua-ls.tar.gz -C /opt/lua-language-server
ln -sf /opt/lua-language-server/bin/lua-language-server /usr/local/bin/lua-language-server
rm -f /tmp/lua-ls.tar.gz

# ---------------------------------------------------------------------------
# Smoke: every Pipeliner-native server must be on PATH
# ---------------------------------------------------------------------------
for bin in gopls rust-analyzer clangd marksman terraform-ls lua-language-server sqls go; do
  command -v "${bin}" >/dev/null || {
    echo "missing language-server binary: ${bin}" >&2
    exit 1
  }
  echo "ok: $(command -v "${bin}")"
done

echo "Pipeliner native language servers installed."
