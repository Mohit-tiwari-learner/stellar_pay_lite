# Stellar Pay

A simple Stellar **testnet** payment dApp built with React, Tailwind CSS, the Stellar SDK and the Freighter wallet.

## Features

- Connect / disconnect Freighter wallet
- Detects whether Freighter is installed and surfaces a clear install prompt
- Persists the connected address across reloads (when the user already approved access)
- Fetches and displays the live XLM balance from Horizon (testnet)
- Sends XLM payments signed via Freighter
- Shows the transaction hash, with a one-click link to Stellar Expert
- Friendly error handling for unfunded accounts (with Friendbot link), invalid addresses, and Horizon failures

## Tech Stack

- **React + Vite** (TypeScript)
- **Tailwind CSS** for styling
- **@stellar/stellar-sdk** for transaction building / Horizon access
- **@stellar/freighter-api** for wallet integration

## Project Structure

```
src/
├── components/
│   ├── WalletConnect.tsx   # Connect / disconnect UI
│   ├── Balance.tsx         # XLM balance card
│   └── SendPayment.tsx     # Send XLM form + result feedback
├── utils/
│   └── stellar.ts          # Horizon server + helper functions
├── App.tsx                 # Layout + wallet state
└── index.css               # Tailwind theme
```

## Getting Started

```bash
pnpm install
pnpm --filter @workspace/stellar-pay dev
```

Then open the preview. You'll need the [Freighter browser extension](https://freighter.app/) and a Stellar **testnet** account funded via [Friendbot](https://friendbot.stellar.org/).

## How it Works

1. **Connect** — the app calls Freighter's `requestAccess()` to obtain the user's public key.
2. **Balance** — the app queries Horizon (`https://horizon-testnet.stellar.org`) using `loadAccount()` and reads the `native` balance.
3. **Send** — a payment operation is built with the Stellar SDK, signed by Freighter via `signTransaction()` on the testnet passphrase, and submitted back to Horizon.
4. **Feedback** — on success, the transaction hash and a Stellar Expert link are shown. On failure, the Horizon error (including `result_codes` when available) is surfaced.

## Screenshots

_Placeholder — add screenshots of the connect, balance, and send flows here._

- `docs/connect.png`
- `docs/balance.png`
- `docs/send.png`

## Notes

- This dApp targets **Stellar testnet only** (network passphrase `Test SDF Network ; September 2015`).
- Freighter must be set to the **Test Network** in its settings for signing to succeed.
