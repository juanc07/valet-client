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
import UserProfile from "./pages/UserProfile";
import Start from "./pages/Start.tsx";
import UpdateProfile from "./pages/UpdateProfile.tsx";
import UpdateAgent from "./pages/UpdateAgent";
import AgentProfile from "./pages/AgentProfile";
import ChatApplication from "./pages/ChatApplication";
import TwitterTestPage from "./pages/TwitterTestPage.tsx";
import AddCreditsPage from "./pages/AddCreditsPage.tsx";
import AgentCreationGuide from "./pages/AgentCreationGuide";

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
import { useMemo, useEffect, useState } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "./components/ui/sonner.tsx";
import { UserProvider, useUser } from "./context/UserContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { createUser, getUserByWallet } from "./api/userApi";
import { User } from "./interfaces/user";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

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
          <UserProvider>
            <Router>
              <MainContent />
              <Toaster />
            </Router>
          </UserProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function MainContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isStartPage = location.pathname === "/";
  const { currentUser, setCurrentUser } = useUser();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const navigate = useNavigate();
  const [hasCheckedWallet, setHasCheckedWallet] = useState(false);

  useEffect(() => {
    const handleWalletConnection = async () => {
      // Skip if already checked or no wallet connection
      if (!connected || !publicKey || hasCheckedWallet) return;

      const walletAddress = publicKey.toBase58();
      console.log("Effect running at:", Date.now(), "Checking wallet:", walletAddress);

      try {
        const user = await getUserByWallet(walletAddress);
        console.log("User response:", user);

        if (user) {
          setCurrentUser(user);
          toast.success(`Welcome back!`, {
            description: `Connected as ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
            duration: 3000,
          });
        } else {
          const newUserData: Omit<User, "userId"> = {
            username: `user_${walletAddress.slice(0, 8)}`,
            solanaWalletAddress: walletAddress,
            password: "default_password",
            email: `${walletAddress.slice(0, 8)}@valet.temp`,
            firstName: "",
            lastName: "",
            age: 0,
            birthdate: "",
            country: "",
            mobileNumber: "",
            twitterHandle: "",
            discordId: "",
            telegramId: "",
            credit: 0
          };
          console.log("Creating user with data:", newUserData);
          const newUser = await createUser(newUserData);
          console.log("Created user response:", newUser);
          setCurrentUser(newUser);
          toast.success(`Account created!`, {
            description: `Connected as ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
            duration: 3000,
          });
        }

        setTimeout(() => {
          const currentPath = location.pathname;
          const isOAuthCallback = searchParams.get("oauth_callback") === "true";
          console.log("Current path:", currentPath, "Is OAuth callback:", isOAuthCallback);

          if (isOAuthCallback && currentPath.startsWith("/agent/edit/")) {
            console.log("Preserving OAuth redirect route:", currentPath);
          } else if (!currentPath.startsWith("/agent/edit/") && !currentUser?.email) {
            console.log("Navigating to /update-profile with currentUser:", currentUser);
            navigate("/update-profile");
          } else {
            console.log("Preserving current route or no navigation needed:", currentPath);
          }
          setHasCheckedWallet(true);
          sessionStorage.setItem("hasCheckedWallet", "true");
        }, 0);
      } catch (error) {
        console.error("Error during wallet connection:", error);
        toast.error("Failed to connect wallet", {
          description: "An unexpected error occurred. Please try again.",
          duration: 3000,
        });
      }
    };

    // If currentUser is already set from sessionStorage, skip wallet check
    if (!currentUser) {
      handleWalletConnection();
    } else {
      setHasCheckedWallet(true);
      sessionStorage.setItem("hasCheckedWallet", "true");
      console.log("Current user restored from sessionStorage, skipping wallet check:", currentUser);
    }
  }, [connected, publicKey, setCurrentUser, navigate, hasCheckedWallet, location.pathname, searchParams, currentUser]);

  useEffect(() => {
    console.log("MainContent currentUser:", currentUser);
  }, [currentUser]);

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
              <Route path="/add-credits" element={<AddCreditsPage />} />
              <Route path="/chat" element={<ChatApplication />} />
              <Route path="/twitter-test" element={<TwitterTestPage />} />
              <Route
                path="/profile"
                element={
                  currentUser ? (
                    <UserProfile userId={currentUser.userId} />
                  ) : (
                    <div>Please connect your wallet</div>
                  )
                }
              />
              <Route
                path="/update-profile"
                element={
                  currentUser ? (
                    <UpdateProfile userId={currentUser.userId} />
                  ) : (
                    <div>Please connect your wallet</div>
                  )
                }
              />
              <Route path="/guides" element={<AgentCreationGuide />} />
              <Route path="/agent/edit/:agentId" element={<UpdateAgent />} />
              <Route path="/agent/view/:agentId" element={<AgentProfile />} />
            </Routes>
          </Layout>
        )}
      </div>
    </>
  );
}

export default App;