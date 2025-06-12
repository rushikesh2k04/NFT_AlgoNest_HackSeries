import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import React from 'react'
import Home from './Home'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import { UserProvider, useUser } from './contexts/UserContext'


// Import dashboards for each role
import DoctorDashboard from './components/doctor/Dashboard'
import PatientDashboard from './components/patient/Dashboard'
import PharmacyDashboard from './components/pharmacy/Dashboard'
import ProfileForm from './components/common/ProfileForm'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
    // Add more wallets if needed
  ]
}

const algodConfig = getAlgodConfigFromViteEnvironment()

const walletManager = new WalletManager({
  wallets: supportedWallets,
  defaultNetwork: algodConfig.network,
  networks: {
    [algodConfig.network]: {
      algod: {
        baseServer: algodConfig.server,
        port: algodConfig.port,
        token: String(algodConfig.token),
      },
    },
  },
  options: {
    resetNetwork: true,
  },
})

// Role-based main router
const MainRouter = () => {
  const { role, profile } = useUser()

  // If no role, show Home (wallet connect + role select)
  if (!role) return <Home />

  // If no profile, show profile form
  if (!profile) return <ProfileForm onComplete={() => {}} />

  // Route to the correct dashboard
  switch (role) {
    case 'doctor':
      return <DoctorDashboard />
    case 'patient':
      return <PatientDashboard />
    case 'pharmacy':
      return <PharmacyDashboard />
    default:
      return <div>Unknown role</div>
  }
}

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <UserProvider>
          <MainRouter />
        </UserProvider>
      </WalletProvider>
    </SnackbarProvider>
  )
}
