import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs';
import { createApplication, changeClawBack, emergency_revoke } from '../../revoke_methods';
import { NftRevokeClient, NftRevokeFactory } from "../../contracts/NFTRevoke";

interface Prescription {
  id: bigint;
  name: string;
  metadata?: string;
  expiryDate?: string;
  doctorAddress?: string;
  optedIn?: boolean;
  received?: boolean;
  appId?: bigint;
}

type TransferType = "Doctor" | "Pharmacy";

const PHARMACY_MARKETPLACE_ADDRESS = "PASTE_PHARMACY_MARKETPLACE_ADDRESS_HERE"; // <-- Set this!

const PrescriptionsPage: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [viewedPrescription, setViewedPrescription] = useState<Prescription | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPrescription, setTransferPrescription] = useState<Prescription | null>(null);
  const [transferType, setTransferType] = useState<TransferType | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });
  const revokeFactory = new NftRevokeFactory({ algorand });

  // Fetch prescriptions
  const fetchOptedInPrescriptions = async () => {
    if (!activeAddress) {
      setPrescriptions([]);
      return;
    }
    try {
      let ownedAssetIds: bigint[] = [];
      try {
        const accountInfo = await algorand.account.getInformation(activeAddress);
        ownedAssetIds = (accountInfo.assets || [])
          .filter((a: any) => a.amount > 0)
          .map((a: any) => BigInt(a['asset-id']));
      } catch {
        ownedAssetIds = [];
      }
      let allPrescriptions: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("doctor_nfts_")) {
          const stored = JSON.parse(localStorage.getItem(key) || "[]");
          allPrescriptions = allPrescriptions.concat(stored);
        }
      }
      const filteredPrescriptions = allPrescriptions.filter((prescription) => (
        prescription.optedIn &&
        prescription.PatientWalletAddress?.toLowerCase() === activeAddress.toLowerCase()
      ));
      const formattedPrescriptions: Prescription[] = filteredPrescriptions.map((prescription) => ({
        id: BigInt(prescription.assetId),
        name: `Prescription from ${prescription.DoctorWalletAddress?.slice(0, 6) ?? "Unknown"}...`,
        metadata: prescription.metadata,
        expiryDate: prescription.expiryDate,
        doctorAddress: prescription.DoctorWalletAddress,
        optedIn: prescription.optedIn,
        received: ownedAssetIds.includes(BigInt(prescription.assetId)),
        appId: prescription.appId ? BigInt(prescription.appId) : undefined
      }));
      setPrescriptions(formattedPrescriptions);
    } catch (error) {
      setPrescriptions([]);
    }
  };

  useEffect(() => {
    fetchOptedInPrescriptions();
    const interval = setInterval(fetchOptedInPrescriptions, 5000);
    return () => clearInterval(interval);
  }, [activeAddress]);

  // Handle view modal
  const handleView = (prescription: Prescription) => {
    setViewedPrescription(prescription);
    setShowViewModal(true);
  };

  // Handle transfer modal
  const handleTransfer = (prescription: Prescription) => {
    setTransferPrescription(prescription);
    setTransferType(null);
    setRecipientAddress('');
    setScheduleDate('');
    setScheduleTime('');
    setShowTransferModal(true);
  };

  // Handle transfer confirmation
  const handleTransferConfirm = async () => {
    if (!transferPrescription || !transferType || !recipientAddress || !scheduleDate || !scheduleTime) {
      alert("Please fill all fields.");
      return;
    }
    if (!activeAddress || !transactionSigner) {
      alert("Connect your wallet first.");
      return;
    }
    setIsTransferring(true);

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const now = new Date();
    const delay = scheduledDateTime.getTime() - now.getTime();
    const expiryDate = new Date(scheduledDateTime.getTime() + 60 * 60 * 1000); // 1 hour access

    const doTransfer = async () => {
      try {
        if (transferType === "Pharmacy") {
          // Use revoke logic for pharmacy marketplace transfer
          if (!transferPrescription.appId) {
            alert("No application ID found for this prescription.");
            setIsTransferring(false);
            return;
          }
          const revokeClient = new NftRevokeClient({
            algorand,
            appId: transferPrescription.appId,
            defaultSigner: transactionSigner
          });
          await emergency_revoke(
            algorand,
            revokeClient,
            transactionSigner,
            activeAddress, // sender must be manager
            transferPrescription.id
          )();
          // Update localStorage for pharmacy lookup
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("doctor_nfts_")) {
              const stored = JSON.parse(localStorage.getItem(key) || "[]");
              const updated = stored.map((entry: any) => {
                if (BigInt(entry.assetId) === transferPrescription.id) {
                  return {
                    ...entry,
                    transferredTo: PHARMACY_MARKETPLACE_ADDRESS,
                    expiryDate: expiryDate.toISOString(),
                  };
                }
                return entry;
              });
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
          alert("NFT transferred to pharmacy marketplace!");
          setShowTransferModal(false);
        } else {
          // Doctor transfer logic (grant access)
          let newAppId: bigint = 0n;
          await createApplication(
            algorand,
            undefined as any,
            revokeFactory,
            transactionSigner,
            activeAddress,
            transferPrescription.id,
            (id) => { newAppId = id; }
          )();
          await changeClawBack(
            algorand,
            transactionSigner,
            newAppId,
            activeAddress,
            transferPrescription.id
          )();
          const endsAt = BigInt(Math.floor(expiryDate.getTime() / 1000));
          const revokeClient = new NftRevokeClient({
            algorand,
            appId: newAppId,
            defaultSigner: transactionSigner
          });
          await revokeClient.send.grantAccess({
            args: [recipientAddress, endsAt],
            sender: activeAddress,
            assetReferences: [transferPrescription.id],
            signer: transactionSigner
          });
          // Update localStorage for doctor lookup
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("doctor_nfts_")) {
              const stored = JSON.parse(localStorage.getItem(key) || "[]");
              const updated = stored.map((entry: any) => {
                if (BigInt(entry.assetId) === transferPrescription.id) {
                  return {
                    ...entry,
                    transferredTo: recipientAddress,
                    expiryDate: expiryDate.toISOString(),
                    appId: newAppId.toString(),
                  };
                }
                return entry;
              });
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
          alert("NFT transfer (revoke app) complete!");
          setShowTransferModal(false);
        }
      } catch (err) {
        alert("Transfer failed: " + err);
      } finally {
        setIsTransferring(false);
      }
    };

    if (delay > 0) {
      setTimeout(doTransfer, delay);
      alert(`Transfer scheduled for ${scheduledDateTime.toLocaleString()}`);
      setShowTransferModal(false);
      setIsTransferring(false);
    } else {
      await doTransfer();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Prescriptions</h2>
      <div className="border-2 border-blue-600 rounded-lg p-6 bg-white">
        {prescriptions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            You haven't opted into any prescriptions yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id.toString()}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{prescription.name}</h3>
                <p className="text-sm text-gray-600 mb-1">ID: {prescription.id.toString()}</p>
                {prescription.expiryDate && (
                  <p className="text-sm text-gray-600 mb-3">Expires: {prescription.expiryDate}</p>
                )}
                {prescription.received ? (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs mb-2">
                    Received
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs mb-2">
                    Opted-in, waiting for asset
                  </span>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleView(prescription)}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleTransfer(prescription)}
                    className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && viewedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Prescription Metadata</h3>
            <div className="mb-4">
              <p><strong>ID:</strong> {viewedPrescription.id.toString()}</p>
              <p><strong>Name:</strong> {viewedPrescription.name}</p>
              {viewedPrescription.metadata && (
                <p><strong>Metadata:</strong> {viewedPrescription.metadata}</p>
              )}
              {viewedPrescription.expiryDate && (
                <p><strong>Expires:</strong> {viewedPrescription.expiryDate}</p>
              )}
              {viewedPrescription.doctorAddress && (
                <p><strong>Doctor Address:</strong> {viewedPrescription.doctorAddress}</p>
              )}
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-3 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && transferPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">Transfer Prescription</h3>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Transfer To</label>
              <select
                value={transferType || ''}
                onChange={e => setTransferType(e.target.value as TransferType)}
                className="w-full p-2 border border-gray-300 rounded-md mb-3"
              >
                <option value="" disabled>Choose...</option>
                <option value="Doctor">Doctor</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
              {transferType && (
                <>
                  <label className="block mb-2 font-medium">
                    {transferType} Wallet Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={e => setRecipientAddress(e.target.value)}
                    placeholder={`Enter ${transferType} Wallet Address`}
                    className="w-full p-2 border border-gray-300 rounded-md mb-3"
                  />
                </>
              )}
              <label className="block mb-2 font-medium">Schedule Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-3"
              />
              <label className="block mb-2 font-medium">Schedule Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-3"
              />
            </div>
            <button
              onClick={handleTransferConfirm}
              disabled={
                isTransferring ||
                !transferType ||
                !recipientAddress ||
                !scheduleDate ||
                !scheduleTime
              }
              className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                isTransferring
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {isTransferring ? "Transferring..." : "Confirm Transfer"}
            </button>
            <button
              onClick={() => setShowTransferModal(false)}
              className="w-full mt-3 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage;
