import { useState, useEffect } from "react";
import Image1 from "../assets/logo.png";
import { Logs, House, Users, UserPlus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const wallet = useWallet();
  const { publicKey, connected, disconnect, connecting } = wallet;
  const { setVisible } = useWalletModal();

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
    } catch (error) {
      ("");
    }
  };

  useEffect(() => {
    if (connected && publicKey) {

      toast.success(`Wallet connected`, {
        description: `Connected as ${publicKey
          .toBase58()
          .slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
        duration: 3000,
      });
    }
  }, [connected, publicKey]);

  useEffect(() => {
    const handleConnectionError = (event: any) => {
      if (event.error && event.message) {
        toast.error("Connection Error", {
          description: event.message || "Failed to connect wallet",
          duration: 3000,
        });
      }
    };

    window.addEventListener("error", handleConnectionError);

    return () => {
      window.removeEventListener("error", handleConnectionError);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full px-4 md:px-8 flex items-center justify-between p-4 bg-black text-white shadow-md z-50 border-b border-[#494848]">
      <div>
        <Link to="/">
          <div className="w-9 h-9 lg:w-12 lg:h-12 max-w-[150px]">
            <img
              src={Image1}
              className="w-full h-full object-contain"
              alt="Logo"
            />
          </div>
        </Link>
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
              ? `${publicKey.toBase58().slice(0, 4)}...${publicKey
                  .toBase58()
                  .slice(-4)}`
              : "Connect Wallet"}
          </button>
          {connected && publicKey && isWalletMenuOpen && (
            <div className="absolute cursor-pointer top-full right-0 mt-2 w-48 bg-[#6894f3] text-black rounded-lg shadow-xl z-50">
              <button
                onClick={handleDisconnect}
                className="w-full text-left cursor-pointer px-4 py-2 rounded-lg hover:bg-[#8faef0] hover:px-4 hover:py-2 transition-colors duration-200"
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
        <div className="absolute top-16 right-0 w-64 bg-[#6894f3] text-white mr-3 shadow-xl lg:hidden z-50">
          <div className="flex flex-col gap-2 p-4">
            <span className="font-light ml-2">Terminal</span>
            <a
              href="/"
              className="flex items-center gap-3 p-2 hover:bg-[#8faef0] rounded-lg transition-all duration-400 ease-in-out"
            >
              <House className="text-xl" />
              <span>Home</span>
            </a>
            <a
              href="/youragent"
              className="flex items-center gap-3 p-2 hover:bg-[#8faef0] rounded-lg transition-all duration-400 ease-in-out"
            >
              <Users className="text-xl" />
              <span>Your Agents</span>
            </a>
            <a
              href="/createagent"
              className="flex items-center gap-3 p-2 hover:bg-[#8faef0] rounded-lg transition-all duration-400 ease-in-out"
            >
              <UserPlus className="text-xl" />
              <span>Create Agents</span>
            </a>
            <a
              target="_blank"
              href="https://x.com/home"
              className="flex items-center gap-3 p-2 hover:bg-[#8faef0] rounded-lg transition-all duration-400 ease-in-out"
            >
              <FileText className="text-xl" />
              <span>Documentation</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
