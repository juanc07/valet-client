import Header from "./components/Header";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout.tsx";
import CreateAgent from "./pages/CreateAgent";
import YourAgent from "./pages/YourAgent";
import Profile from "./pages/Profile";
import Start from "./pages/Start.tsx";
import Manage from "./pages/Manage.tsx";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "./components/ui/sonner.tsx";

type Network = "mainnet-beta" | "testnet" | "devnet";

function App() {
  const network: Network = "devnet";
  const endpoint = clusterApiUrl(network);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <MainContent />
            <Toaster />
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function MainContent() {
  const location = useLocation();
  const isStartPage = location.pathname === "/";

  return (
    <>
      <div className="pt-20">
        <Header />
        {isStartPage ? (
          <Routes>
            <Route path="/" element={<Start />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/createagent" element={<CreateAgent />} />
              <Route path="/youragent" element={<YourAgent />} />
              <Route path="/manage" element={<Manage />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        )}
      </div>
    </>
  );
}


export default App;