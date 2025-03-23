import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import puppet from "../assets/puppet.jpg";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { fetchWrapper } from "../utils/fetchWrapper";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const RECEIVER_PUBLIC_KEY = import.meta.env.VITE_SOLANA_PAYMENT_WALLET;
const SOLANA_ENDPOINT = import.meta.env.VITE_SOLANA_ENDPOINT;
const TOKEN_MINT_ADDRESS = import.meta.env.VITE_VALLET_TOKEN_ADDRESS || "2ex5kxL5ZKSxv6mJHf5EiM86ZYCGJp56JY1MjKrgpump";
const AGENT_CREATION_TOKEN_AMOUNT = 1000 * Math.pow(10, 6);

interface FormData {
  name: string;
  bio: string;
  tone: string;
  formality: string;
  catchphrase: string;
  agentType: "puppetos" | "basic";
}

export default function CreateAgent() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    bio: "",
    tone: "",
    formality: "",
    catchphrase: "",
    agentType: "basic",
  });
  const [serverError, setServerError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { connected: walletConnected, publicKey } = useWallet();
  const { currentUser, serverLive, checkServerStatus } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !publicKey) {
      navigate("/");
      return;
    }

    const initialCheck = async () => {
      console.log("Running initial server status check on CreateAgent load...");
      await checkServerStatus();
      if (serverLive === false) {
        setServerError("Server is currently unavailable.");
        setLoading(false);
        toast.error("Server Unavailable", {
          description: "Cannot load Create Agent page at this time. Please try again later.",
          duration: 3000,
        });
      } else {
        setLoading(false);
      }
    };

    initialCheck();
  }, [walletConnected, publicKey, navigate, checkServerStatus, serverLive]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      setServerError("Wallet not connected properly.");
      toast.error("Wallet Error", { description: "Please connect your wallet.", duration: 3000 });
      return;
    }

    const requiredFields = ["name", "bio", "tone", "formality", "catchphrase"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof FormData]);
    if (missingFields.length > 0) {
      setServerError(`Missing required fields: ${missingFields.join(", ")}`);
      toast.error("Form Submission Failed", {
        description: `Missing required fields: ${missingFields.join(", ")}`,
        duration: 3000,
      });
      return;
    }

    if (!currentUser?.userId) {
      setServerError("User must be logged in.");
      toast.error("Form Submission Failed", {
        description: "User must be logged in.",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    const connection = new Connection(SOLANA_ENDPOINT, "confirmed");

    try {
      console.log("Checking server status before agent creation...");
      await checkServerStatus();
      if (serverLive === false) {
        setServerError("Server is currently unavailable.");
        toast.error("Server Unavailable", {
          description: "Cannot create agent at this time. Please try again later.",
          duration: 3000,
        });
        return;
      }

      if (!RECEIVER_PUBLIC_KEY || typeof RECEIVER_PUBLIC_KEY !== "string") {
        throw new Error("RECEIVER_PUBLIC_KEY is invalid or undefined. Check your .env file.");
      }
      if (!TOKEN_MINT_ADDRESS || typeof TOKEN_MINT_ADDRESS !== "string") {
        throw new Error("TOKEN_MINT_ADDRESS is invalid or undefined. Check your .env file.");
      }
      if (!SOLANA_ENDPOINT || typeof SOLANA_ENDPOINT !== "string") {
        throw new Error("SOLANA_ENDPOINT is invalid or undefined. Check your .env file.");
      }

      const receiverPublicKey = new PublicKey(RECEIVER_PUBLIC_KEY);
      const tokenMintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);
      const solBalance = await connection.getBalance(publicKey);
      if (solBalance < 5000) {
        throw new Error("Insufficient SOL for transaction fees. Please add at least 0.01 SOL to your wallet.");
      }

      const senderATA = await getAssociatedTokenAddress(tokenMintPublicKey, publicKey);
      const receiverATA = await getAssociatedTokenAddress(tokenMintPublicKey, receiverPublicKey);

      const senderAccount = await getAccount(connection, senderATA, "confirmed");
      if (Number(senderAccount.amount) < AGENT_CREATION_TOKEN_AMOUNT) {
        throw new Error("Insufficient token balance. Please ensure you have at least 1000 tokens.");
      }

      await getAccount(connection, receiverATA, "confirmed");

      const transferTx = new Transaction().add(
        createTransferInstruction(
          senderATA,
          receiverATA,
          publicKey,
          AGENT_CREATION_TOKEN_AMOUNT,
          [],
          TOKEN_PROGRAM_ID
        )
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

      const agentData = {
        name: formData.name,
        bio: formData.bio,
        personality: {
          tone: formData.tone,
          formality: formData.formality,
          catchphrase: formData.catchphrase,
          humor: false,
        },
        agentType: formData.agentType,
        createdBy: currentUser.userId,
        description: "A new AI agent",
        mission: "To assist users",
        vision: "A helpful future",
      };

      const response = await fetchWrapper<{ message: string; agentId: string }>(
        `${BASE_URL}/agents`,
        {
          method: "POST",
          body: JSON.stringify({ txSignature: signature, ...agentData }),
          headers: { "Content-Type": "application/json" },
        }
      );

      setServerError("");
      toast.success("Agent Created", {
        description: `Successfully created agent: ${formData.name} (ID: ${response.agentId})`,
        duration: 3000,
      });
      setFormData({
        name: "",
        bio: "",
        tone: "",
        formality: "",
        catchphrase: "",
        agentType: "basic",
      });
    } catch (err: any) {
      console.error("Error creating agent:", err.message || err);
      const errorMsg = err.message || "Something went wrong.";

      // Check if the error is due to user canceling the transaction
      if (errorMsg.includes("User rejected the request") || (err.code && err.code === 4001)) {
        toast.error("Transaction Canceled", {
          description: "You canceled the transaction. Please try again if you wish to proceed.",
          duration: 3000,
        });
      } else {
        setServerError(errorMsg);
        toast.error("Agent Creation Failed", {
          description: errorMsg,
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#6894f3] text-4xl animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Create Agent Page...
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
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py- rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-10 pb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Create Your AI Agent (1000 Tokens)
          </h1>
          <form onSubmit={handleSubmit}>
            <div>
              <p className="font-semibold text-lg text-white mb-4">Select Framework</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="flex flex-col lg:flex-row items-center border border-[#494848] px-2 py-4 xl:px-4 xl:py-4 rounded-lg text-center duration-700 lg:text-left cursor-pointer hover:bg-gray-900"
                  onClick={() => setFormData((prev) => ({ ...prev, agentType: "basic" }))}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm md:text-base">Basic Agent</div>
                    <div className="text-xs md:text-sm text-gray-400 mt-2 md:mt-0">
                      Standard AI Framework
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="agentType"
                    value="basic"
                    checked={formData.agentType === "basic"}
                    onChange={handleChange}
                    className="mt-5 lg:mt-3 p-2"
                  />
                </div>
                <div
                  className="flex flex-col lg:flex-row items-center border border-[#494848] px-2 py-4 xl:px-4 xl:py-4 rounded-lg text-center lg:text-left opacity-50 cursor-not-allowed"
                >
                  <img src={puppet} className="w-14 h-14 lg:w-10 lg:h-10 mb-4 lg:mb-0 lg:mr-4 rounded-lg" alt="PuppetOS" />
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm md:text-base">PuppetOS</div>
                    <div className="text-xs md:text-sm text-gray-400 mt-2 md:mt-0">
                      Coming Soon{" "}
                      <a
                        href="https://github.com/juanc07/PuppetOS"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="cursor-pointer text-[#6b94ed] text-nowrap"
                      >
                        learn more
                      </a>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="agentType"
                    value="puppetos"
                    checked={formData.agentType === "puppetos"}
                    onChange={handleChange}
                    className="mt-5 lg:mt-3 p-2"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="mx-auto py-2 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col">
                  <label htmlFor="name" className="mb-1 text-white">Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Agent's name"
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    minLength={1}
                    maxLength={50}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="tone" className="mb-1 text-white">Tone *</label>
                  <input
                    id="tone"
                    name="tone"
                    type="text"
                    value={formData.tone}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Friendly, Professional"
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    minLength={1}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col">
                  <label htmlFor="formality" className="mb-1 text-white">Formality *</label>
                  <input
                    id="formality"
                    name="formality"
                    type="text"
                    value={formData.formality}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Casual, Formal"
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    minLength={1}
                    maxLength={20}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="catchphrase" className="mb-1 text-white">Catchphrase *</label>
                  <input
                    id="catchphrase"
                    name="catchphrase"
                    type="text"
                    value={formData.catchphrase}
                    onChange={handleChange}
                    required
                    placeholder="Agent's catchphrase"
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    minLength={1}
                    maxLength={50}
                  />
                </div>
              </div>
              <div className="flex flex-col mb-2">
                <label htmlFor="bio" className="mb-1 text-white">Bio *</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  placeholder="Agent's background"
                  className="w-full border border-[#494848] text-white px-2 py-5 rounded-lg outline-none focus:ring-1 focus:ring-gray-500 resize-none"
                  minLength={10}
                  maxLength={500}
                />
              </div>
            </div>

            {serverError && <p className="text-red-500 text-center mt-2">{serverError}</p>}

            <div className="text-center w-full">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 rounded-4xl text-lg text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:text-white ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Processing..." : "Create (Pay 1000 Tokens)"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}