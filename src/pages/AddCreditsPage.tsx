import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { addUserCredits } from "../api/userApi";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const RECEIVER_PUBLIC_KEY = import.meta.env.VITE_SOLANA_PAYMENT_WALLET;
const SOLANA_ENDPOINT = import.meta.env.VITE_SOLANA_ENDPOINT || "https://api.mainnet-beta.solana.com";

const CREDIT_PLANS = {
  "SECRET_CREDIT_10": { credits: 10, label: "10 Credits", solPrice: 0.05 },
  "SECRET_CREDIT_50": { credits: 50, label: "50 Credits", solPrice: 0.2 },
  "SECRET_CREDIT_100": { credits: 100, label: "100 Credits", solPrice: 0.5 },
} as const;

type PlanKey = keyof typeof CREDIT_PLANS;

export default function AddCreditsPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  const [newCreditBalance, setNewCreditBalance] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { connected: walletConnected, publicKey } = useWallet(); // Removed signTransaction, sendTransaction
  const { currentUser, serverLive, checkServerStatus } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !publicKey) {
      navigate("/");
      return;
    }

    const initialCheck = async () => {
      console.log("Running initial server status check on AddCreditsPage load...");
      await checkServerStatus();
      if (serverLive === false) {
        setServerError("Server is currently unavailable.");
        setLoading(false);
        toast.error("Server Unavailable", {
          description: "Cannot load Add Credits page at this time. Please try again later.",
          duration: 3000,
        });
      } else {
        setLoading(false);
      }
    };

    initialCheck();
  }, [walletConnected, publicKey, navigate, checkServerStatus, serverLive]);

  const handlePlanSelect = (plan: PlanKey) => {
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
    if (!publicKey || !selectedPlan || !currentUser?.userId) {
      setServerError("Wallet not connected or user not logged in.");
      setShowFailureDialog(true);
      toast.error("Purchase Error", {
        description: "Wallet not connected or user not logged in.",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    const connection = new Connection(SOLANA_ENDPOINT, "confirmed");

    try {
      console.log("Checking server status before purchase...");
      await checkServerStatus();
      if (serverLive === false) {
        throw new Error("Server is currently unavailable.");
      }

      if (!RECEIVER_PUBLIC_KEY || typeof RECEIVER_PUBLIC_KEY !== "string") {
        throw new Error("RECEIVER_PUBLIC_KEY is invalid or undefined. Check your .env file.");
      }

      const receiverPublicKey = new PublicKey(RECEIVER_PUBLIC_KEY);
      const solAmount = CREDIT_PLANS[selectedPlan].solPrice * LAMPORTS_PER_SOL;
      const transferTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: receiverPublicKey,
          lamports: solAmount,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transferTx.recentBlockhash = blockhash;
      transferTx.feePayer = publicKey;

      const provider = window.solana;
      if (!provider || !provider.isPhantom) {
        throw new Error("Phantom wallet not detected.");
      }

      const { signature } = await provider.signAndSendTransaction(transferTx);
      await connection.confirmTransaction(signature, "confirmed");

      const response = await addUserCredits(currentUser.userId, signature, selectedPlan);
      setNewCreditBalance(response.newCreditBalance);
      setShowSuccessDialog(true);
      toast.success("Purchase Successful", {
        description: `Added ${CREDIT_PLANS[selectedPlan].credits} credits to your account.`,
        duration: 3000,
      });
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      console.error("Error purchasing credits:", err);

      if (errorMsg.includes("User rejected the request") || (err.code && err.code === 4001)) {
        toast.error("Transaction Canceled", {
          description: "You canceled the transaction. Please try again if you wish to proceed.",
          duration: 3000,
        });
      } else {
        setServerError(errorMsg || "Failed to purchase credits.");
        if (errorMsg !== "Server is currently unavailable.") {
          setShowFailureDialog(true);
        }
        toast.error("Purchase Failed", {
          description: errorMsg || "Please try again later.",
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
      if (!showSuccessDialog) {
        setSelectedPlan(null);
      }
    }
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
    setNewCreditBalance(null);
  };

  const closeFailureDialog = () => {
    setShowFailureDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#6a94f3] text-4xl animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Add Credits Page...
          </p>
        </div>
      </div>
    );
  }

  if (serverError && !isSubmitting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center text-red-500 text-xl md:text-2xl">{serverError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-lg shadow-lg bg-[#222128] border border-[#494848] p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Add Credits to Your Account
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Choose a plan below to add credits via Solana payment.
        </p>

        {serverError && isSubmitting && (
          <p className="text-red-500 text-center mb-6">{serverError}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(CREDIT_PLANS).map(([code, { label, solPrice }]) => (
            <div
              key={code}
              className={`border border-[#494848] rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                selectedPlan === code ? "bg-[#6a94f0] text-black" : "bg-[#1a1a1a] hover:bg-[#2a2a2a]"
              }`}
              onClick={() => handlePlanSelect(code as PlanKey)}
            >
              <h2 className="text-2xl font-semibold mb-2">{label}</h2>
              <p className="text-lg mb-4">{solPrice} SOL</p>
              <button
                className={`w-full py-3 rounded-lg text-lg font-medium ${
                  selectedPlan === code
                    ? "bg-black text-white"
                    : "bg-[#6a94f0] text-black hover:bg-[#8faef0]"
                }`}
                disabled={isSubmitting}
              >
                {selectedPlan === code ? "Selected" : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={handlePurchase}
            disabled={!selectedPlan || isSubmitting}
            className={`w-full max-w-md py-4 rounded-lg text-xl font-semibold bg-[#6a94f0] text-black transition-all duration-400 ${
              !selectedPlan || isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#8faef0]"
            }`}
          >
            {isSubmitting
              ? "Processing..."
              : `Purchase Credits (${selectedPlan ? CREDIT_PLANS[selectedPlan].solPrice : "Select a plan"} SOL)`}
          </button>
        </div>

        {showSuccessDialog && (
          <div
            style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-[#222128] p-6 rounded-lg shadow-lg border border-[#494848] w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Purchase Successful!</h3>
              <p className="text-gray-300 mb-6">
                You’ve added {selectedPlan ? CREDIT_PLANS[selectedPlan].credits : ""} credits to your account.
                <br />
                New Credit Balance: <span className="text-white">{newCreditBalance}</span>
              </p>
              <div className="flex justify-end">
                <button
                  onClick={closeSuccessDialog}
                  className="px-4 py-2 bg-[#6a94f0] text-black rounded-lg hover:bg-[#8faef0] transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showFailureDialog && (
          <div
            style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-[#222128] p-6 rounded-lg shadow-lg border border-[#494848] w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-500">Purchase Failed</h3>
              <p className="text-gray-300 mb-6">{serverError}</p>
              <div className="flex justify-end">
                <button
                  onClick={closeFailureDialog}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}