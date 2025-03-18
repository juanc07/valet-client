import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import backgroundImage from "../assets/background.webp";
import logo from "../assets/svg.svg";
import { useUser } from "../context/UserContext";

function Start() {
  const { currentUser, isWalletConnected } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Start.tsx: isWalletConnected:", isWalletConnected);
    console.log("Start.tsx: currentUser:", currentUser);
    const isOAuthCallback = window.location.search.includes("oauth_callback");

    if (isWalletConnected) {
      if (currentUser && !currentUser.email && !isOAuthCallback) {
        console.log("Start.tsx: Navigating to /update-profile due to missing email");
        navigate("/update-profile");
      } else if (!isOAuthCallback) {
        console.log("Start.tsx: Wallet connected, auto-navigating to /createagent");
        navigate("/createagent");
      }
    }
  }, [isWalletConnected, currentUser, navigate]);

  const buttonClasses =
    "w-[250px] py-2 rounded-full text-lg font-medium border-2 border-[#6894f3] bg-[#6894f3] cursor-pointer";

  const walletButtonStyles = {
    height: "40px",
    paddingTop: "8px",
    paddingBottom: "8px",
    fontSize: "1.125rem",
    lineHeight: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "250px",
    borderRadius: "9999px",
    borderWidth: "2px",
    backgroundColor: "#6894f3",
    color: "#ffffff",
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
        {!isWalletConnected ? (
          <WalletMultiButton className={buttonClasses} style={walletButtonStyles}>
            Get Started
          </WalletMultiButton>
        ) : null}
      </div>
    </div>
  );
}

export default Start;