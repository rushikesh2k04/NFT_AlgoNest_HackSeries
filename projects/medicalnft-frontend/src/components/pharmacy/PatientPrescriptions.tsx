import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs';
import { NftRevokeClient } from '../../contracts/NFTRevoke';
import { emergency_revoke } from '../../revoke_methods';

interface Prescription {
  id: bigint;
  appId: bigint;
  name: string;
  patientAddress: string;
  status: 'active' | 'expired' | 'revoked';
  expiryDate?: string;
}

const PatientPrescriptions: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });

  useEffect(() => {
    if (activeAddress) {
      // TODO: Fetch prescriptions that this pharmacy has access to
      // This would come from your backend or the Algorand indexer
    }
  }, [activeAddress]);

  const handleEmergencyRevoke = async (prescription: Prescription) => {
    if (!activeAddress || !transactionSigner) {
      alert('Please connect your wallet first');
      return;
    }

    const key = `${prescription.id}-${prescription.appId}`;
    setLoading({ ...loading, [key]: true });

    try {
      const revokeClient = new NftRevokeClient({
        appId: prescription.appId,
        algorand,
        defaultSigner: transactionSigner,
      });

      await emergency_revoke(
        algorand,
        revokeClient,
        transactionSigner,
        activeAddress,
        prescription.id
      )();

      alert('Successfully revoked the prescription!');
      // Refresh prescriptions list
      // TODO: Implement refresh logic
    } catch (error) {
      console.error('Error revoking prescription:', error);
      alert('Failed to revoke the prescription');
    } finally {
      setLoading({ ...loading, [key]: false });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Patient Prescriptions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((prescription) => {
          const key = `${prescription.id}-${prescription.appId}`;
          return (
            <div key={key} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">{prescription.name}</h3>
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">ID: {prescription.id.toString()}</p>
                <p className="text-gray-600">Patient: {prescription.patientAddress.slice(0, 8)}...</p>
                {prescription.expiryDate && (
                  <p className="text-gray-600">Expires: {prescription.expiryDate}</p>
                )}
                <div className={`inline-block px-2 py-1 rounded-full text-sm ${
                  prescription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : prescription.status === 'expired'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                </div>
              </div>

              {prescription.status === 'active' && (
                <button
                  onClick={() => handleEmergencyRevoke(prescription)}
                  disabled={loading[key]}
                  className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                    loading[key]
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading[key] ? 'Processing...' : 'Emergency Revoke'}
                </button>
              )}
            </div>
          );
        })}

        {prescriptions.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No prescriptions available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPrescriptions;
