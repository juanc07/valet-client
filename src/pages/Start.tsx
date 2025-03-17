import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react"; // Added useWallet
import backgroundImage from "../assets/background.webp";
import logo from "../assets/svg.svg";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";

function Start() {
  const { currentUser } = useUser();
  const { connected: isWalletConnected, connect } = useWallet(); // Added connect from useWallet
  const navigate = useNavigate();

  useEffect(() => {
    const isOAuthCallback = window.location.search.includes("oauth_callback");
    if (currentUser && !currentUser.email && !isOAuthCallback) {
      console.log("Start.tsx: Navigating to /update-profile due to missing email");
      navigate("/update-profile");
    }
  }, [currentUser, navigate]);

  const handleConnectWallet = async () => {
    try {
      await connect(); // Opens the wallet adapter modal
      // No toast needed here; wallet adapter UI typically handles success/failure feedback
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error("Connection Failed", {
        description: "Unable to connect your wallet. Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <div
      className="min-h-[92vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-[800px] h-[500px] lg:border lg:border-[#494848] p-8 rounded-3xl shadow-lg text-center flex flex-col justify-center items-center bg-black/50 backdrop-blur-md">
        <img src={logo} alt="" className="w-[100px]" />
        <h2 className="text-5xl font-semibold mb-6 text-white">Valet</h2>
        {isWalletConnected ? (
          <Link to="/createagent">
            <button
              className="w-[250px] py-2 rounded-full text-lg font-medium transition-colors duration-300 ease-in-out border-2 border-[#6894f3] bg-[#6894f3] hover:bg-black hover:text-[#6894f3] cursor-pointer"
            >
              Get Started
            </button>
          </Link>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="w-[250px] py-2 rounded-full text-lg font-medium transition-colors duration-300 ease-in-out border-2 border-[#6894f3] bg-[#6894f3] hover:bg-black hover:text-[#6894f3] cursor-pointer"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default Start;