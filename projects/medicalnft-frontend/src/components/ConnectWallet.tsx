import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'
import '../styles/connectWallet.css'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog
      id="connect_wallet_modal"
      className={`modal ${openModal ? 'modal-open animate-fade-in' : ''}`}
      style={{ display: openModal ? 'flex' : 'none' }}
    >
      <div className="modal-box max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Connect Your Wallet</h3>

        <div className="wallet-list space-y-3 my-6">
          {activeAddress && (
            <>
              <Account />
              <div className="divider" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                data-test-id={`${wallet.id}-connect`}
                className="wallet-button w-full flex items-center justify-between px-4 py-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                key={`provider-${wallet.id}`}
                onClick={() => wallet.connect()}
              >
                <div className="flex items-center">
                  {!isKmd(wallet) && (
                    <img
                      alt={`wallet_icon_${wallet.id}`}
                      src={wallet.metadata.icon}
                      className="w-8 h-8 mr-3"
                    />
                  )}
                  <span className="font-medium">{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
        </div>

        <div className="flex justify-between">
          <button
            data-test-id="close-wallet-modal"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={closeModal}
          >
            Close
          </button>

          {activeAddress && (
            <button
              className="px-4 py-2 rounded-md bg-error-100 text-error-700 hover:bg-error-200 transition-colors"
              data-test-id="logout"
              onClick={async () => {
                const activeWallet = wallets.find((w) => w.isActive)
                if (activeWallet) {
                  await activeWallet.disconnect()
                } else {
                  localStorage.removeItem('@txnlab/use-wallet:v3')
                  window.location.reload()
                }
                closeModal()
              }}
            >
              Disconnect Wallet
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}

export default ConnectWallet