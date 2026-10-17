#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}        NEXUS APPS - MACOS ICON GENERATOR           ${NC}"
echo -e "${BLUE}=====================================================${NC}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

generate_app_icons() {
    local APP_NAME=$1
    local SVG_PATH="$ROOT_DIR/tooling/assets/${APP_NAME}.svg"
    local OUTPUT_DIR="$ROOT_DIR/apps/${APP_NAME}/src-tauri/icons"

    echo ""
    echo -e "${BLUE}>>> Generating icons for: ${GREEN}${APP_NAME}${NC}"
    mkdir -p "$OUTPUT_DIR"

    # Use Tauri CLI icon generator directly on SVG
    npx @tauri-apps/cli icon "$SVG_PATH" -o "$OUTPUT_DIR"

    echo -e "${GREEN}✓ Icons successfully generated at: ${OUTPUT_DIR}${NC}"
}

generate_app_icons "nexus"
generate_app_icons "slackbot"
generate_app_icons "github-report"
generate_app_icons "pet-2d"

echo ""
echo -e "${GREEN}🎉 All icons for Nexus, SlackBot, GitHub Report, and 2D Pet have been created!${NC}"
