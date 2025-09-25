#!/bin/bash

# Zen Build Suite - Tauri Setup Script
# This script helps set up the development environment for Tauri with Chrome/Chromium engine

echo "🚀 Setting up Zen Build Suite with Tauri Chrome/Chromium Engine..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo "✅ Rust installed successfully"
else
    echo "✅ Rust is already installed"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    # Try to install Node.js using the system package manager
    if command -v dnf &> /dev/null; then
        echo "Using dnf to install Node.js..."
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo dnf install -y nodejs npm
    elif command -v apt &> /dev/null; then
        echo "Using apt to install Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "❌ Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
    echo "✅ Node.js installed successfully"
else
    echo "✅ Node.js is already installed"
fi

# Install system dependencies (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📦 Installing system dependencies..."
    if command -v dnf &> /dev/null; then
        sudo dnf install -y gcc gcc-c++ make pkg-config webkit2gtk3-devel openssl-devel
    elif command -v apt &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y gcc g++ make pkg-config libwebkit2gtk-4.0-dev libssl-dev
    fi
    echo "✅ System dependencies installed"
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Install Tauri CLI if not already installed
if ! command -v tauri &> /dev/null; then
    echo "📦 Installing Tauri CLI..."
    npm install -g @tauri-apps/cli
    echo "✅ Tauri CLI installed"
else
    echo "✅ Tauri CLI is already installed"
fi

# Verify installation
echo "🔍 Verifying installation..."

if command -v cargo &> /dev/null; then
    echo "✅ Rust/Cargo: $(cargo --version)"
else
    echo "❌ Rust/Cargo not found"
fi

if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
fi

if command -v tauri &> /dev/null; then
    echo "✅ Tauri CLI: $(tauri --version)"
else
    echo "❌ Tauri CLI not found"
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo "  npm run tauri:dev    # Start development server"
echo "  npm run tauri:build  # Build for production"
echo "  npm run dev          # Start Vite dev server only"
echo ""
echo "📚 For more information, see TAURI_INTEGRATION.md"
