# 🏥 Medical NFT – Prescription as a Token

**Medical NFT** is a decentralized application that enables doctors to mint verifiable prescriptions as NFTs (Non-Fungible Tokens) on the **Algorand blockchain**. By leveraging smart contracts written in **PyTeal** and a frontend built with **React.js + algosdk**, the platform ensures **secure**, **tamper-proof**, and **traceable** delivery of medical prescriptions.

---

## 🚀 Features

### ✅ Doctor-Verified NFT Minting
- Each prescription is minted as an **Algorand Standard Asset (ASA)**.
- Metadata includes:
  - Asset name, title, and description
  - PDF link of the signed prescription
  - Patient’s wallet address
- NFT has a **total supply of 1** and **zero decimals** (indivisible)

### ✅ Secure IPFS Storage
- Prescriptions are uploaded to **IPFS** (e.g., via **Pinata**)
- IPFS hash is embedded in the **ASA metadata**

### ✅ NFT Transfer to Patient
- Automatically transferred to the patient’s wallet after minting

### ✅ Immutable Medical Records
- On-chain, tamper-proof prescription history
- **Doctor identity verification** supported

### ✅ ARC3 Compliant
- Compatible with major **Algorand wallets** for seamless access and sharing

---

## 🔗 Workflow

1. **Doctor Login** – Connect via wallet or organization credentials  
2. **Prescription Upload** – Enter title, description, upload signed PDF, and provide patient wallet address  
3. **NFT Minting** – Upload PDF to IPFS → Embed metadata → Mint NFT on Algorand  
4. **NFT Transfer** – Prescription NFT is automatically sent to the patient’s wallet  
5. **Patient Access** – Patients can view, download, and share prescriptions directly from their wallet  

---

## 💻 Technologies Used

| Layer           | Technology                          |
|----------------|-------------------------------------|
| Blockchain      | Algorand                            |
| Smart Contract  | PyTeal                              |
| ABI Interface   | ARC3                                |
| NFT Minting     | algosdk                             |
| Wallets         | Pera, Defly, Exodus, Daffi Wallets  |
| File Storage    | IPFS / Pinata                       |
| Frontend        | React.js + algosdk                  |
| Security        | Wallet Authentication               |

---

## 📂 Project Structure

/medicalnft-contracts
└── medinft/
    └── contract.py # Smart contract in PyTeal

/medicalnft-frontend
└── src/
    └── pages/
          └── MarketplacePage.tsx
          └── MedicalservicesPage.tsx
└── Home.tsx
└── App.tsx # Main UI for doctors and patients

---

## 🧠 Smart Contract Functions

| Function                       | Description                                        |
|-------------------------------|----------------------------------------------------|
| `create_prescription()`       | Mint a prescription NFT and send it to patient     |
| `delete_prescription()`       | Allow deletion of invalid/expired records (if any) |

---

## 🛠 Prerequisites

- Python + PyTeal for smart contract development
- Node.js + algosdk for frontend development
- Testnet ALGO (from [Algorand Faucet](https://bank.testnet.algorand.network/))
- Wallet setup (Pera Wallet, Defly Wallet, etc.)
- IPFS setup (Pinata, Web3.Storage)

---

## 📦 Installation & Setup

# Clone the repository
git clone https://github.com/rushikesh2k04/Hackseries-medicalNFT.git
cd Hackseries-medicalNFT
## 📊 Future Enhancements
Doctor dashboard with prescription history

Patient dashboard with NFT viewer and access logs

Expiry or revocation mechanism for prescriptions

Integration with pharmacy APIs for direct order placement

## ✨ Author
Rushikesh – Blockchain Developer & Full Stack Engineer
📧 Email: rushikesh9.2004@gmail.com

## 💡 Inspiration
Medical NFT leverages blockchain’s transparency and immutability to redefine how prescriptions are issued and managed. It ensures that patients receive secure, verifiable medical records, while giving doctors a modern, tamper-proof platform for digital prescription management.
