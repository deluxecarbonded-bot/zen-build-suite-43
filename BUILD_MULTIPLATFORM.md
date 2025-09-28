# Building Serenity Browser for Multiple Platforms

This guide explains how to build and package Serenity Browser for Windows, macOS, and Linux platforms.

## Prerequisites by Platform

### Windows
1. **Node.js** (v16 or later)
2. **Rust** (latest stable version)
3. **Visual Studio Build Tools** or **Visual Studio Community**
   - Install "C++ build tools" workload
   - Include Windows 10/11 SDK
4. **Edge WebView2 Runtime** (usually pre-installed on Windows 10/11)

### macOS
1. **Node.js** (v16 or later)
2. **Rust** (latest stable version)
3. **Xcode** or **Xcode Command Line Tools**
4. **WebKit** (system provided)

### Linux (Ubuntu/Debian)
1. **Node.js** (v16 or later)
2. **Rust** (latest stable version)
3. **System dependencies**:
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.0-dev \
     build-essential \
     curl \
     wget \
     libssl-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

## Install Rust and Tauri CLI

```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add Rust to PATH (restart terminal after installation)
source $HOME/.cargo/env

# Install Tauri CLI
cargo install tauri-cli
```

## Building the Application

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies (optional - will be done automatically)
cd src-tauri
cargo fetch
cd ..
```

### 2. Build for Development
```bash
# Run in development mode
npm run tauri dev

# Or using Tauri CLI directly
cargo tauri dev
```

### 3. Build for Production

#### Build for Current Platform
```bash
# Build for the current platform
npm run tauri build

# Or using Tauri CLI directly
cargo tauri build
```

#### Cross-Platform Building
```bash
# Build for specific target (from any platform)
cargo tauri build --target x86_64-pc-windows-msvc    # Windows
cargo tauri build --target x86_64-apple-darwin       # macOS Intel
cargo tauri build --target aarch64-apple-darwin      # macOS Apple Silicon
cargo tauri build --target x86_64-unknown-linux-gnu  # Linux
```

## Package Outputs by Platform

### Windows Packages
Located in: `src-tauri/target/release/bundle/`

1. **NSIS Installer (.exe)**
   - **File**: `Serenity Browser_0.1.0_x64-setup.exe`
   - **Type**: Setup.exe installer with wizard
   - **Features**: Customizable installation, auto-updater support

2. **MSI Installer**
   - **File**: `Serenity Browser_0.1.0_x64_en-US.msi`
   - **Type**: Windows Installer Package
   - **Features**: Enterprise deployment, Group Policy support

3. **Portable Executable**
   - **File**: `Serenity Browser.exe`
   - **Type**: Standalone executable
   - **Location**: `src-tauri/target/release/`

### macOS Packages
Located in: `src-tauri/target/release/bundle/`

1. **DMG Installer**
   - **File**: `Serenity Browser_0.1.0_x64.dmg`
   - **Type**: Disk image with drag-to-install
   - **Features**: Custom background, app positioning

2. **App Bundle**
   - **File**: `Serenity Browser.app`
   - **Type**: macOS application bundle
   - **Location**: `src-tauri/target/release/bundle/macos/`

### Linux Packages
Located in: `src-tauri/target/release/bundle/`

1. **DEB Package**
   - **File**: `serenity-browser_0.1.0_amd64.deb`
   - **Type**: Debian/Ubuntu package
   - **Features**: System integration, dependency management

2. **AppImage**
   - **File**: `Serenity Browser_0.1.0_amd64.AppImage`
   - **Type**: Portable application
   - **Features**: Run anywhere, no installation required

3. **RPM Package** (if configured)
   - **File**: `serenity-browser-0.1.0-1.x86_64.rpm`
   - **Type**: Red Hat/Fedora package

## Native Web Engine by Platform

### Windows - Edge WebView2
- **Engine**: Microsoft Edge WebView2
- **Features**: Hardware acceleration, native Windows integration
- **Auto-installation**: WebView2 runtime bundled with installer

### macOS - WebKit
- **Engine**: System WebKit
- **Features**: Native macOS integration, optimized performance
- **System Integration**: Uses system's Safari engine

### Linux - WebKitGTK
- **Engine**: WebKitGTK
- **Features**: GTK integration, hardware acceleration
- **Dependencies**: Automatically handled by package managers

## Build Commands Summary

```bash
# Development
npm run tauri dev

# Production build (current platform)
npm run tauri build

# Cross-compilation examples
cargo tauri build --target x86_64-pc-windows-msvc
cargo tauri build --target x86_64-apple-darwin
cargo tauri build --target x86_64-unknown-linux-gnu

# Clean build cache
cargo clean
npm run tauri build
```

## Distribution Requirements

### Windows
- **OS**: Windows 10 (1803+) or Windows 11
- **Architecture**: x64
- **Runtime**: Edge WebView2 (bundled)
- **Storage**: 200MB free space

### macOS
- **OS**: macOS 10.13 (High Sierra) or later
- **Architecture**: x64 or ARM64 (Apple Silicon)
- **Runtime**: System WebKit
- **Storage**: 150MB free space

### Linux
- **OS**: Ubuntu 18.04+, Debian 10+, Fedora 32+
- **Architecture**: x64
- **Runtime**: WebKitGTK 2.40+
- **Storage**: 180MB free space

## Code Signing

### Windows
```bash
# Sign the executable (requires certificate)
signtool sign /f certificate.p12 /p password /t http://timestamp.url "Serenity Browser.exe"
```

### macOS
```bash
# Sign the app bundle (requires Apple Developer account)
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" "Serenity Browser.app"
```

### Linux
```bash
# GPG signing for repositories
gpg --armor --detach-sign serenity-browser_0.1.0_amd64.deb
```

## Troubleshooting

### Cross-Platform Issues
1. **Missing target toolchain**:
   ```bash
   rustup target add x86_64-pc-windows-msvc
   rustup target add x86_64-apple-darwin
   rustup target add x86_64-unknown-linux-gnu
   ```

2. **Platform-specific dependencies**:
   - Windows: Ensure Visual Studio Build Tools
   - macOS: Install Xcode Command Line Tools
   - Linux: Install webkit2gtk development packages

3. **Build failures**:
   ```bash
   # Clean and rebuild
   cargo clean
   npm run tauri build
   ```

## Automated CI/CD

### GitHub Actions Example
```yaml
name: Build Multi-Platform
on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: dtolnay/rust-toolchain@stable
      
      - name: Install dependencies (Linux)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt update
          sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
      
      - run: npm install
      - run: npm run tauri build
      
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.platform }}-build
          path: src-tauri/target/release/bundle/
```

This configuration enables building setup.exe installers for Windows and native packages for all major operating systems.