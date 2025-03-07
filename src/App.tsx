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
import Manage from "./pages/Manage.tsx";
import UpdateProfile from "./pages/UpdateProfile.tsx";
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
import { useNavigate } from "react-router-dom";

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
  const isStartPage = location.pathname === "/";
  const { currentUser, setCurrentUser } = useUser();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && publicKey && !hasNavigated) {
        const walletAddress = publicKey.toBase58();
        try {
          const user = await getUserByWallet(walletAddress);
          if (user) {
            setCurrentUser(user);
            toast.success(`Welcome back!`, {
              description: `Connected as ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
              duration: 3000,
            });
            console.log("Existing user fetched:", user);
          }
        } catch (error: any) {
          if (error.message.includes("User not found")) {
            const newUserData: Omit<User, "userId"> = {
              username: `user_${walletAddress.slice(0, 8)}`,
              solanaWalletAddress: walletAddress,
              password: "default_password",
              email: `${walletAddress.slice(0, 8)}@valet.temp`,
              firstName: "",
              lastName: "",
              age: 0,
              country: "",
              mobileNumber: "",
              twitterHandle: "",
              discordId: "",
              telegramId: "",
            };
            try {
              console.log("Creating user with data:", newUserData);
              const newUser = await createUser(newUserData);
              console.log("Created user response:", newUser);
              setCurrentUser(newUser);
              toast.success(`Account created!`, {
                description: `Connected as ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
                duration: 3000,
              });
            } catch (createError) {
              console.error("Create user error:", createError);
              toast.error("Failed to create user", {
                description: "Please try again",
                duration: 3000,
              });
              return;
            }
          } else {
            toast.error("Failed to fetch user", {
              description: "Connection Error",
              duration: 3000,
            });
            return;
          }
        }
        console.log("Navigating to /update-profile with currentUser:", currentUser);
        navigate("/update-profile");
        setHasNavigated(true);
      }
    };

    handleWalletConnection();
  }, [connected, publicKey, setCurrentUser, navigate, hasNavigated]);

  // Debug currentUser state
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
              <Route path="/manage" element={<Manage />} />
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
            </Routes>
          </Layout>
        )}
      </div>
    </>
  );
}

export default App;