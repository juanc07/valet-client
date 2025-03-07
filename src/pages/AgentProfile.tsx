import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAgentById } from "../api/agentApi";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../context/UserContext"; // Added import

export default function AgentProfile() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agentData, setAgentData] = useState<Agent>({
    name: "",
    agentId: "",
    description: "",
    bio: "",
    mission: "",
    vision: "",
    contact: { email: "", website: "", socials: { twitter: "", github: "", linkedin: "" } },
    wallets: { solana: "", ethereum: "", bitcoin: "" },
    knowledge: { type: "", data: [] },
    personality: { tone: "", humor: false, formality: "", catchphrase: "", preferences: { topics: [], languages: [] } },
    settings: { max_memory_context: 0, platforms: [] },
    ruleIds: [],
    isActive: false,
    openaiApiKey: "",
    twitterAppKey: "",
    twitterAppSecret: "",
    twitterAccessToken: "",
    twitterAccessSecret: "",
    twitterHandle: "",
    agentType: "basic",
    createdBy: "",
  });
  const [loading, setLoading] = useState<boolean>(true);

  const { connected: walletConnected } = useWallet();
  const { currentUser } = useUser(); // Added to access context, though not used yet
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected) {
      navigate("/");
    }
  }, [walletConnected, navigate]);

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!agentId) {
        console.log("No agent ID provided.");
        toast.error("No Agent ID", { description: "Agent ID is required.", duration: 3000 });
        return;
      }

      try {
        console.log("Fetching agent with ID:", agentId);
        const agent = await getAgentById(agentId);
        console.log("Fetched agent data:", agent);
        setAgentData((prevData) => ({
          ...prevData,
          ...agent,
          contact: {
            ...prevData.contact,
            ...(agent.contact || {}),
            socials: {
              ...prevData.contact.socials,
              ...(agent.contact?.socials || {}),
            },
          },
          wallets: {
            ...prevData.wallets,
            ...(agent.wallets || {}),
          },
          knowledge: {
            ...prevData.knowledge,
            ...(agent.knowledge || {}),
            data: agent.knowledge?.data || [],
          },
          personality: {
            ...prevData.personality,
            ...(agent.personality || {}),
            preferences: {
              ...prevData.personality.preferences,
              ...(agent.personality?.preferences || {}),
              topics: agent.personality?.preferences?.topics || [],
              languages: agent.personality?.preferences?.languages || [],
            },
          },
          settings: {
            ...prevData.settings,
            ...(agent.settings || {}),
            platforms: agent.settings?.platforms || [],
          },
          ruleIds: agent.ruleIds || [],
        }));
      } catch (error: any) {
        console.error("Fetch agent error:", error);
        toast.error("Failed to Load Agent", {
          description: "Unable to fetch agent data. Please try again later.",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (agentId && walletConnected) {
      fetchAgentData();
    }
  }, [agentId, walletConnected, navigate]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} Copied`, {
        description: `Copied ${text} to clipboard.`,
        duration: 2000,
      });
    }).catch((error) => {
      console.error(`Error copying ${label}:`, error);
      toast.error("Copy Failed", {
        description: `Failed to copy ${label}.`,
        duration: 2000,
      });
    });
  };

  const handleBack = () => {
    navigate("/youragent"); // viewMode is preserved in UserContext
  };

  if (loading) {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
        <div className="text-center">Loading agent profile...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py-0 rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-10 pb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-10">Agent Profile</h1>
          <div className="flex justify-center items-center space-x-2 mb-4">
            <p className="text-lg">Agent ID: {agentData.agentId || "Not provided"}</p>
            {agentData.agentId && (
              <button
                onClick={() => handleCopy(agentData.agentId, "Agent ID")}
                className="text-[#6894f3] hover:text-[#8faef0]"
                title="Copy Agent ID"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Name</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.name || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Agent Type</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.agentType || "Not set"}</p>
              </div>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-lg mb-2">Description</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px]">{agentData.description || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Bio</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px]">{agentData.bio || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Mission</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px]">{agentData.mission || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Vision</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px]">{agentData.vision || "Not set"}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Contact Email</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.contact?.email || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Website</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.contact?.website || "Not set"}</p>
              </div>
            </div>

            {/* Socials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-lg mb-2">Twitter</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.contact?.socials?.twitter || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">GitHub</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.contact?.socials?.github || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">LinkedIn</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.contact?.socials?.linkedin || "Not set"}</p>
              </div>
            </div>

            {/* Wallets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-lg mb-2">Solana Wallet</label>
                <div className="relative">
                  <p className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] truncate">{agentData.wallets?.solana || "Not set"}</p>
                  {agentData.wallets?.solana && (
                    <button
                      onClick={() => handleCopy(agentData.wallets.solana!, "Solana Wallet")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                      title="Copy Solana Wallet"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-lg mb-2">Ethereum Wallet</label>
                <div className="relative">
                  <p className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] truncate">{agentData.wallets?.ethereum || "Not set"}</p>
                  {agentData.wallets?.ethereum && (
                    <button
                      onClick={() => handleCopy(agentData.wallets.ethereum!, "Ethereum Wallet")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                      title="Copy Ethereum Wallet"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-lg mb-2">Bitcoin Wallet</label>
                <div className="relative">
                  <p className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] truncate">{agentData.wallets?.bitcoin || "Not set"}</p>
                  {agentData.wallets?.bitcoin && (
                    <button
                      onClick={() => handleCopy(agentData.wallets.bitcoin!, "Bitcoin Wallet")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                      title="Copy Bitcoin Wallet"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Knowledge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Knowledge Type</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.knowledge?.type || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Knowledge Data</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.knowledge?.data?.join(", ") || "Not set"}</p>
              </div>
            </div>

            {/* Personality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Tone</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.tone || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Formality</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.formality || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Catchphrase</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.catchphrase || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Humor</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.humor ? "Yes" : "No"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Preferred Topics</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.preferences?.topics?.join(", ") || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Languages</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.preferences?.languages?.join(", ") || "Not set"}</p>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Max Memory Context</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.settings?.max_memory_context || "0"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Platforms</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.settings?.platforms?.join(", ") || "Not set"}</p>
              </div>
            </div>

            {/* API Keys and Twitter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">OpenAI API Key</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.openaiApiKey || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Twitter Handle</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.twitterHandle || "Not set"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Twitter App Key</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.twitterAppKey || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Twitter App Secret</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.twitterAppSecret || "Not set"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg mb-2">Twitter Access Token</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.twitterAccessToken || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Twitter Access Secret</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.twitterAccessSecret || "Not set"}</p>
              </div>
            </div>

            {/* Other Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-lg mb-2">Rule IDs</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.ruleIds?.join(", ") || "Not set"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Is Active</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.isActive ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="block text-lg mb-2">Created By</label>
                <p className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.createdBy || "Not set"}</p>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 flex items-center justify-center gap-2 mx-auto"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}