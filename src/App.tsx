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
import { useMemo, useEffect, useState, useRef } from "react";
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
  const [hasCheckedWallet, setHasCheckedWallet] = useState(
    sessionStorage.getItem("hasCheckedWallet") === "true"
  );
  const hasRunRef = useRef(false); // Track if wallet connection logic has run

  // Handle wallet connection logic
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (!connected || !publicKey || hasRunRef.current || hasCheckedWallet) return;

      const walletAddress = publicKey.toBase58();
      console.log("Effect running at:", Date.now(), "Checking wallet:", walletAddress);

      try {
        const user = await getUserByWallet(walletAddress);
        console.log("User response:", user);

        if (user) {
          setCurrentUser(user);
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
            credit: 0,
          };
          console.log("Creating user with data:", newUserData);
          const newUser = await createUser(newUserData);
          console.log("Created user response:", newUser);
          setCurrentUser(newUser);
        }

        hasRunRef.current = true;
        setHasCheckedWallet(true);
        sessionStorage.setItem("hasCheckedWallet", "true");
      } catch (error) {
        console.error("Error during wallet connection:", error);
        toast.error("Failed to connect wallet", {
          description: "An unexpected error occurred. Please try again.",
          duration: 3000,
        });
      }
    };

    if (!currentUser && connected && publicKey && !hasCheckedWallet) {
      handleWalletConnection();
    }

    // Cleanup for Strict Mode
    return () => {
      if (process.env.NODE_ENV === "development" && !hasRunRef.current) {
        hasRunRef.current = false; // Reset only if not already run
      }
    };
  }, [connected, publicKey, setCurrentUser, currentUser, hasCheckedWallet]);

  // Handle toast separately based on currentUser change
  useEffect(() => {
    if (!currentUser || !hasCheckedWallet) return;

    const walletAddress = publicKey?.toBase58();
    if (walletAddress) {
      const message = currentUser.email
        ? `Welcome back!`
        : `Account created!`; // Assuming email presence indicates existing user
      toast.success(message, {
        description: `Connected as ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
        duration: 3000,
      });
    }
  }, [currentUser, hasCheckedWallet, publicKey]); // Runs only when currentUser or hasCheckedWallet changes

  // Handle navigation separately
  useEffect(() => {
    if (!hasCheckedWallet || !currentUser) return;

    const currentPath = location.pathname;
    const isOAuthCallback = searchParams.get("oauth_callback") === "true";
    console.log("Navigation check - Current path:", currentPath, "Is OAuth callback:", isOAuthCallback);

    if (isOAuthCallback && currentPath.startsWith("/agent/edit/")) {
      console.log("Preserving OAuth redirect route:", currentPath);
    } else if (!currentPath.startsWith("/agent/edit/") && !currentUser?.email) {
      console.log("Navigating to /update-profile with currentUser:", currentUser);
      navigate("/update-profile");
    } else {
      console.log("Preserving current route or no navigation needed:", currentPath);
    }
  }, [hasCheckedWallet, currentUser, location.pathname, searchParams, navigate]);

  // Log currentUser changes for debugging
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