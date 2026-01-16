# DebtPal

A secure, offline-first Progressive Web App (PWA) to track personal loans and debts. Built with vanilla HTML/JS and Bootstrap 5.

## Features

-   **Secure**: All data is encrypted locally using AES-GCM with a user-defined PIN.
-   **Offline First**: Works completely offline using a Service Worker.
-   **Multi-Ledger**: Create separate ledgers for different groups (e.g., Personal, Work).
-   **Cloud Sync & Restore**: Backup and sync your data across devices using GitHub Gists.
-   **PWA**: Installable on Android and iOS. Includes shortcuts for "Borrow" and "Repay".
-   **Native Feel**: Persistent login, smooth navigation, and keyboard support.
-   **Theming**: Full Light and Dark mode support (auto-detect or manual override).

## Usage

1.  **First Run**: Set a 6-digit PIN. This PIN is used to encrypt your data. **Do not forget it.**
2.  **Dashboard**:
    *   Manage Ledgers (Add, Rename, Delete).
    *   Add people you lend to or borrow from.
    *   View Total Balance and individual debts.
3.  **Transactions**:
    *   Click on a person to view their history.
    *   Use "Borrow" (Red) when you take money.
    *   Use "Repay" (Blue) when you pay back or lend money.
4.  **Settings**:
    *   Change currency symbol (default: $).
    *   Toggle themes (System, Light, Dark).
    *   **Cloud Sync**: Generate a GitHub Personal Access Token (with `gist` scope) to backup and restore data.
    *   Change PIN (Re-encrypts data).
    *   Export/Import backups manually.
    *   Reset App (Wipe Data).

## Cloud Sync & Restore

To sync data across devices:
1.  **Device A**: Go to Settings -> Enter GitHub Token -> Save. (This creates a backup).
2.  **Device B**: Install App -> Set **SAME PIN** -> Settings -> Enter **SAME GitHub Token** -> Click **"☁️ Restore"**.

## Installation

### Local Development
1.  Clone the repository.
2.  Serve the folder using a local web server (e.g., `python3 -m http.server` or VS Code Live Server).
    *   *Note: Service Workers require HTTPS or localhost.*

### Production
Deploy the files to any static host:
-   GitHub Pages
-   Netlify
-   Vercel

## Technical Details

-   **Framework**: Vanilla JS, Bootstrap 5.3 (Color Modes).
-   **Storage**: `localStorage` (encrypted JSON blob).
-   **Encryption**: Web Crypto API (PBKDF2 + AES-GCM).
-   **Routing**: Multi-page with `sessionStorage` for persistent authentication.

## Resetting

If you forget your PIN, you must reset the app, which **deletes all local data**.
-   Click "Forgot PIN? Reset App" on the lock screen.
-   Or navigate to `/reset.html` manually.
