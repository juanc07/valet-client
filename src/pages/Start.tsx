import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import backgroundImage from "../assets/background.webp";
import logo from "../assets/svg.svg";
import { useUser } from "../context/UserContext";

function Start() {
  const { currentUser } = useUser();
  const { connected: isWalletConnected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Start.tsx: isWalletConnected:", isWalletConnected);
    console.log("Start.tsx: currentUser:", currentUser);
    const isOAuthCallback = window.location.search.includes("oauth_callback");
    if (isWalletConnected && currentUser && !currentUser.email && !isOAuthCallback) {
      console.log("Start.tsx: Navigating to /update-profile due to missing email");
      navigate("/update-profile");
    }
  }, [isWalletConnected, currentUser, navigate]);

  const buttonClasses =
    "w-[250px] py-2 rounded-full text-lg font-medium transition-colors duration-300 ease-in-out border-2 border-[#6894f3] bg-[#6894f3] hover:bg-black hover:text-[#6894f3] cursor-pointer";

  const walletButtonStyles = {
    height: "40px", // Adjust if "Get Started" height differs (check DevTools)
    paddingTop: "8px",
    paddingBottom: "8px",
    fontSize: "1.125rem", // text-lg
    lineHeight: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "250px",
    borderRadius: "9999px",
    borderWidth: "2px",
    backgroundColor: "#6894f3", // Force match bg-[#6894f3]
    color: "#ffffff", // White text to match "Get Started" on bg-[#6894f3]
    fontFamily: "inherit",
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
            <button className={buttonClasses}>Get Started</button>
          </Link>
        ) : (
          <WalletMultiButton className={buttonClasses} style={walletButtonStyles}>
            {!isWalletConnected && "Connect Wallet"}
          </WalletMultiButton>
        )}
      </div>
    </div>
  );
}

export default Start;