import React, { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import * as algokit from "@algorandfoundation/algokit-utils";
import { getAlgodConfigFromViteEnvironment } from "../../utils/network/getAlgoClientConfigs";
import { optIn } from "../../methods";
import '../../css/PatientDashboard.css';

interface NFT {
  id: bigint;
  name: string;
  metadata?: string;
  encryptedData?: string;
  expiryDate?: string;
  doctorAddress?: string;
}

const PatientMarketplace: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });

  useEffect(() => {
    if (!activeAddress) return;

    const fetchNfts = () => {
      let allEntries: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("doctor_nfts_")) {
          const stored = JSON.parse(localStorage.getItem(key) || "[]");
          allEntries = allEntries.concat(stored);
        }
      }
      const filtered = allEntries.filter(
        (entry) =>
          entry.PatientWalletAddress &&
          activeAddress &&
          entry.PatientWalletAddress.toLowerCase() === activeAddress.toLowerCase() &&
          !entry.optedIn
      );
      const mappedNFTs: NFT[] = filtered.map((entry) => ({
        id: BigInt(entry.assetId),
        name: `Prescription from ${entry.DoctorWalletAddress?.slice(0, 6) ?? "Unknown"}...`,
        metadata: entry.metadata,
        encryptedData: entry.encryptedData,
        expiryDate: entry.expiryDate,
        doctorAddress: entry.DoctorWalletAddress,
      }));
      setNfts(mappedNFTs);
    };

    fetchNfts();
    const interval = setInterval(fetchNfts, 5000);
    return () => clearInterval(interval);
  }, [activeAddress]);

  const handleOptIn = async (assetId: bigint) => {
    if (!activeAddress || !transactionSigner) {
      alert("Please connect your wallet first");
      return;
    }
    setLoading((prev) => ({ ...prev, [assetId.toString()]: true }));
    try {
      await optIn(algorand, transactionSigner, activeAddress, assetId)();
      alert("Successfully opted in to the prescription!");
      updateLocalStorageOptInStatus(assetId, true);
      setNfts(prev => prev.filter(nft => nft.id !== assetId));
    } catch (error) {
      console.error("Error opting in:", error);
      alert("Failed to opt in to the prescription");
    } finally {
      setLoading((prev) => ({ ...prev, [assetId.toString()]: false }));
    }
  };

  const updateLocalStorageOptInStatus = (assetId: bigint, optedIn: boolean) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("doctor_nfts_")) {
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        const updated = stored.map((entry: any) => {
          if (BigInt(entry.assetId) === assetId) {
            return { ...entry, optedIn };
          }
          return entry;
        });
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">
        Available Prescriptions
      </h2>
      <div className="bg-white border-2 border-blue-600 rounded-xl p-8 shadow-lg">
        {nfts.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-lg">
            No prescriptions available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id.toString()}
                className="flex flex-col justify-between bg-blue-50 border border-blue-200 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-lg mb-1">
                    {nft.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mb-2">
                    ID: {nft.id.toString()}
                  </p>
                  {nft.expiryDate && (
                    <p className="text-sm text-blue-700 mb-3">
                      Expires: {nft.expiryDate}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleOptIn(nft.id)}
                  disabled={loading[nft.id.toString()]}
                  className={`mt-4 px-4 py-2 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                    loading[nft.id.toString()]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                  aria-busy={loading[nft.id.toString()]}
                >
                  {loading[nft.id.toString()] ? (
                    <span>
                      <svg className="inline w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="4" fill="none" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Opt In"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMarketplace;
