#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}    NEXUS MONOREPO - MACOS ENVIRONMENT HEALTH CHECK  ${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

ALL_PASSED=true

# 1. Check macOS
OS_NAME=$(uname -s)
if [ "$OS_NAME" != "Darwin" ]; then
    echo -e "[ ${RED}FAIL${NC} ] Hệ điều hành: $OS_NAME (Yêu cầu macOS)."
    ALL_PASSED=false
else
    OS_VERSION=$(sw_vers -productVersion)
    ARCH=$(uname -m)
    echo -e "[ ${GREEN}PASS${NC} ] Hệ điều hành: macOS $OS_VERSION ($ARCH)."
fi

# 2. Check Xcode Command Line Tools
if xcode-select -p &>/dev/null; then
    CLT_PATH=$(xcode-select -p)
    echo -e "[ ${GREEN}PASS${NC} ] Xcode CLT đã cài đặt tại: $CLT_PATH"
else
    echo -e "[ ${RED}FAIL${NC} ] Xcode Command Line Tools chưa cài đặt. Hãy chạy: xcode-select --install"
    ALL_PASSED=false
fi

# 3. Check Node.js
if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    MAJOR_VER=$(echo "$NODE_VER" | cut -d'.' -f1 | tr -d 'v')
    if [ "$MAJOR_VER" -ge 20 ]; then
        echo -e "[ ${GREEN}PASS${NC} ] Node.js: $NODE_VER"
    else
        echo -e "[ ${YELLOW}WARN${NC} ] Node.js: $NODE_VER (Khuyến nghị >= v20.0.0)"
    fi
else
    echo -e "[ ${RED}FAIL${NC} ] Node.js chưa được cài đặt."
    ALL_PASSED=false
fi

# 4. Check pnpm
if command -v pnpm &>/dev/null; then
    PNPM_VER=$(pnpm -v)
    echo -e "[ ${GREEN}PASS${NC} ] pnpm: v$PNPM_VER"
else
    echo -e "[ ${RED}FAIL${NC} ] pnpm chưa được kích hoạt. Hãy chạy: corepack enable pnpm"
    ALL_PASSED=false
fi

# 5. Check Rust & Cargo
if command -v rustc &>/dev/null && command -v cargo &>/dev/null; then
    RUST_VER=$(rustc --version | cut -d' ' -f2)
    CARGO_VER=$(cargo --version | cut -d' ' -f2)
    echo -e "[ ${GREEN}PASS${NC} ] Rust compiler: $RUST_VER"
    echo -e "[ ${GREEN}PASS${NC} ] Cargo: $CARGO_VER"
else
    echo -e "[ ${RED}FAIL${NC} ] Rust/Cargo chưa được cài đặt hoặc chưa nạp vào PATH."
    echo -e "       Hãy chạy: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    ALL_PASSED=false
fi

echo ""
echo -e "${BLUE}-----------------------------------------------------${NC}"
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}🎉 TẤT CẢ YÊU CẦU MÔI TRƯỜNG ĐÃ ĐẠT CHUẨN! SẴN SÀNG PHÁT TRIỂN.${NC}"
else
    echo -e "${YELLOW}⚠️  MÔI TRƯỜNG CÒN THIẾU CÁC THÀNH PHẦN TRÊN. VUI LÒNG CÀI ĐẶT TRƯỚC KHI BUILD NATIVE TAURI.${NC}"
fi
echo -e "${BLUE}=====================================================${NC}"
