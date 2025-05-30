// src/components/Home.tsx
import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useEffect, useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import MethodCall from './components/MethodCall'
import * as methods from './methods'
import * as revokeMethods from './revoke_methods'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import NFTForm from './components/NFTForm'
import algosdk from 'algosdk'
import './styles/Home.css'
import { NftContractClient, NftContractFactory } from './contracts/NFTContract'
import { NftRevokeClient, NftRevokeFactory } from './contracts/NFTRevoke'

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const { activeAccount, activeAddress, transactionSigner: TransactionSigner } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const [inputAppId, setInputAppId] = useState("");
  const [inputAssetId, setInputAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<bigint>(BigInt(0))
  const [assetId, setAssetId] = useState<bigint>(0n)
  const [assetname, setassetname] = useState<string>("")
  const [patientwallet, setpatientwallet] = useState<string>("")
  const [unitname, setunitname] = useState<string>("")
  const [ipfsCID, setIpfsCID] = useState<string>("")
    const [revokeAppId, setRevokeAppId] = useState<bigint>(0n)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
  algorand.setDefaultSigner(TransactionSigner)

  const nftFactory = new NftContractFactory({
    algorand: algorand,
    defaultSender: activeAccount?.address,
    defaultSigner: TransactionSigner,
  })

  const nftClient = new NftContractClient({
    appId: BigInt(appId),
    algorand: algorand,
    defaultSigner: TransactionSigner,
  })

  const revokeFactory = new NftRevokeFactory({
    algorand: algorand,
    defaultSender: activeAccount?.address,
    defaultSigner: TransactionSigner,
  })

  const revokeClient = new NftRevokeClient({
    appId: BigInt(revokeAppId), // Placeholder; will be reset after app creation
    algorand,
    defaultSigner: TransactionSigner,
  })

  useEffect(() => {
    if (TransactionSigner) algorand.setDefaultSigner(TransactionSigner)
  }, [TransactionSigner])

  return (
    <div className="home-container">
      <div className="form-card">
        <h1>Welcome to <span className="bold">AlgoKit 🙂</span></h1>
        <p className="subtitle">Sell your asset at your fingertips</p>

        <button className="wallet-btn" onClick={toggleWalletModal}>
          Wallet Connection
        </button>

        <label>Asset Name</label>
        <input
          type="text"
          value={assetname}
          onChange={(e) => setassetname(e.currentTarget.value || "")}
        />
        <label>Patients Wallet Address</label>
        <input
          type="text"
          value={patientwallet}
          onChange={(e) => setpatientwallet(e.currentTarget.value || "")}
        />
        <label>Unit Name</label>
        <input
          type="text"
          value={unitname}
          onChange={(e) => setunitname(e.currentTarget.value || "")}
        />

        <h2>Upload NFT Metadata</h2>
        <NFTForm onUploadComplete={(cid) => setIpfsCID(cid)} />

        <MethodCall
          methodFunction={async () => {
            if (!ipfsCID) {
              alert("Upload metadata to IPFS first.")
              return
            }

            const assetUrl = `https://ipfs.io/ipfs/${ipfsCID}#arc3`
            const newAssetId = await methods.create(
              algorand,
              activeAddress!,
              assetname,
              assetUrl,
              patientwallet,
              unitname,
            )
            setAssetId(newAssetId)
          }}
          text="Create Asset"
        />
        {assetId !== 0n && (
  <div className="asset-id-display">
    <p><strong>Asset ID:</strong> {assetId.toString()}</p>
  </div>
)}

        <MethodCall
        methodFunction={ async () => {
          if (assetId === 0n) {
            alert("Create the Asset First !!!")
          }

          const createApp = methods.createApplication(
            algorand,
            nftClient,
            nftFactory,
            TransactionSigner,
            activeAddress!,
            assetId,
            setAppId
          )

          const newAppId = await createApp()
          setAppId(newAppId)

        }}
        text = "Create App"
        />
        {
          appId !== 0n && (
            <div className='asset-id-display'>
              <p><strong>Application ID:</strong> {appId.toString()}</p>
            </div>
          )
        }
