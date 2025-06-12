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
