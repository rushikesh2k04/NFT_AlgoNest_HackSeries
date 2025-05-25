import React from 'react';
import { useLocation } from 'react-router-dom';
import './MarketplacePage.css';

const MarketplacePage: React.FC = () => {
  const { state } = useLocation();
  const nftData = state?.nftData;

  if (!nftData) {
    return <div>No NFT Data Available</div>;
  }

  return (
    <div className="marketplace-container">
      <div className="nft-item">
        <h3 className="nft-name">{nftData.assetName}</h3>
        <p className="nft-created">Asset ID:<b> {nftData.assetId}</b></p>
        <p className="nft-created">Created: {nftData.creationDate}</p>

        <div className="nft-actions">
          <p><a href={nftData.assetUrl} target="_blank" rel="noopener noreferrer" className="nft-view-pdf"><b>View IPFS</b></a></p>
          <a
            href={`https://lora.algokit.io/testnet/asset/${nftData.assetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="nft-explorer"
          >
            <b>View NFT on Algorand</b>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
