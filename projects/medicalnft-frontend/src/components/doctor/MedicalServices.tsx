import React, { useState, useEffect } from "react";
import * as algokit from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { getAlgodConfigFromViteEnvironment } from "../../utils/network/getAlgoClientConfigs";
import NFTForm from "../NFTForm";
import * as methods from "../../methods";
import { NftContractClient, NftContractFactory } from "../../contracts/NFTContract";
import MethodCall from "../MethodCall";
import "../../css/DoctorDashboard.css"


const MedicalServices: React.FC = () => {
  const [assetName, setAssetName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [patientWallet, setPatientWallet] = useState("");
  const [ipfsCID, setIpfsCID] = useState<string>("");
  const [assetId, setAssetId] = useState<bigint>(0n);
  const [appId, setAppId] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);

  const { activeAccount, activeAddress, transactionSigner: TransactionSigner } = useWallet();

  // Algorand client setup
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });
  useEffect(() => {
    if (TransactionSigner) algorand.setDefaultSigner(TransactionSigner);
  }, [TransactionSigner]);

  // NFT contract factory/client
  const nftFactory = new NftContractFactory({
    algorand: algorand,
    defaultSender: activeAccount?.address,
    defaultSigner: TransactionSigner,
  });

  const nftClient = new NftContractClient({
    appId: appId,
    algorand: algorand,
    defaultSigner: TransactionSigner,
  });

  // Helper to prevent double transactions
  const handleTransaction = async (fn: () => Promise<void>) => {
    if (loading) {
      alert("Please complete the pending wallet transaction first.");
      return;
    }
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  // Store NFT info in localStorage after both asset and app are created
  useEffect(() => {
    if (
      assetId !== 0n &&
      appId !== 0n &&
      activeAddress &&
      ipfsCID
    ) {
      const key = `doctor_nfts_${activeAddress}`;
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      const newEntry = {
        DoctorWalletAddress: activeAddress,
        PatientWalletAddress: patientWallet || "", // Ensure always a string
        assetId: assetId.toString(),
        appId: appId.toString(),
        metadata: `https://ipfs.io/ipfs/${ipfsCID}`,
        createdAt: new Date().toISOString(),
      };
      // Prevent duplicates
      const exists = prev.some(
        (entry: any) =>
          entry.assetId === newEntry.assetId && entry.appId === newEntry.appId
      );
      if (!exists) {
        localStorage.setItem(key, JSON.stringify([...prev, newEntry]));
      }
    }
  }, [assetId, appId, activeAddress, ipfsCID, patientWallet]);

  return (
    <div className="form-card">
      <h2>Create NFT Prescription</h2>
      <label>Asset Name</label>
      <input
        type="text"
        value={assetName}
        onChange={e => setAssetName(e.currentTarget.value)}
        placeholder="Asset Name"
        disabled={loading}
      />
      <label>Unit Name</label>
      <input
        type="text"
        value={unitName}
        onChange={e => setUnitName(e.currentTarget.value)}
        placeholder="Unit Name"
        disabled={loading}
      />
      <label>Patient Wallet Address</label>
      <input
        type="text"
        value={patientWallet}
        onChange={e => setPatientWallet(e.currentTarget.value)}
        placeholder="Patient Wallet Address"
        disabled={loading}
      />
      {/* Print patient wallet address below the input */}
      {patientWallet && (
        <div style={{ margin: "8px 0", color: "#1976d2", fontWeight: "bold" }}>
          Patient Wallet Address: {patientWallet}
        </div>
      )}

      <h3>Upload NFT Metadata</h3>
      <NFTForm onUploadComplete={cid => setIpfsCID(cid)} />

      <MethodCall
        methodFunction={() =>
          handleTransaction(async () => {
            if (!ipfsCID) {
              alert("Upload metadata to IPFS first.");
              return;
            }
            if (!activeAddress) {
              alert("Connect wallet first.");
              return;
            }
            const assetUrl = `https://ipfs.io/ipfs/${ipfsCID}#arc3`;
            const newAssetId = await methods.create(
              algorand,
              activeAddress,
              assetName,
              assetUrl,
              patientWallet,
              unitName
            );
            setAssetId(newAssetId);
            alert("NFT Prescription Created! Asset ID: " + newAssetId.toString());
          })
        }
        text={loading ? "Creating NFT..." : "Create NFT"}
      />

      {assetId !== 0n && (
        <div>
          <strong>Created Asset ID:</strong> {assetId.toString()}
        </div>
      )}

      <MethodCall
        methodFunction={() =>
          handleTransaction(async () => {
            if (assetId === 0n) {
              alert("Create the Asset First!");
              return;
            }
            const createApp = methods.createApplication(
              algorand,
              nftClient,
              nftFactory,
              TransactionSigner,
              activeAddress!,
              assetId,
              setAppId
            );
            const newAppId = await createApp();
            setAppId(newAppId);
            alert("NFT Application Created! App ID: " + newAppId.toString());
          })
        }
        text={loading ? "Creating App..." : "Create NFT Application"}
      />

      {appId !== 0n && (
        <div>
          <strong>Created App ID:</strong> {appId.toString()}
        </div>
      )}
    </div>
  );
};

export default MedicalServices;
