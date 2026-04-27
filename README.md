# Stellar Payment Lite Workspace

This monorepo contains a lightweight Stellar payment dApp and supporting libraries.

## Main Application

- **Stellar Pay Lite** ([artifacts/stellar-pay](artifacts/stellar-pay/README.md)): A React-based frontend for sending XLM payments on the Stellar Testnet using the Freighter wallet.

## Features

- **Freighter Wallet Support**: Securely sign transactions.
- **Horizon Integration**: Live balance and transaction submission.
- **Modern UI**: Built with React, Vite, and Tailwind CSS.

## Getting Started

To get the main application running:

1. **Install Dependencies**:
   ```bash
   pnpm install --ignore-scripts
   ```

2. **Run Stellar Pay**:
   ```powershell
   $env:PORT=3000; $env:BASE_PATH='/'; pnpm --filter @workspace/stellar-pay dev
   ```

For detailed instructions and screenshots, see the [Stellar Pay README](artifacts/stellar-pay/README.md).
