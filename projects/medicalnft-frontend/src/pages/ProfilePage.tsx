import { useWallet } from '@txnlab/use-wallet-react'
import { ClipboardCopy, UserCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

const ProfilePage = () => {
  const { activeAddress } = useWallet()
  const [connectionTime, setConnectionTime] = useState<Date | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (activeAddress) {
      // Set connection time when wallet is connected
      setConnectionTime(new Date())
    } else {
      setConnectionTime(null)
    }
  }, [activeAddress])

  const copyAddress = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!activeAddress) {
    return (
      <div className="text-center py-16">
        <UserCircle className="h-20 w-20 mx-auto text-gray-400" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Connect Your Wallet</h2>
        <p className="mt-2 text-gray-600">Please connect your wallet to view your profile and access the application.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Your personal wallet information and account details</p>
      </div>

      <div className="bg-white shadow-card rounded-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-10 text-center">
          <UserCircle className="h-24 w-24 mx-auto text-white" />
          <h2 className="mt-4 text-xl font-semibold text-white">Connected Wallet</h2>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
              <div className="mt-2 flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                <span className="text-gray-800 font-mono">
                  {activeAddress.substring(0, 8)}...{activeAddress.substring(activeAddress.length - 8)}
                </span>
                <button
                  onClick={copyAddress}
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label="Copy wallet address"
                >
                  {copied ? (
                    <span className="text-success-600">Copied!</span>
                  ) : (
                    <ClipboardCopy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Connected Since</h3>
              <div className="mt-2 flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-800">
                  {connectionTime
                    ? `${formatDistanceToNow(connectionTime)} ago`
                    : 'Just now'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Network</h3>
              <div className="mt-2 bg-gray-50 px-4 py-3 rounded-lg">
                <span className="text-gray-800 capitalize">
                  {import.meta.env.VITE_ALGOD_NETWORK || 'localnet'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors">
              <span>View on Explorer</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage