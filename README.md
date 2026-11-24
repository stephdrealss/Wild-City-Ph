# Wild City PH

A 3D street-life game set in a Port Harcourt-inspired city, where everything you buy is paid in **USDC on Arc Testnet**.

Walk into Mile One Market, greet the sellers in Nigerian Pidgin, price the tomatoes, bargain, walk away, come back, then sign a real USDC payment from your wallet. The seller checks her alert, packs your goods into a nylon and hands it over.

**Play:** https://wild-city-ph.vercel.app

Built with [Arc Studio](https://studio.arc.io).

## Features

- **Real conversations in Pidgin.** You choose what Ada says. Sellers answer what you ask, say "sir" or "ma", greet by the real time of day, and remember you if you walked away and came back.
- **A Naija market.** Garri, tomatoes, pepper, onions, yam, plantain and oranges on the stalls; akara frying, suya on the grill, jollof, dodo, pepper soup and chin chin at the food spots. Every seller has their own price.
- **Bargaining.** Ask the price, make an offer, take a last price or walk away.
- **USDC payments on Arc.** Buying sends a USDC transfer from your wallet. An in-chat receipt tracks it (sign, sending on Arc, paid) with a link to the transaction on the explorer. Goods are only packed and handed over after the payment lands.
- **Visible hand-overs.** The seller packs each item into a nylon, ties it and passes it across; you can taste an orange before you buy.
- **Onchain ownership.** Homes, rides and outfits are NFTs minted with USDC. Properties earn a daily USDC yield. A player marketplace and a weekly leaderboard run on Arc Testnet.
- **City life.** Okada riders with passengers, keke drivers, buses, cars, realistic townspeople, day and night that follow your real clock, and Wild City FM on the radio (or play your own song).

## Tech stack

React, TypeScript, Vite, Tailwind CSS, three.js, wagmi, viem, ConnectKit, Solidity (Foundry, OpenZeppelin 5), Vercel serverless functions.

## Getting started

Prerequisites: [Bun](https://bun.sh) and [Foundry](https://getfoundry.sh).

```bash
bun install
bun run dev
```

| Script | What it does |
|---|---|
| `bun run dev` | Start the game locally |
| `bun run build` | Production build into `dist/` |
| `bun run preview` | Serve the production build |
| `bun run check` | Lint and typecheck |
| `bun run contracts:build` | Compile the Solidity contracts |
| `bun run contracts:test` | Run the contract tests |

### Controls

WASD or arrow keys to move, Shift to run, Space to jump, drag to look around, E to interact, V to ride or get off. On mobile, use the joystick and the on-screen buttons.

## Project layout

```
src/game/      engine, world, characters, market, conversations, voices, music
src/ui/        HUD, chat, phone, radio, shops
src/chain/     contracts, wallet, USDC payments
api/           serverless functions: voice (Pidgin speech), payout (USDC earnings)
contracts/     Solidity contracts and tests
public/models/ characters and animations (.glb)
```

## Smart contracts (Arc Testnet)

| Contract | Address |
|---|---|
| WildCityProperty | `0xae6e416675e1dd9d11b312f5f74b80941f7a152c` |
| WildCityVehicle | `0x1d2d1720595293ea1879142bf9f9b6c21b191af9` |
| WildCityOutfit | `0xc2b46156225881b815c3238a4889b01aa9c023b3` |
| WildCityMarketplace | `0xf95a5ca16cef4e769dc795e088ae9999848c2a1a` |
| WildCityLeaderboard | `0x0bb80dea57228ccd88eaabcabd39721e613a0a07` |
| USDC | `0x3600000000000000000000000000000000000000` |

- **Catalog NFTs** (property, vehicle, outfit) are sold for USDC with per-type supply caps. Purchase proceeds stay in each contract; there is no withdrawal function.
- **Property** proceeds double as the yield pool. Business properties accrue USDC daily (capped at 7 days between claims), and yield earned before a transfer is kept as credit for the seller.
- **Marketplace** is non-custodial and fee-free: USDC goes straight from buyer to seller.
- **Leaderboard** scores are self-reported by the game, rate-limited to once an hour per wallet and capped.

Contract tests are in `contracts/test/` (`bun run contracts:test`).

## Environment variables

Set these in Vercel (or `.env` locally). None are required for the game to run.

| Variable | Purpose |
|---|---|
| `VITE_WILDCITY_PROPERTY`, `VITE_WILDCITY_VEHICLE`, `VITE_WILDCITY_OUTFIT`, `VITE_WILDCITY_MARKET`, `VITE_WILDCITY_LEADERBOARD` | Override the contract addresses above |
| `VITE_MARKET_TREASURY` | Wallet that receives USDC from market purchases |
| `NAIJALINGO_API_KEY` | Turns on Nigerian Pidgin voices (server only) |
| `PAYOUT_PRIVATE_KEY` | Testnet wallet that pays out players' USDC earnings (server only) |

Never commit keys. `.env` files are ignored by git.

## Credits

See [CREDITS.md](CREDITS.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
