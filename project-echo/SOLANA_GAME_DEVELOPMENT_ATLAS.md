# 🗺️ Solana Game Development Atlas

This document serves as a technical execution roadmap for building, implementing, and deploying the 30 game concepts utilizing a custom Solana token. The games are categorized by **Technical Archetype**, as the underlying engine and deployment strategy define the feasibility of the project more than the genre itself.

---

## 🏗️ Archetype 1: "Lite" Web Games (Next.js PWA)

**Target Platform:** Web Browsers (Desktop & Mobile) via Progressive Web App (PWA).
**Core Engine:** Standard DOM manipulation (React/Next.js) with light canvas elements.
**Best For:** Turn-based strategy, management sims, social games, and UI-heavy experiences.

### 🛠️ Tech Stack

* **Frontend Framework:** Next.js 14+ (App Router).
* **Styling:** Tailwind CSS (Crucial for responsive "mobile-app-like" feel).
* **State Management:** Zustand (lightweight) or TanStack Query.
* **Database:** Supabase (PostgreSQL) for off-chain user data and realtime websocket subscriptions.
* **Solana Integration:**
  * **Wallet Adapter:** `@solana/wallet-adapter-react`.
  * **SDK:** `@solana/web3.js` for transactions.
  * **Program Interaction:** `@coral-xyz/anchor`.

### 🚀 Deployment Strategy

1. **Hosting:** Vercel (easiest/fastest) or AWS Amplify.
2. **Mobile Store Access:** Use **TWA (Trusted Web Activities)**. This allows you to wrap your PWA and publish it to the Google Play Store without rewriting code. Apple App Store is harder for this type (requires "native feel"), so focus on Safari "Add to Home Screen" instructions.
3. **Transactions:** Use "Session Keys" (Gum or similar) so users don't have to sign a popup for every single move.

### 🎮 Game-Specific Implementation Plans

| Game Title | Specific Implementation Roadmap |
| :--- | :--- |
| **8. Prediction Royale** | **Real-Time Sockets:** Use Supabase Realtime to push questions to 100 clients simultaneously.<br>**Smart Contract:** Holds the "Pot". Winner triggers a distribution function. Losers are locally kicked.<br>**Anti-Cheat:** Server-side validation of answers (Next.js API routes) before submission. |
| **4. Chain Reaction Match** | **Logic:** The "Match-3" grid is a React component state array. PvP moves are sent via Websockets.<br>**Betting:** Users sign a "Escrow" transaction before the match starts. Server acts as Oracle to release funds to the winner. |
| **7. Gridlock Traffic** | **Canvas:** Use `react-canvas` or simple SVGs for cars/intersections.<br>**fee logic:** Users pay micro-fees manually or setup a "Gas Tank" deposit. |
| **10. Dao-Tamagotchi** | **Voting:** On-chain voting is expensive. Use "Snapshot-style" off-chain voting (signing messages) stored in DB, then execute one bulk transaction every 24h to update the Pet's stats on-chain. |
| **12. Dyson Sphere Builder** | **Staking:** The "Modules" are SPL Tokens or NFTs staked in a vault program. The "Energy" yield is calculated based on `block.timestamp`. |
| **16. The Grand Bazaar** | **Marketplace:** Build a custom Order Book UI. The "Items" are SFTs (Semi-Fungible Tokens) using the Metaplex Token Standard. |
| **18. Prediction City** | **Oracle:** Use **Pyth Network** or **Switchboard** oracles to fetch real-world SOL prices on-chain to trigger game states (Golden Age vs Dark Age). |
| **27. Trivia Live** | **Streaming:** Integrate a video stream (Twitch/YouTube embed) for the host. The answer buttons are the overlay. Smart Contract creates the prize handling. |
| **29. Pixel War** | **Optimization:** Do NOT make every pixel a transaction. Use a "buffer" account on Solana that holds the colormap data (using `account compression` to save rent). |

---

## 🎨 Archetype 2: "Pro" Web Games (Canvas/WebGL)

**Target Platform:** Desktop Web & Mobile Web.
**Core Engine:** Phaser 3 (2D) or Three.js / React-Three-Fiber (3D).
**Best For:** Action games, physics simulations, and complex visual interactions running in browser.

### 🛠️ Tech Stack

* **Game Engine:**
  * **2D:** Phaser 3 (Robust, industry standard for web games).
  * **3D:** React-Three-Fiber (R3F) - easier integration with React UI overlays.
* **Physics:** Matter.js or Cannon.js.
* **Multiplayer:** **Colyseus** or **Photon** (need low-latency UDP-like behavior over WebSockets).
* **Solana Integration:** Same as Archetype 1, but focusing on *optimistic UI* updates (show the action immediately, reconcile with blockchain later).

### 🚀 Deployment Strategy

* **Hosting:** Vercel/Netlify.
* **Asset Management:** Use a CDN (Cloudfront/R2) for game assets (textures, models).
* **Performance:** Critical. Use "Texture Atlases" and "Object Pooling" in Phaser to maintain 60FPS.

### 🎮 Game-Specific Implementation Plans

| Game Title | Specific Implementation Roadmap |
| :--- | :--- |
| **2. Solana Survivors** | **Engine:** Phaser 3.<br>**Perf:** Enemy swarms must be "Sprites" in a single batch render.<br>**Loot:** Dropped tokens are tallied locally. Actual minting happens only at "Extraction" or "Game Over" to save gas. |
| **5. Physics Bet** | **Engine:** Matter.js + React Canvas.<br>**Verifiability:** The physics simulation must be deterministic so everyone sees the same bridge collapse. Run the sim on the server to verify the result before paying out bets. |
| **14. Asteroid Mining** | **Engine:** React-Three-Fiber for a spinning 3D asteroid.<br>**NFTs:** Mining Rigs are 3D models loaded from IPFS metadata.<br>**Idle Logic:** Calculate earnings on the frontend based on rig stats, verify on backend on claim. |
| **17. Tower Defense DAO** | **Engine:** Phaser 3 (Isometric view).<br>**Co-op:** Use a shared state map. When a Voting Round ends, the server places the towers and broadcasts the "Wave" simulation to all clients. |
| **20. Bullet Hell Bounty** | **Engine:** Phaser 3.<br>**Risk:** High dependency on reflex. Ensure "Cheat Detection" (speed hacks) is running serverside by logging player inputs. |
| **26. Coin Pusher** | **Engine:** Three.js (Physics is key).<br>**RNG:** The "House Edge" and physics variables must be transparent but server-authoritative to prevent client-side manipulation. |
| **28. Gacha Garden** | **Engine:** React-Three-Fiber (Cozy art style).<br>**Growth:** Plants change geometry over time (days). Use "Dynamic NFTs" (Metaplex) that update their metadata image URI as they grow. |

---

## 📱 Archetype 3: Native Mobile Games (Unity/React Native)

**Target Platform:** iOS App Store & Google Play Store.
**Core Engine:** Unity (C#) or React Native (JS).
**Best For:** AR, geolocation, deeply immersive mobile experiences.

### 🛠️ Tech Stack

* **Engine:** **Unity** (Best for AR/3D).
* **Solana SDK:** **Solana SDK for Unity** (open source, robust).
* **Mobile Wallet:** **Solana Mobile Stack (SMS)** for Android (Saga). Deep Linking for iOS (Phantom).
* **AR Library:** AR Foundation (Unity) or Niantic Lightship.

### 🚀 Deployment Strategy (The "Apple Problem")

* **Google Play:** Allows NFT games but requires declaration. IAP policies apply.
* **Apple App Store:** Strict.
  * *Rule:* You cannot unlock features inside the app using a generic crypto payment.
  * *Workaround:* The "Reader App" model. Users buy assets on your **Web Dashboard**. They log into the Mobile App and *use* the assets they own. do NOT put a "Buy" button in the iOS app.
* **Solana Saga dApp Store:** No restrictions. 0% fees. Deploy here first.

### 🎮 Game-Specific Implementation Plans

| Game Title | Specific Implementation Roadmap |
| :--- | :--- |
| **3. Kingdom of Compound** | **Engine:** Unity (2.5D Isometric).<br>**Smart Contract:** Implement "Staking" logic where your troops are locked tokens. "Attacking" calls a steal() function on the victim's vault if you win. |
| **9. Gorgon's Tag** | **Engine:** Unity + AR Foundation + Mapbox SDK.<br>**GPS:** Verify location on device. Use "Proof of Physical Work" logic.<br>**Burn:** The "Burn" is a background service decrementing the token balance in the smart contract state. |
| **23. Quest Guilds** | **Engine:** React Native (UI heavy).<br>**Push Notifs:** Critical for "Quest Completed" alerts.<br>**Logic:** Everything is on-chain. Sending a hero is a transaction. Claiming loot is a transaction. |
| **13. Fleet Commander** | **Engine:** Unity.<br>**Auto-Battler:** The battle logic runs deterministically on both clients. The winner submits the "Battle Log" to the chain for verification. |
| **24. Monster Breeder** | **Engine:** Unity.<br>**Genetics:** The breeding algorithm (e.g., DNA hex codes) lives in the Anchor program. The resulting NFT image is generated via a Cloud Function and uploaded to Arweave. |
| **30. Treasure Hunter AR** | **Engine:** Unity + Niantic Lightship.<br>**Anti-Spoofing:** Critical. Use Niantic's server-side checks to prevent GPS spoofing. "Caches" are Geofenced Anchors. |

---

## 🖥️ Archetype 4: Desktop/Steam Core Games (Unreal/Godot)

**Target Platform:** Windows (Steam / Epic Games).
**Core Engine:** Unreal Engine 5 (High fidelity) or Godot (Open source).
**Best For:** Hardcore gaming, complex simulations, high-performance graphics.

### 🛠️ Tech Stack

* **Engine:** **Unreal Engine 5** (Blueprints + C++).
* **Solana Integration:** **Gameyz SDK** or building a C++ wrapper for Solana RPCs.
* **Auth:** Login via QR Code. The PC game shows a QR, user scans with Mobile Wallet to sign in/transactions.

### 🚀 Deployment Strategy (The "Steam Problem")

* **Steam Policy:** explicitly **BANS** games built on blockchain that issue or allow exchange of crypto/NFTs.
  * *Strategy A:* **Epic Games Store**. They are open to crypto games (e.g., Star Atlas).
  * *Strategy B:* **The "Companion" Model**. The game on Steam has NO crypto code. It reads a standard database. A separate "Web Dashboard" handles the crypto/NFT trading and updates the standard database.
  * *Strategy C:* **Custom Launcher**. Build your own Electron-based launcher to patch and run the game.

### 🎮 Game-Specific Implementation Plans

| Game Title | Specific Implementation Roadmap |
| :--- | :--- |
| **1. Extraction Poker** | **Engine:** Unreal 5.<br>**Mechanic:** FPS gameplay. The "Poker" part is a minigame UI overlay when hacking/looting.<br>**Risk:** If player dies, the server burns their NFT card. High stakes. |
| **6. Meme Coin Hunter** | **Engine:** Unreal 5 (Lumen/Nanite for horror atmosphere).<br>**Asset:** Integration with real Solana meme coin IP (Bonk, Wif, etc.) as enemy models.<br>**Extract:** Reaching the exit calls the `transfer` function to user wallet. |
| **11. Interstellar Hauler** | **Engine:** Unreal 5.<br>**Space Travel:** Realistic physics.<br>**Econ:** Entire economy is on-chain. Prices of goods in different systems are read directly from the Account Data of "Planet" PDAs (Program Derived Addresses). |
| **15. Crypto Civ** | **Engine:** Godot (Great for tile maps).<br>**Dipomacy:** Treaties are Multi-Sig wallets shared between players. War is a vote to dissolve the treaty. |
| **19. Solana Speedsters** | **Engine:** Unreal 5.<br>**Netcode:** Prediction/Rollback netcode needed for racing. Using blockchain for betting only, NOT for vehicle position (too slow). |
| **21. Gladiator Arena** | **Engine:** Unreal 5.<br>**Spectator:** Allow thousands of connections. Betting pool is a Parimutuel betting contract. |
| **22. Dungeon for Hire** | **Engine:** Godot.<br>**Level Editor:** Players build levels locally (JSON). Publishing the level mints it as an NFT, storing the JSON map data on Arweave. |
| **25. Crafting Survival** | **Engine:** Unreal 5.<br>**Inventory:** Hybrid. Common items (wood/stone) are server-db. Rare items (Gold/Guns) are on-chain NFTs. Smelting is a "Burn & Mint" transaction. |
