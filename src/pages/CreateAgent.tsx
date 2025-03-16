import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import puppet from "../assets/puppet.jpg";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { fetchWrapper } from "../utils/fetchWrapper";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const RECEIVER_PUBLIC_KEY = import.meta.env.VITE_SOLANA_PAYMENT_WALLET;
const SOLANA_ENDPOINT = import.meta.env.VITE_SOLANA_ENDPOINT || "https://api.devnet.solana.com";
const AGENT_CREATION_SOL_AMOUNT = 0.01 * LAMPORTS_PER_SOL;

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
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { connected: walletConnected, publicKey, signTransaction, sendTransaction } = useWallet();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Wallet connected:", walletConnected, "PublicKey:", publicKey?.toString());
    if (!walletConnected) {
      navigate("/");
    }
  }, [walletConnected, publicKey, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey || !signTransaction || !sendTransaction) {
      setError("Wallet not connected properly.");
      toast.error("Wallet Error", { description: "Please connect your wallet.", duration: 3000 });
      return;
    }

    const requiredFields = ["name", "bio", "tone", "formality", "catchphrase"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof FormData]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      toast.error("Form Submission Failed", {
        description: `Missing required fields: ${missingFields.join(", ")}`,
        duration: 3000,
      });
      return;
    }

    if (!currentUser?.userId) {
      setError("User must be logged in.");
      toast.error("Form Submission Failed", {
        description: "User must be logged in.",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    const connection = new Connection(SOLANA_ENDPOINT, "confirmed");

    try {
      // Validate RECEIVER_PUBLIC_KEY
      console.log("RECEIVER_PUBLIC_KEY:", RECEIVER_PUBLIC_KEY);
      if (!RECEIVER_PUBLIC_KEY || typeof RECEIVER_PUBLIC_KEY !== "string") {
        throw new Error("RECEIVER_PUBLIC_KEY is invalid or undefined. Check your .env file.");
      }

      const receiverPublicKey = new PublicKey(RECEIVER_PUBLIC_KEY);
      console.log("receiverPublicKey:", receiverPublicKey.toString());

      // Debug publicKey from wallet
      console.log("publicKey:", publicKey.toString());

      // Create SOL transfer transaction
      const transferTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: receiverPublicKey,
          lamports: AGENT_CREATION_SOL_AMOUNT,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transferTx.recentBlockhash = blockhash;
      transferTx.feePayer = publicKey;

      const signedTransferTx = await signTransaction(transferTx);
      const txSignature = await sendTransaction(signedTransferTx, connection);
      await connection.confirmTransaction(txSignature, "confirmed");

      // Prepare agent data without txSignature
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

      // Send to backend with txSignature as a separate field
      const response = await fetchWrapper<{ message: string; agentId: string }>(
        `${BASE_URL}/agents`,
        {
          method: "POST",
          body: JSON.stringify({ txSignature, ...agentData }),
          headers: { "Content-Type": "application/json" },
        }
      );

      setError("");
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
      console.error("Error creating agent:", err);
      setError("Failed to create agent: " + (err.message || "Unknown error"));
      toast.error("Agent Creation Failed", {
        description: err.message || "Please try again later.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py- rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-10 pb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Create Your AI Agent (0.01 SOL)
          </h1>
          <form onSubmit={handleSubmit}>
            {/* Agent Type Selection */}
            <div>
              <p className="font-semibold text-lg text-white mb-4">Select Framework</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="flex flex-col lg:flex-row items-center border border-[#494848] px-2 py-4 xl:px-4 xl:py-4 rounded-lg text-center duration-700 lg:text-left cursor-pointer hover:bg-gray-900"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, agentType: "basic" }))
                  }
                >
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm md:text-base">
                      Basic Agent
                    </div>
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
                  <img
                    src={puppet}
                    className="w-14 h-14 lg:w-10 lg:h-10 mb-4 lg:mb-0 lg:mr-4 rounded-lg"
                    alt="PuppetOS"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm md:text-base">
                      PuppetOS
                    </div>
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

            {/* Required Fields */}
            <div className="mx-auto py-2 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col">
                  <label htmlFor="name" className="mb-1 text-white">
                    Name *
                  </label>
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
                  <label htmlFor="tone" className="mb-1 text-white">
                    Tone *
                  </label>
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
                  <label htmlFor="formality" className="mb-1 text-white">
                    Formality *
                  </label>
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
                  <label htmlFor="catchphrase" className="mb-1 text-white">
                    Catchphrase *
                  </label>
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
                <label htmlFor="bio" className="mb-1 text-white">
                  Bio *
                </label>
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

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            <div className="text-center w-full">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 rounded-4xl text-lg text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:text-white ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Processing..." : "Create (Pay 0.01 SOL)"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}