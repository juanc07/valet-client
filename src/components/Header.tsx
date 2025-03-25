import { useState, useEffect } from "react";
import Image1 from "../assets/logo.png";
import { Logs, House, Users, UserPlus, User, MessageSquare, Edit, Twitter, CreditCard, BookOpen, Mail, Server, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";

const isAgentDebug = import.meta.env.VITE_SOLANA_AGENT_DEBUG === "TRUE";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const { currentUser, isWalletConnected, setIsWalletConnected, serverLive, checkServerStatus } = useUser();
  const wallet = useWallet();
  const { publicKey, connected, disconnect, connecting } = wallet;
  const { setVisible } = useWalletModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected !== isWalletConnected) {
      setIsWalletConnected(connected);
      if (connected && !isWalletConnected) {
        toast.success("Wallet Connected", {
          description: "Your wallet is now connected!",
          duration: 3000,
        });
        checkServerStatus(); // Check server status on connect
      } else if (!connected && isWalletConnected) {
        checkServerStatus(); // Check server status on disconnect
      }
    }
  }, [connected, isWalletConnected, setIsWalletConnected, checkServerStatus]);

  const handleWalletClick = async () => {
    try {
      if (connected && publicKey) {
        setIsWalletMenuOpen(!isWalletMenuOpen);
      } else {
        setIsWalletMenuOpen(false);
        setVisible(true);
        toast("Please select a wallet to connect", {
          description: "Wallet Connection",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("Failed to connect wallet", {
        description: "Connection Error",
        duration: 3000,
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsWalletMenuOpen(false);
      toast.success("Wallet Disconnected", {
        description: "Your wallet has been successfully disconnected",
        duration: 3000,
      });
      navigate("/");
      checkServerStatus(); // Check server status after disconnect
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <House className="text-2xl" /> },
    { name: "My Agents", path: "/youragent", icon: <Users className="text-2xl" /> },
    { name: "Create Agents", path: "/createagent", icon: <UserPlus className="text-2xl" /> },
    ...(isAgentDebug
      ? [
          { name: "Chat Test", path: "/chat", icon: <MessageSquare className="text-2xl" /> },
          { name: "Twitter Test", path: "/twitter-test", icon: <Twitter className="text-2xl" /> },
        ]
      : []),
    ...(currentUser
      ? [
          { name: "Add Credits", path: "/add-credits", icon: <CreditCard className="text-2xl" /> },
          { name: "Update Profile", path: "/update-profile", icon: <Edit className="text-2xl" /> },
          { name: "My Profile", path: "/profile", icon: <User className="text-2xl" /> },
        ]
      : []),
    { name: "Guides", path: "/guides", icon: <BookOpen className="text-2xl" /> },
    { name: "Privacy policy", path: "/privacy-policy", icon: <Shield className="text-2xl" /> },
    { name: "Twitter", path: "https://twitter.com/ValetAgents", icon: <Twitter className="text-2xl" /> },
    { name: "Contact US", path: "mailto:valwea329@gmail.com", icon: <Mail className="text-2xl" /> },    
  ];

  return (
    <header className="fixed top-0 left-0 w-full px-4 md:px-8 flex items-center justify-between p-4 bg-black text-white shadow-md z-50 border-b border-[#494848]">
      <div className="flex items-center gap-2">
        <Link to="/">
          <div className="w-9 h-9 lg:w-12 lg:h-12 max-w-[150px]">
            <img src={Image1} className="w-full h-full object-contain" alt="Logo" />
          </div>
        </Link>
        <div
          className={`lg:hidden w-3 h-3 rounded-full ${
            serverLive === null
              ? "bg-gray-400"
              : serverLive
              ? "bg-green-500"
              : "bg-red-500"
          }`}
          title={serverLive === null ? "Checking server status" : serverLive ? "Server is live" : "Server is down"}
        />
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="https://twitter.com/ValetAgents"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#6894f3] hover:text-white transition-colors duration-300"
          >
            <Twitter size={24} />
          </a>
          <a
            href="mailto:valwea329@gmail.com"
            className="p-2 text-[#6894f3] hover:text-white transition-colors duration-300"
          >
            <Mail size={24} />
          </a>
          <div
            className={`p-2 flex items-center gap-2 ${
              serverLive === null
                ? "text-gray-400"
                : serverLive
                ? "text-green-500"
                : "text-red-500"
            }`}
            title={serverLive === null ? "Checking server status" : serverLive ? "Server is live" : "Server is down"}
          >
            <Server size={24} />
            <span className="hidden md:inline">
              {serverLive === null ? "Checking..." : serverLive ? "Live" : "Down"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={handleWalletClick}
            className="flex items-center p-4 md:px-5 py-1 text-black border-[#6894f3] border cursor-pointer transition-colors duration-300 ease-in-out hover:bg-black hover:text-[#6894f3] bg-[#6894f3] rounded-t-lg rounded-r-lg rounded-b-l grounded-l-lg rounded-b-lg"
            disabled={connecting}
          >
            {connecting
              ? "Connecting..."
              : connected && publicKey
              ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
              : "Connect Wallet"}
          </button>
          {connected && publicKey && isWalletMenuOpen && (
            <div className="absolute cursor-pointer top-full right-0 mt-2 w-48 bg-black text-white border border-[#494848] rounded-lg shadow-xl z-50">
              <button
                onClick={handleDisconnect}
                className="w-full text-left cursor-pointer px-4 py-2 rounded-lg hover:bg-[#222128] transition-colors duration-200"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
        <button
          className="p-1 rounded-lg text-[#6894f3] lg:hidden cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Logs size={40} />
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-16 right-0 w-64 bg-black text-white mr-3 shadow-xl border border-[#494848] lg:hidden z-50">
          <div className="flex flex-col gap-2 p-4">
            <span className="font-light ml-2 text-gray-400">Terminal</span>
            {menuItems.map((item) =>
              item.path.startsWith("http") || item.path.startsWith("mailto") ? (
                <a
                  key={item.path}
                  href={item.path}
                  target={item.path.startsWith("http") ? "_blank" : "_self"}
                  rel={item.path.startsWith("http") ? "noopener noreferrer" : ""}
                  className="flex items-center gap-3 p-2 hover:bg-[#222128] rounded-lg transition-all duration-400 ease-in-out text-gray-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 p-2 hover:bg-[#222128] rounded-lg transition-all duration-400 ease-in-out text-gray-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}