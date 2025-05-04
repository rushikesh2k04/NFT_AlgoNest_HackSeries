import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@txnlab/use-wallet-react';
import NFTForm from '../components/NFTForm';
import * as algokit from '@algorandfoundation/algokit-utils';
import * as methods from '../methods';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';
import { FileText, AlertTriangle } from 'lucide-react';

const MedicalServicesPage: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [assetId, setAssetId] = useState<bigint>(0n);
  const [unitaryPrice, setUnitaryPrice] = useState<bigint>(0n);
  const [assetname, setAssetname] = useState<string>('');
  const [int_quantity, setInt_quantity] = useState<bigint>(1n);
  const [int_decimals, setInt_decimals] = useState<number>(0);
  const [ipfsCID, setIpfsCID] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });
  const navigate = useNavigate();

  useEffect(() => {
    if (transactionSigner) algorand.setDefaultSigner(transactionSigner);
  }, [transactionSigner, algorand]);

  const handleCreateNFT = async () => {
    if (!ipfsCID) {
      alert('Please upload metadata to IPFS first');
      return;
    }

    setIsCreating(true);
    setSuccess(false);

    try {
      const assetUrl = `https://ipfs.io/ipfs/${ipfsCID}#arc3`;
      const newAssetId = await methods.create(
        algorand,
        activeAddress!,
        int_quantity,
        int_decimals,
        assetname,
        assetUrl
      );

      const creationDate = new Date().toLocaleString();

      const nftData = {
        assetId: newAssetId.toString(),
        assetName: assetname,
        unitaryPrice: unitaryPrice,
        assetUrl,
        creationDate
      };

      navigate('/marketplace', { state: { nftData } }); // ✅ Navigate to MarketplacePage with state

    } catch (error) {
      console.error('Error creating NFT:', error);
      alert('Failed to create NFT. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!activeAddress) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-16 w-16 mx-auto text-warning-500" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Wallet Connection Required</h2>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          Please connect your wallet from the Profile page to create medical record NFTs.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medical Record NFT Creation</h1>
        <p className="text-gray-600">Mint your medical records as NFTs with secure metadata</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary-500" />
          Asset Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
            <input
              type="text"
              value={assetname}
              onChange={(e) => setAssetname(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unitary Price (ALGO)</label>
            <input
              type="number"
              value={(unitaryPrice / 1_000_000n).toString()}
              onChange={(e) => setUnitaryPrice(BigInt(e.target.valueAsNumber || 0) * 1_000_000n)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Medical Record Metadata</h2>
        <NFTForm onUploadComplete={(cid) => setIpfsCID(cid)} />
      </div>

      <div className="flex justify-center mt-8 mb-4">
        <button
          onClick={handleCreateNFT}
          disabled={!ipfsCID || isCreating || !assetname}
          className={`px-6 py-3 rounded text-white ${ipfsCID && assetname && !isCreating ? 'bg-blue-600' : 'bg-gray-400'}`}
        >
          {isCreating ? 'Creating NFT...' : 'Create NFT'}
        </button>
      </div>
    </div>
  );
};

export default MedicalServicesPage;
