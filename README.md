# 🍽️ The Royal Spice Bistro - Customer Loyalty, QR Scratch & Google Review Platform

A full-featured, mobile-first web application designed for restaurants, cafes, and dining spaces. Built with a bright, appetizing, modern UI/UX, hardware anti-cheat device verification, interactive canvas scratch cards, a 6-stamp loyalty cycle, smart AI-assisted Google Reviews, and an intuitive Admin Management Portal.

---

## 🌟 Key Features

### 1. 📲 Table QR Scan & Auto-Login Flow
- Each dining table has a unique QR code (e.g. `http://localhost:3000/?table=Table%204`).
- **Old Customers:** Browser device fingerprint instantly recognizes the returning customer. Greets them automatically (`Welcome back, Rohit! 🎉`) without having to re-enter anything.
- **New Customers:** Clean, bright registration modal requesting **Mobile Number (+91)**, **Full Name**, **Date of Birth** (for birthday rewards), and **Locality/Address**.

### 2. 🔒 Strict Anti-Cheat Device Protection (1 Device = 1 Account)
- Uses multi-entropy device fingerprinting (Canvas hash + WebGL hardware info + screen metrics + persistent token).
- **Fraud Prevention:** If a diner attempts to register a *different* phone number on the same physical phone/browser to game the system, the server detects the duplicate device and blocks it (`409 Conflict`), alerting them with the original linked account.

### 3. 🎁 Interactive Canvas Scratch Card (Web Audio + Confetti)
- Real HTML5 Canvas metallic glitter scratch surface with touch & mouse drag physics.
- Real-time scratch progress detection (auto-reveals at 38%+ scratched).
- Audio sound effects synthesized with Web Audio API (scratch friction noise, victory fanfare chime, gentle retry chime).
- Confetti explosion upon winning a coupon.
- Dynamic reward probability engine:
  - Instant Discounts (e.g., 15% OFF)
  - Free Items & Drinks (e.g., Free Mocktail, Sizzling Brownie)
  - Flat Cashback (e.g., ₹100 Off)
  - **"Better Luck Next Time" 🍀 (Waste):** Friendly message and reminder that their stamp has still been added toward the grand prize!

### 4. 🏆 6-Stamp Loyalty Progress & 50% Grand Bumper Offer
- Visual 6-stamp loyalty tracker with animated completion checkmarks and progress bar:
  - Stamp 1: Starter Perk
  - Stamp 2: Drink Perk
  - Stamp 3: Dessert Perk
  - Stamp 4: Snack Perk
  - Stamp 5: VIP Perk
  - **Stamp 6 (Grand Finale):** Unlocks the **VIP MEGA BUMPER OFFER: FLAT 50% OFF** (`ROYAL-BUMPER-50-XXXX`)!
- Customers can use their bumper code on their next visit.

### 5. 🤖 Smart AI-Powered Google Review Assistant
- Interactive 1 to 5 Star Rating widget.
- **Dynamic AI Suggestions:**
  - 5 Stars: Generates rich, authentic praises focusing on flavors, chef specials, quick service, and atmosphere.
  - 4 Stars: Generates balanced positive reviews praising food quality and generous portions.
  - 1-3 Stars: Generates constructive suggestions + reveals an **Optional Private Manager Resolution Box** so management can solve the customer's grievance directly before they post publicly!
- **1-Click Copy & Open:** Copies the chosen review text directly to the user's clipboard and opens the restaurant's official Google Maps review submission link in a new tab.

### 6. 🌟 Attached Google Review Profile Board
- Official Google Business style badge: **4.9 ★★★★★ Rating (1,480+ Reviews)**.
- Live real-time feed of verified customer reviews displaying reviewer name, star count, and comments.

### 7. 🛡️ Comprehensive Restaurant Admin Dashboard (`/admin.html`)
- **Real-Time Analytics:** Total dinings, stamps issued, 50% bumper winners, coupons won vs. redeemed.
- **Customer CRM Table:** Search by name/phone, view device fingerprints, adjust stamps (+1 / -1), redeem coupon codes, or start fresh stamp cycles.
- **Scratch Card Probability Manager:** Add/edit rewards, change probability percentages, toggle active status.
- **6th Stamp Mega Offer Configurator:** Customize discount amount, coupon code, validity, and terms.
- **Table QR Standee Station:** Select Table 1 to 10 or Counter, view high-res QR code, and click **Print Table Standee** to print physical tabletop tent cards directly!
- **Restaurant Profile Settings:** Update restaurant name, contact, tagline, and Google Maps review URL.

---

## 🚀 How to Run

1. Navigate to the project directory:
   ```bash
   cd "C:\Users\adity\.gemini\antigravity\scratch\restaurant-loyalty-app"
   ```

2. Start the application:
   ```bash
   npm start
   ```

3. Open in your browser:
   - **Customer Mobile Experience:** [http://localhost:3000](http://localhost:3000) (or `http://localhost:3000/?table=Table%204`)
   - **Restaurant Admin Portal:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🧪 Automated Test Suite

Run the full end-to-end verification script:
```bash
node test_api.js
```
All 10 test scenarios (anti-cheat verification, registration, auto-login, 6-stamp progression, mega reward trigger, AI reviews, QR generator, admin stats) run automatically and output pass results.
