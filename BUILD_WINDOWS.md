# Building Serenity Browser for Windows

This guide explains how to build and package Serenity Browser for Windows using the Edge WebView2 engine.

## Prerequisites

### Required Software
1. **Node.js** (v16 or later)
2. **Rust** (latest stable version)
3. **Visual Studio Build Tools** or **Visual Studio Community**
   - Install "C++ build tools" workload
   - Include Windows 10/11 SDK
4. **Edge WebView2 Runtime** (usually pre-installed on Windows 10/11)

### Install Rust and Cargo
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
```bash
# Build the application for Windows
npm run tauri build

# Or using Tauri CLI directly
cargo tauri build
```

## Package Configuration

The application is configured to build the following Windows packages:

### MSI Installer
- **File**: `Serenity Browser_0.1.0_x64_en-US.msi`
- **Type**: Windows Installer Package
- **Features**: Standard Windows installation experience

### NSIS Installer
- **File**: `Serenity Browser_0.1.0_x64-setup.exe`
- **Type**: Nullsoft Scriptable Install System
- **Features**: Customizable installation wizard

## Build Output Location

After building, the packages will be located in:
```
src-tauri/target/release/bundle/
├── msi/
│   └── Serenity Browser_0.1.0_x64_en-US.msi
└── nsis/
    └── Serenity Browser_0.1.0_x64-setup.exe
```

## Build Configuration Details

### Target Platforms
- **Windows x64** only
- Optimized for Windows 10 and Windows 11
- Uses native Edge WebView2 engine

### Bundle Settings
- **Identifier**: `com.serenity.browser.edgewebview2`
- **Publisher**: Serenity Browser Team
- **Category**: Productivity
- **Engine**: Microsoft Edge WebView2

### Edge WebView2 Features
- Hardware acceleration enabled
- GPU rendering optimization
- Native Windows integration
- Smooth scrolling and DirectWrite support

## Troubleshooting

### Common Build Issues

1. **Rust not found**
   ```bash
   # Ensure Rust is installed and in PATH
   rustc --version
   cargo --version
   ```

2. **Visual Studio Build Tools missing**
   - Install Visual Studio Community or Build Tools
   - Ensure C++ build tools are installed

3. **WebView2 Runtime missing**
   ```bash
   # Download from Microsoft
   # https://developer.microsoft.com/en-us/microsoft-edge/webview2/
   ```

4. **Build fails with permission errors**
   - Run terminal as Administrator
   - Check antivirus software interference

### Build Commands Summary

```bash
# Development build
npm run tauri dev

# Production build (creates installers)
npm run tauri build

# Clean build cache
cargo clean
npm run tauri build
```

## Distribution

### System Requirements for End Users
- **OS**: Windows 10 (version 1803+) or Windows 11
- **Architecture**: x64
- **WebView2**: Automatically bundled or uses system version
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 200MB free space

### Installation Notes
- The MSI installer integrates with Windows Programs & Features
- The NSIS installer offers more customization options
- Both installers will install Edge WebView2 if not present
- The application registers itself for .html file associations (optional)

## Security Considerations

- The application uses Edge WebView2 with security optimizations
- Web security is enabled by default in production builds
- Hardware acceleration is enabled for better performance
- No external dependencies required at runtime (except WebView2)

## Next Steps

After successful build:
1. Test the installer on a clean Windows machine
2. Verify Edge WebView2 functionality
3. Check website rendering and performance
4. Test all browser navigation features
5. Validate focus mode and settings functionality

For distribution, consider code signing the executable for enhanced security and user trust.