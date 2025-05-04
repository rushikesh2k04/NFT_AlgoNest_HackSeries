import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useEffect, useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import MethodCall from './components/MethodCall'
import * as methods from './methods'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import NFTForm from './components/NFTForm'

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const { activeAddress, transactionSigner: TransactionSigner } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const [assetId, setAssetId] = useState<bigint>(0n)
  const [unitaryPrice, setUnitaryPrice] = useState<bigint>(0n)
  const [assetname, setassetname] = useState<string>("")
  const [int_quantity, setInt_quanity] = useState<bigint>(0n)
  const [int_decimals, setInt_decimals] = useState<number>(0)
  const [ipfsCID, setIpfsCID] = useState<string>("")

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })

  useEffect(() => {
    if (TransactionSigner) algorand.setDefaultSigner(TransactionSigner)
  }, [TransactionSigner])

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl space-y-5">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Welcome to <span className="text-black">AlgoKit 🙂</span>
        </h1>
        <p className="text-center text-gray-600">
          Digital Market - Sell your asset at your fingertips
        </p>

        <button
          onClick={toggleWalletModal}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Wallet Connection
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unitary Price (ALGO)</label>
            <input
              type="number"
              value={(unitaryPrice / 1_000_000n).toString()}
              onChange={(e) =>
                setUnitaryPrice(BigInt(e.currentTarget.valueAsNumber || 0) * 1_000_000n)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
            <input
              type="text"
              value={assetname}
              onChange={(e) => setassetname(e.currentTarget.value || "")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Quantity</label>
            <input
              type="number"
              value={int_quantity.toString()}
              onChange={(e) =>
                setInt_quanity(BigInt(e.currentTarget.valueAsNumber || 0))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Decimals</label>
            <input
              type="number"
              value={int_decimals.toString()}
              onChange={(e) =>
                setInt_decimals(Number(e.currentTarget.valueAsNumber || 0))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Upload NFT Metadata</h2>
          <NFTForm onUploadComplete={(cid) => setIpfsCID(cid)} />
        </div>

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
              int_quantity,
              int_decimals,
              assetname,
              assetUrl
            )
            setAssetId(newAssetId)
          }}
          text="Create Application"
        />

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  )
}

export default Home
