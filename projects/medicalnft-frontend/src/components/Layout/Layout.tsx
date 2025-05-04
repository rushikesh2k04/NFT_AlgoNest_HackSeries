import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { User, PlusCircle, ShoppingBag } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import ConnectWallet from '../ConnectWallet'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation()
  const { activeAddress } = useWallet()
  const [openWalletModal, setOpenWalletModal] = useState(false)

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const navItems = [
    { path: '/profile', label: 'My Profile', icon: <User className="h-5 w-5" /> },
    { path: '/medical-services', label: 'Medical Services', icon: <PlusCircle className="h-5 w-5" /> },
    { path: '/marketplace', label: 'Marketplace', icon: <ShoppingBag className="h-5 w-5" /> },
  ]

  // If no active address and not on profile page, redirect to profile
  useEffect(() => {
    if (!activeAddress && pathname !== '/profile') {
      // This effect will navigate to profile page if not connected
    }
  }, [activeAddress, pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">MedRecord NFT</h1>
          </div>

          <div>
            {activeAddress ? (
              <button 
                onClick={toggleWalletModal}
                className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-100 transition-all"
              >
                <span className="hidden sm:inline">{activeAddress.substring(0, 4)}...{activeAddress.substring(activeAddress.length - 4)}</span>
                <User className="h-5 w-5" />
              </button>
            ) : (
              <button 
                onClick={toggleWalletModal}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm mt-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1 py-4 px-3 border-b-2 font-medium text-sm transition-all ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-card rounded-card p-6 animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm">© 2025 MedRecord NFT. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}

import { useState, useEffect } from 'react'
export default Layout