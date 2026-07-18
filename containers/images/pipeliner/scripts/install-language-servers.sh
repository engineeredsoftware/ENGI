#!/usr/bin/env bash
# Install native language servers into the Pipeliner image PATH.
# npm-bundled servers ship with @bitcode/lsp (pnpm install) — not listed here.
#
# Profile (BITCODE_PIPELINE_LSP_PROFILE):
#   default — gopls, rust-analyzer, clangd, marksman, terraform-ls, lua-ls, sqls
#   full    — default + JVM + jdtls + kotlin-language-server + .NET + OmniSharp
#
# Target: /usr/local/bin (and Go bin for gopls/sqls).
# Safe to re-run; fails the image build on hard errors.

set -euo pipefail

PROFILE="${BITCODE_PIPELINE_LSP_PROFILE:-full}"
case "${PROFILE}" in
  default|full) ;;
  *)
    echo "Unknown BITCODE_PIPELINE_LSP_PROFILE=${PROFILE} (use default|full)" >&2
    exit 1
    ;;
esac

ARCH="$(uname -m)"
case "${ARCH}" in
  x86_64|amd64)
    GO_ARCH=amd64
    RA_ARCH=x86_64
    TF_ARCH=amd64
    MARKS_ARCH=x64
    LUA_ARCH=x64
    DOTNET_ARCH=x64
    OMNI_RID=linux-x64
    KLS_ARCH=linux
    ;;
  aarch64|arm64)
    GO_ARCH=arm64
    RA_ARCH=aarch64
    TF_ARCH=arm64
    MARKS_ARCH=arm64
    LUA_ARCH=arm64
    DOTNET_ARCH=arm64
    OMNI_RID=linux-arm64
    KLS_ARCH=linux
    ;;
  *)
    echo "Unsupported arch: ${ARCH}" >&2
    exit 1
    ;;
esac

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  xz-utils \
  gzip \
  unzip \
  tar \
  clangd \
  git \
  libicu72 \
  libssl3
rm -rf /var/lib/apt/lists/*

install -d /usr/local/bin /opt/go /opt/jdtls /opt/kotlin-language-server /opt/omnisharp

# ---------------------------------------------------------------------------
# Go toolchain + gopls + sqls
# ---------------------------------------------------------------------------
GO_VERSION="${BITCODE_GO_VERSION:-1.24.2}"
GOPLS_VERSION="${BITCODE_GOPLS_VERSION:-v0.18.1}"
curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz" \
  | tar -C /usr/local -xz
export PATH="/usr/local/go/bin:${PATH}"
export GOPATH=/opt/go
export GOBIN=/usr/local/bin
# Pin gopls — avoid bleeding-edge breakages on image rebuilds.
go install "golang.org/x/tools/gopls@${GOPLS_VERSION}"
# sqls: prebuilt binary (go install @latest pulls godror and fails without Oracle CGO).
SQLS_VERSION="${BITCODE_SQLS_VERSION:-0.2.48}"
curl -fsSL \
  "https://github.com/sqls-server/sqls/releases/download/v${SQLS_VERSION}/sqls-linux-${SQLS_VERSION}.zip" \
  -o /tmp/sqls.zip
unzip -o /tmp/sqls.zip -d /tmp/sqls-extract
# Asset is a single binary at zip root or named sqls
if [ -x /tmp/sqls-extract/sqls ]; then
  install -m 0755 /tmp/sqls-extract/sqls /usr/local/bin/sqls
else
  found="$(find /tmp/sqls-extract -type f -name 'sqls' | head -1)"
  install -m 0755 "${found}" /usr/local/bin/sqls
fi
rm -rf /tmp/sqls.zip /tmp/sqls-extract

# ---------------------------------------------------------------------------
# rust-analyzer
# ---------------------------------------------------------------------------
curl -fsSL \
  "https://github.com/rust-lang/rust-analyzer/releases/latest/download/rust-analyzer-${RA_ARCH}-unknown-linux-gnu.gz" \
  | gunzip -c > /usr/local/bin/rust-analyzer
chmod +x /usr/local/bin/rust-analyzer

# ---------------------------------------------------------------------------
# marksman
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

DEFAULT_BINS=(gopls rust-analyzer clangd marksman terraform-ls lua-language-server sqls go)

# ---------------------------------------------------------------------------
# full profile: JVM + jdtls + kotlin-language-server + .NET + OmniSharp
# ---------------------------------------------------------------------------
if [ "${PROFILE}" = "full" ]; then
  # Debian bookworm main ships OpenJDK 17; 21 is not in main (CI/image fail).
  # JDTLS and kotlin-language-server run on 17 for Pipeliner full profile.
  apt-get update
  apt-get install -y --no-install-recommends \
    openjdk-17-jre-headless \
    openjdk-17-jdk-headless
  rm -rf /var/lib/apt/lists/*

  # Eclipse JDT Language Server (launcher script on PATH as jdtls)
  JDTLS_VERSION="${BITCODE_JDTLS_VERSION:-1.46.1}"
  JDTLS_BUILD="${BITCODE_JDTLS_BUILD:-202503271451}"
  JDTLS_URL="https://download.eclipse.org/jdtls/milestones/${JDTLS_VERSION}/jdt-language-server-${JDTLS_VERSION}-${JDTLS_BUILD}.tar.gz"
  curl -fsSL "${JDTLS_URL}" -o /tmp/jdtls.tar.gz \
    || curl -fsSL \
      "https://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz" \
      -o /tmp/jdtls.tar.gz
  tar -xzf /tmp/jdtls.tar.gz -C /opt/jdtls
  rm -f /tmp/jdtls.tar.gz
  cat > /usr/local/bin/jdtls <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
JDTLS_HOME="${JDTLS_HOME:-/opt/jdtls}"
JAR="$(echo "${JDTLS_HOME}"/plugins/org.eclipse.equinox.launcher_*.jar | tr ' ' '\n' | head -1)"
CONFIG_DIR="${JDTLS_HOME}/config_linux"
DATA_DIR="${XDG_CACHE_HOME:-/tmp}/jdtls-workspace"
mkdir -p "${DATA_DIR}"
exec java \
  -Declipse.application=org.eclipse.jdt.ls.core.id1 \
  -Dosgi.bundles.defaultStartLevel=4 \
  -Declipse.product=org.eclipse.jdt.ls.core.product \
  -Dlog.level=ERROR \
  -Xmx1G \
  -jar "${JAR}" \
  -configuration "${CONFIG_DIR}" \
  -data "${DATA_DIR}" \
  "$@"
EOF
  chmod +x /usr/local/bin/jdtls

  # Kotlin language server
  KLS_VERSION="${BITCODE_KOTLIN_LS_VERSION:-1.3.13}"
  KLS_URL="https://github.com/fwcd/kotlin-language-server/releases/download/${KLS_VERSION}/server.zip"
  curl -fsSL "${KLS_URL}" -o /tmp/kotlin-ls.zip
  unzip -o /tmp/kotlin-ls.zip -d /opt/kotlin-language-server
  rm -f /tmp/kotlin-ls.zip
  # Layout may be server/bin/kotlin-language-server or bin/...
  if [ -x /opt/kotlin-language-server/server/bin/kotlin-language-server ]; then
    ln -sf /opt/kotlin-language-server/server/bin/kotlin-language-server /usr/local/bin/kotlin-language-server
  elif [ -x /opt/kotlin-language-server/bin/kotlin-language-server ]; then
    ln -sf /opt/kotlin-language-server/bin/kotlin-language-server /usr/local/bin/kotlin-language-server
  else
    find /opt/kotlin-language-server -type f -name 'kotlin-language-server' | head -1 | while read -r p; do
      ln -sf "$p" /usr/local/bin/kotlin-language-server
    done
  fi
  chmod +x /usr/local/bin/kotlin-language-server || true

  # .NET runtime/SDK (for OmniSharp)
  DOTNET_VERSION="${BITCODE_DOTNET_VERSION:-8.0}"
  curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
  bash /tmp/dotnet-install.sh --channel "${DOTNET_VERSION}" --install-dir /opt/dotnet
  rm -f /tmp/dotnet-install.sh
  ln -sf /opt/dotnet/dotnet /usr/local/bin/dotnet
  export DOTNET_ROOT=/opt/dotnet
  export PATH="/opt/dotnet:${PATH}"

  # OmniSharp
  OMNI_VERSION="${BITCODE_OMNISHARP_VERSION:-1.39.12}"
  OMNI_URL="https://github.com/OmniSharp/omnisharp-roslyn/releases/download/v${OMNI_VERSION}/omnisharp-${OMNI_RID}.tar.gz"
  curl -fsSL "${OMNI_URL}" -o /tmp/omnisharp.tar.gz
  tar -xzf /tmp/omnisharp.tar.gz -C /opt/omnisharp
  rm -f /tmp/omnisharp.tar.gz
  if [ -x /opt/omnisharp/OmniSharp ]; then
    ln -sf /opt/omnisharp/OmniSharp /usr/local/bin/OmniSharp
    ln -sf /opt/omnisharp/OmniSharp /usr/local/bin/omnisharp
  elif [ -x /opt/omnisharp/run ]; then
    cat > /usr/local/bin/OmniSharp <<'EOF'
#!/usr/bin/env bash
exec /opt/omnisharp/run "$@"
EOF
    chmod +x /usr/local/bin/OmniSharp
    ln -sf /usr/local/bin/OmniSharp /usr/local/bin/omnisharp
  else
    echo "OmniSharp binary not found after extract" >&2
    ls -la /opt/omnisharp || true
    exit 1
  fi

  DEFAULT_BINS+=(java jdtls kotlin-language-server dotnet OmniSharp)
fi

# ---------------------------------------------------------------------------
# Smoke
# ---------------------------------------------------------------------------
for bin in "${DEFAULT_BINS[@]}"; do
  command -v "${bin}" >/dev/null || {
    echo "missing language-server binary: ${bin}" >&2
    exit 1
  }
  echo "ok: $(command -v "${bin}")"
done

echo "Pipeliner native language servers installed (profile=${PROFILE})."
