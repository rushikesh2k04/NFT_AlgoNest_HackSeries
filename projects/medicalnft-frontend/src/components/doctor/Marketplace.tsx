import React, { useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import "../../css/DoctorDashboard.css"


// Utility to fetch NFTs from localStorage
function getDoctorNFTsFromLocalStorage(address: string | undefined) {
  if (!address) return [];
  const key = `doctor_nfts_${address}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data) as {
      DoctorWalletAddress: string;
      PatientWalletAddress: string;
      assetId: string;
      appId: string;
      metadata?: string;
      createdAt?: string;
    }[];
  } catch {
    return [];
  }
}

const DoctorMarketplace: React.FC = () => {
  const { activeAddress } = useWallet();
  const [nfts, setNfts] = useState<
    {
      DoctorWalletAddress: string;
      PatientWalletAddress: string;
      assetId: string;
      appId: string;
      metadata?: string;
      createdAt?: string;
    }[]
  >([]);

  useEffect(() => {
    if (activeAddress) {
      setNfts(getDoctorNFTsFromLocalStorage(activeAddress));
    }
  }, [activeAddress]);

  return (
    <div>
      <h2>Your NFT Prescriptions</h2>
      <div>
        {nfts.length === 0 && <div>No NFTs created yet.</div>}
        {nfts.map((nft, idx) => (
          <div
            key={nft.assetId + "_" + nft.appId + "_" + idx}
            style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}
          >
            <div>
              <strong>Doctor Wallet Address:</strong> {activeAddress}
            </div>
            <div style={{ color: "#1976d2", fontWeight: "bold" }}>
              Patient Wallet Address: {nft.PatientWalletAddress || "N/A"}
            </div>
            <div>
              <strong>Asset ID:</strong> {nft.assetId}
            </div>
            <div>
              <strong>App ID:</strong> {nft.appId}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {nft.createdAt
                ? new Date(nft.createdAt).toLocaleString()
                : "N/A"}
            </div>
            {nft.metadata && (
              <div>
                <strong>Metadata:</strong>{" "}
                <a href={nft.metadata} target="_blank" rel="noopener noreferrer">
                  {nft.metadata}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorMarketplace;
