import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAgentById } from "../api/agentApi";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../context/UserContext";

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
    knowledge: {},
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
  const [activeTab, setActiveTab] = useState("basic");

  const { connected: walletConnected } = useWallet();
  const { currentUser } = useUser();
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
          knowledge: agent.knowledge || {},
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
    navigate("/youragent");
  };

  if (loading) {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
        <div className="text-center">Loading agent profile...</div>
      </div>
    );
  }

  // Check if the current user is the creator
  const isCreator = currentUser?.userId === agentData.createdBy;

  // Define tabs, filtering out sensitive ones if not the creator
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Info" },
    { id: "wallets", label: "Wallets" },
    { id: "personality", label: "Personality" },
    { id: "knowledge", label: "Knowledge" },
    ...(isCreator ? [
      { id: "settings", label: "Settings" },
      { id: "twitter", label: "Twitter Config" },
      { id: "api", label: "API Keys" },
    ] : []),
  ];

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py-0 rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-10 pb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-10">Agent Profile</h1>
          <div className="flex justify-center items-center space-x-2 mb-8">
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

          {/* Tab Navigation */}
          <div className="mb-8 relative">
            <div className="flex flex-wrap justify-center gap-2 bg-[#2a2a2a] rounded-t-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-all duration-200 relative z-10 ${
                    activeTab === tab.id
                      ? "bg-[#6a94f0] text-black"
                      : "bg-[#494848] text-white hover:bg-[#6a94f0] hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#494848] z-0" />
          </div>

          {/* Tab Content */}
          <div className="space-y-6 min-h-[400px]">
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg mb-2">Name</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.name || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Agent Type</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.agentType || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Description</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px] whitespace-pre-wrap break-words">{agentData.description || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Bio</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px] whitespace-pre-wrap break-words">{agentData.bio || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Mission</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px] whitespace-pre-wrap break-words">{agentData.mission || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Vision</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] min-h-[80px] whitespace-pre-wrap break-words">{agentData.vision || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Is Active</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.isActive ? "Yes" : "No"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Created By</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.createdBy || "Not set"}</div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg mb-2">Contact Email</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.contact?.email || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Website</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.contact?.website || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Twitter</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.contact?.socials?.twitter || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">GitHub</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.contact?.socials?.github || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">LinkedIn</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.contact?.socials?.linkedin || "Not set"}</div>
                </div>
              </div>
            )}

            {activeTab === "wallets" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-lg mb-2">Solana Wallet</label>
                  <div className="relative">
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.wallets?.solana || "Not set"}</div>
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
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.wallets?.ethereum || "Not set"}</div>
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
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.wallets?.bitcoin || "Not set"}</div>
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
            )}

            {activeTab === "personality" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg mb-2">Tone</label>
                    <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.tone || "Not set"}</div>
                  </div>
                  <div>
                    <label className="block text-lg mb-2">Formality</label>
                    <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.formality || "Not set"}</div>
                  </div>
                  <div>
                    <label className="block text-lg mb-2">Catchphrase</label>
                    <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.personality?.catchphrase || "Not set"}</div>
                  </div>
                  <div>
                    <label className="block text-lg mb-2">Humor</label>
                    <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.personality?.humor ? "Yes" : "No"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg mb-2">Preferred Topics</label>
                    <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.personality?.preferences?.topics?.join(", ") || "Not set"}</div>
                  </div>
                  <div>
                    <label className="block text-lg mb-2">Languages</label>
                    <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.personality?.preferences?.languages?.join(", ") || "Not set"}</div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "knowledge" && (
              <div className="space-y-4">
                {Object.entries(agentData.knowledge).length > 0 ? (
                  Object.entries(agentData.knowledge).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-lg mb-2">Key</label>
                        <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{key}</div>
                      </div>
                      <div>
                        <label className="block text-lg mb-2">Value</label>
                        <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{value}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">No knowledge data available.</div>
                )}
              </div>
            )}

            {isCreator && activeTab === "settings" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg mb-2">Max Memory Context</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128]">{agentData.settings?.max_memory_context || "0"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Platforms</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.settings?.platforms?.join(", ") || "Not set"}</div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Rule IDs</label>
                  <div className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#222128] whitespace-pre-wrap break-words">{agentData.ruleIds?.join(", ") || "Not set"}</div>
                </div>
              </div>
            )}

            {isCreator && activeTab === "twitter" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg mb-2">Twitter Handle</label>
                  <div className="relative">
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.twitterHandle || "Not set"}</div>
                    {agentData.twitterHandle && (
                      <button
                        onClick={() => handleCopy(agentData.twitterHandle!, "Twitter Handle")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                        title="Copy Twitter Handle"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Twitter App Key</label>
                  <div className="relative">
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.twitterAppKey || "Not set"}</div>
                    {agentData.twitterAppKey && (
                      <button
                        onClick={() => handleCopy(agentData.twitterAppKey!, "Twitter App Key")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                        title="Copy Twitter App Key"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Twitter App Secret</label>
                  <div className="relative">
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.twitterAppSecret || "Not set"}</div>
                    {agentData.twitterAppSecret && (
                      <button
                        onClick={() => handleCopy(agentData.twitterAppSecret!, "Twitter App Secret")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                        title="Copy Twitter App Secret"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Twitter Access Token</label>
                  <div className="relative">
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.twitterAccessToken || "Not set"}</div>
                    {agentData.twitterAccessToken && (
                      <button
                        onClick={() => handleCopy(agentData.twitterAccessToken!, "Twitter Access Token")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                        title="Copy Twitter Access Token"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-lg mb-2">Twitter Access Secret</label>
                  <div className="relative">
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.twitterAccessSecret || "Not set"}</div>
                    {agentData.twitterAccessSecret && (
                      <button
                        onClick={() => handleCopy(agentData.twitterAccessSecret!, "Twitter Access Secret")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                        title="Copy Twitter Access Secret"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isCreator && activeTab === "api" && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-lg mb-2">OpenAI API Key</label>
                  <div className="relative">
                    <div className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg bg-[#222128] whitespace-pre-wrap break-words min-h-[40px]">{agentData.openaiApiKey || "Not set"}</div>
                    {agentData.openaiApiKey && (
                      <button
                        onClick={() => handleCopy(agentData.openaiApiKey!, "OpenAI API Key")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                        title="Copy OpenAI API Key"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleBack}
              className="py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-[#8faef0] transition-all duration-400 font-semibold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}