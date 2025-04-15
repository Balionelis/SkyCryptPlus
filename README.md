<p align="center">
  <a href="https://github.com/Balionelis/SkyCryptPlus/releases" target="_blank">
    <img alt="release" src="https://img.shields.io/github/v/release/Balionelis/SkyCryptPlus?color=green" />
  </a>
  <a href="https://github.com/Balionelis/SkyCryptPlus/releases" target="_blank">
    <img alt="downloads" src="https://img.shields.io/github/downloads/Balionelis/SkyCryptPlus/total?color=purple" />
  </a>
  <a href="https://www.patreon.com/shiiyu" target="_blank">
    <img alt="patreon" src="https://img.shields.io/badge/Support%20on-Patreon-red?logo=patreon" />
  </a>
  <a href="" target="_blank">
    <img alt="codacy" src="https://app.codacy.com/project/badge/Grade/474966301fbd429aa96022c4442744f7" />
  </a>
  <a href="https://github.com/Balionelis/SkyCryptPlus/actions" target="_blank">
    <img alt="CI" src="https://github.com/Balionelis/SkyCryptPlus/workflows/CI/badge.svg" />
  </a>
</p>

<br />
<div align="center">
  <a>
    <img src="https://i.imgur.com/7Gp9Bye.png" alt="Logo" width="100" height="100">
  </a>

<h3 align="center">SkyCrypt+</h3>
  <p align="center">
    <a href="https://github.com/Balionelis/SkyCryptPlus/issues/new/choose">Report Bug</a>
    ·
    <a href="https://github.com/Balionelis/SkyCryptPlus/issues/new/choose">Request Feature</a>
  </p>
</div>

## Overview

SkyCrypt+ is a desktop application for [sky.shiiyu.moe](https://sky.shiiyu.moe/) (SkyCrypt), providing enhanced access to Hypixel SkyBlock profiles. Built with Electron and TypeScript, it offers a seamless desktop experience with additional features.

## Features

- Enhanced UI with custom themes
- Networth display integration
- Auto-refresh capability
- Quick navigation to other Hypixel Skyblock tools
- Cross-platform support (Windows and Linux)

## Download

Get the latest version from the [Releases](https://github.com/Balionelis/SkyCryptPlus/releases) page.

## Available Versions

- **Windows Installer (.exe)** - Standard installation
- **Windows Portable (.exe)** - No installation required, run directly
- **Linux AppImage (.AppImage)** - Run directly without installation
- **Linux Debian Package (.deb)** - Native installation for Debian-based distributions (Ubuntu, Linux Mint, etc.)

## Updating

### Windows and Portable

- Download the latest version from the [Releases](https://github.com/Balionelis/SkyCryptPlus/releases) page and install/run it. Your settings will be preserved.

### Linux AppImage

- Simply download the newest AppImage file and replace your existing one.

### Debian Package (.deb)

- Download the latest .deb file and install it using:
  ```bash
  sudo dpkg -i skycrypt-plus_x.x.x_amd64.deb
  ```
- Or use your system's package manager to install the downloaded file.

## FAQ

### Is this app safe to use?

Yes. SkyCrypt+ is fully open source, and you can review all code in this repository. It only enhances the SkyCrypt website interface and doesn't collect any personal data.

### Why does my antivirus flag it as suspicious?

This is a false positive. The application uses Electron and injects scripts to modify web content, which some security software flags as suspicious behavior. See [FALSEPOSITIVE.md](https://github.com/Balionelis/SkyCryptPlus/blob/main/FALSEPOSITIVE.md) for a detailed explanation.

### Where are configuration files stored?

- **Windows**: `%APPDATA%\SkyCrypt+\config.json`
- **Linux**: `~/.local/share/SkyCrypt+\config.json`

## For Contributors

### Prerequisites

- Node.js 14+ and npm
### Setup

1. Clone the repository

   ```bash
   git clone https://github.com/Balionelis/SkyCryptPlus.git
   cd SkyCryptPlus
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Development

   ```bash
   npm run dev
   ```

4. Testing

   ```bash
   npm test          # Run all tests
   npm run test:ui   # Run tests with UI
   ```

   **Important**: All tests must pass before submitting a pull request. If you encounter any test failures, please resolve them before submitting.

5. Build the application
   ```bash
   npm run build
   npm run package-all    # For Windows and Linux
   npm run package-win    # For Windows only
   npm run package-linux  # For Linux only
   npm run package-deb    # For Debian package only
   ```

## How to Use

1. On first launch, enter your Minecraft username and Hypixel SkyBlock profile name
2. Select your preferred theme
3. The application will load your SkyBlock stats with enhanced UI features

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository and create your feature branch
2. Make your changes and ensure code quality
3. Run the tests (`npm test`) and ensure all tests pass
4. Submit a pull request with a clear description of your changes

**Note**: Pull requests with failing tests will not be accepted until fixed.

## License

**[MIT License](https://github.com/Balionelis/SkyCryptPlus/blob/main/LICENSE)**

## Acknowledgments

- This is an enhanced desktop client for [sky.shiiyu.moe](https://sky.shiiyu.moe/) (SkyCrypt)
- See [CREDITS.md](https://github.com/Balionelis/SkyCryptPlus/blob/main/CREDITS.md) for full attribution
