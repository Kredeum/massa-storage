# 🎉 Massa Storage - Decentralized Storage Solution 🎉

This project is a decentralized storage solution that enables users to store and manage files using IPFS through the Massa blockchain.

The main goal of this project is to provide a user-friendly interface for storing files off-chain while leveraging Massa's blockchain capabilities for access control and file management.

🔑 Key Features:

- File Upload: Upload and store files on IPFS
- Collection Management: Create and manage collections of files by registering their cid and metadata to the blockchain
- Moderation System: Approve or reject collections (for moderators)
- IPFS Integration: Pin/unpin files and collections
- User-friendly Interface: Modern SvelteKit-based UI

## ⚙️ Installation Guide

From the root of the project, run:

```shell
pnpm install
```

## 🚀 Running the Application

To start the application:

```shell
pnpm run all
```

This will:

1. Clean any previous builds
2. Install dependencies
3. Start the application using Turbo

## 📁 Project Structure

- `sveltekit/` - Frontend application built with SvelteKit
  - `src/lib/components/` - Reusable UI components
  - `src/lib/ts/` - TypeScript utilities and types
  - `src/lib/runes/` - Svelte stores and state management

## 🛠️ Technologies Used

- Frontend: SvelteKit, TypeScript
- Storage: IPFS (via Kubo)
- Blockchain: Massa Network
- Package Manager: pnpm
- Build Tool: Turbo

## 📝 License

MIT - see LICENSE file for details

## 👥 Contributors

Created by [Kredeum](http://labs.kredeum.com/)
