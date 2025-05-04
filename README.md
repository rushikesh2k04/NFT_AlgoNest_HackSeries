# 🏥 Medical NFT – Prescription as a Token

A decentralized Web3-based platform enabling doctors to securely mint verifiable medical prescriptions as NFTs (Non-Fungible Tokens) and transfer them directly to patients' wallets.

---

## 🔍 Overview

**Medical NFT** transforms the way prescriptions are issued, verified, and shared. Using blockchain and IPFS, this platform ensures secure, tamper-proof, and traceable digital prescriptions that patients can own, access, and share seamlessly.

---

## 🧩 Key Features

- **✅ Doctor Verified NFT Minting**
  - Asset Name (e.g., “Prescription #001”)
  - Title (e.g., “Dr. John’s Prescription for Diabetes”)
  - Description (brief summary)
  - PDF Upload (signed prescription)
  - Patient Wallet Address

- **🔗 Decentralized File Storage**
  - Prescription PDF stored on IPFS
  - IPFS hash embedded in NFT metadata

- **📤 NFT Transfer to Patient**
  - Automatically transferred upon minting
  - Full ownership & access granted to the patient

- **🔒 Secure & Immutable**
  - On-chain record, tamper-proof
  - Doctor identity verified (KYC, digital signature)

- **🔄 Interoperability**
  - Compliant with ARC-3 (Algorand)
  - Compatible with wallets like MetaMask, WalletConnect, and Pera Wallet

---

## 🧠 Use Cases

- Remote consultations  
- Chronic disease prescription tracking  
- Fraud prevention in medical documentation  
- Inter-doctor collaboration  
- Immutable patient prescription history

---

## ⚙️ Tech Stack

| Layer         | Technology                             |
|---------------|-----------------------------------------|
| Frontend      | React.js + Web3.js / Ethers.js          |
| Backend       | Node.js / Express.js                    |
| Smart Contracts | PyTeal (ARC-3) |
| Blockchain    |  Algorand           |
| File Storage  | IPFS (InterPlanetary File System)       |
| Wallets       |  Pera Wallet,Defly wallet,Exodus Wallet,Daffi Wallet    |
| Security      | Signature verification, Wallet Auth     |

---

## 🔁 Workflow

1. **Doctor Login:** Via Web3 wallet or organization credentials  
2. **Input Prescription:** Fill form, upload signed PDF, enter patient wallet address  
3. **Mint NFT:** Prescription stored on IPFS → NFT created with metadata  
4. **Transfer NFT:** Automatically sent to patient’s wallet  
5. **Patient Access:** View/download PDF, or share with other professionals  

---

## ✅ Benefits

- **Tamper-proof:** Immutable blockchain record  
- **One-click Sharing:** Easily forward prescription to pharmacies or specialists  
- **Transparency:** Doctor attribution is verifiable and logged  
- **Ownership:** Patients retain full control of their health data  

---

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- IPFS (e.g., via Pinata or Infura)

### Installation

```bash
git clone https://github.com/rushikesh2k04/Hackseries-medicalNFT.git
cd projects
npm install
