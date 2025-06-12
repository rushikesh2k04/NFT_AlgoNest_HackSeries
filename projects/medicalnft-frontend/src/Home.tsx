import React, { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useUser } from "./contexts/UserContext";
import { useNavigate } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import "./styles/Home.css";

const Home: React.FC = () => {
  const { setRole, setWalletAddress } = useUser();
  const { activeAccount, activeAddress } = useWallet();
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const navigate = useNavigate();

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal);

  const handleRoleSelection = (role: "doctor" | "patient" | "pharmacy") => {
    setRole(role);
    setWalletAddress(activeAddress || "");
    navigate("/profile");
  };

  useEffect(() => {
    if (activeAddress) {
      setWalletAddress(activeAddress);
    }
  }, [activeAddress, setWalletAddress]);

  
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">&nbsp;&nbsp;&nbsp;&nbsp;MEDICAL NFTs</div>
      </nav>
      <div className="intro-section">
        <h1>Revolutionizing Medical Records with Blockchain Technology</h1>
        <p>
          Secure, transparent, and efficient management of medical records using NFTs on the blockchain
        </p>
      </div>
      <div className="form-card">
        <h2>Select your role to continue</h2>

        <button className="wallet-btn" onClick={toggleWalletModal}>
          Connect with Pera Wallet
        </button>

        {activeAccount && (
          <div className="role-selection">
            <div className="role-option" onClick={() => handleRoleSelection("doctor")}>
              <span className="role-icon">🩺</span>
              <h3>Doctor</h3>
              <p>Create and manage medical record NFTs for your patients</p>
            </div>
            <div className="role-option" onClick={() => handleRoleSelection("patient")}>
              <span className="role-icon">👤</span>
              <h3>Patient</h3>
              <p>Access and manage your medical records securely</p>
            </div>
            <div className="role-option" onClick={() => handleRoleSelection("pharmacy")}>
              <span className="role-icon">🏥</span>
              <h3>Pharmacy</h3>
              <p>View and fulfill medical prescriptions</p>
            </div>
          </div>
        )}

        <p className="note">You'll need to connect your Pera Wallet to proceed</p>
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  );
};

export default Home;
