# Zen Build Suite

A modern, zen-focused browser experience built with Tauri and powered by Chrome/Chromium browser engine.

## 🚀 Features

- **Real Chrome/Chromium Browser Engine**: Full browser rendering with hardware acceleration
- **Tauri Integration**: Native desktop app with system integration
- **Modern Web Standards**: Complete HTML5, CSS3, and JavaScript ES2023+ support
- **Zen-Focused UI**: Clean, distraction-free browsing experience
- **Mindfulness Tools**: Built-in breathing timers, ambient sounds, and focus modes
- **Reading Tools**: Text-to-speech, auto-scroll, and word count features
- **AI-Powered Features**: Content filtering and smart recommendations

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Rust with Tauri 2.0
- **Browser Engine**: Chrome/Chromium with full JavaScript V8 support
- **UI Framework**: shadcn/ui, Tailwind CSS, Framer Motion
- **System Integration**: Native desktop capabilities via Tauri

## 📦 Installation

### Prerequisites

- Rust and Cargo
- Node.js 18+ and npm
- System dependencies (see setup script)

### Quick Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd zen-build-suite

# Run the setup script
./scripts/setup.sh

# Start development
npm run tauri:dev
```

### Manual Setup

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js (Linux)
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo dnf install nodejs npm

# Install system dependencies (Linux)
sudo dnf install gcc gcc-c++ make pkg-config webkit2gtk3-devel openssl-devel

# Install project dependencies
npm install
npm install -g @tauri-apps/cli
```

## 🎮 Development Commands

```bash
npm run tauri:dev    # Start Tauri development server
npm run tauri:build  # Build production app
npm run dev          # Start Vite dev server only
npm run build        # Build frontend only
npm run lint         # Run ESLint
```

## 🌐 Browser Engine Capabilities

The integrated Chrome/Chromium engine provides:

- **WebGL 2.0 & WebGPU**: Hardware-accelerated 3D graphics
- **WebRTC**: Real-time communication
- **WebAssembly**: High-performance code execution
- **Service Workers**: Background processing
- **Web APIs**: Notifications, Geolocation, Camera, Microphone
- **Modern JavaScript**: ES2023+ support with V8 engine

## 📚 Documentation

- [Tauri Integration Guide](./TAURI_INTEGRATION.md) - Detailed setup and configuration
- [Tauri Documentation](https://tauri.app/) - Official Tauri docs
- [Chrome/Chromium Documentation](https://chromium.org/) - Browser engine docs

## 🎯 Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   └── hooks/             # Custom React hooks
├── src-tauri/             # Rust backend
│   ├── src/main.rs        # Main Rust application
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── scripts/               # Setup and utility scripts
└── public/                # Static assets
```

## 🚀 Deployment

### Development
```bash
npm run tauri:dev
```

### Production Build
```bash
npm run tauri:build
```

The built application will be available in `src-tauri/target/release/` or `src-tauri/target/debug/` depending on the build type.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Lovable Project**: https://lovable.dev/projects/254188fe-8712-48ee-9dea-7b059b7af2f6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/254188fe-8712-48ee-9dea-7b059b7af2f6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/254188fe-8712-48ee-9dea-7b059b7af2f6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
