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
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">Loading agent profile...</div>
      </div>
    );
  }

  const isCreator = currentUser?.userId === agentData.createdBy;

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact" },
    { id: "wallets", label: "Wallets" },
    { id: "personality", label: "Personality" },
    { id: "knowledge", label: "Knowledge" },
    ...(isCreator ? [
      { id: "settings", label: "Settings" },
      { id: "twitter", label: "Twitter" },
      { id: "api", label: "API Keys" },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-lg shadow-lg p-6 relative flex flex-col h-[80vh]">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-[#6a94f0] hover:text-[#8faef0] flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-8">
          <h1 className="text-3xl font-bold text-[#6a94f0]">{agentData.name || "Unnamed Agent"}</h1>
          <div className="flex justify-center items-center gap-2 mt-2">
            <p className="text-gray-400 text-sm">ID: {agentData.agentId || "Not set"}</p>
            {agentData.agentId && (
              <button
                onClick={() => handleCopy(agentData.agentId, "Agent ID")}
                className="text-[#6a94f0] hover:text-[#8faef0]"
                title="Copy Agent ID"
              >
                <FontAwesomeIcon icon={faCopy} size="sm" />
              </button>
            )}
          </div>
          <p className="text-sm mt-1">
            Status: <span className={agentData.isActive ? "text-green-400" : "text-red-400"}>{agentData.isActive ? "Active" : "Inactive"}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 bg-[#222128] p-2 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#6a94f0] text-black"
                  : "text-gray-300 hover:bg-[#333] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content with Fixed Height and Scroll */}
        <div className="bg-[#222128] rounded-lg p-4 flex-1 overflow-y-auto">
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Type:</span>
                <span>{agentData.agentType || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Created By:</span>
                <span>{agentData.createdBy || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Description:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">{agentData.description || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Bio:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">{agentData.bio || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Mission:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">{agentData.mission || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Vision:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">{agentData.vision || "Not set"}</p>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Email:</span>
                <span>{agentData.contact?.email || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Website:</span>
                <span>{agentData.contact?.website || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Twitter:</span>
                <span>{agentData.contact?.socials?.twitter || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">GitHub:</span>
                <span>{agentData.contact?.socials?.github || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">LinkedIn:</span>
                <span>{agentData.contact?.socials?.linkedin || "Not set"}</span>
              </div>
            </div>
          )}

          {activeTab === "wallets" && (
            <div className="space-y-4">
              {["solana", "ethereum", "bitcoin"].map((type) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">{type}:</span>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]">{agentData.wallets?.[type as keyof Agent["wallets"]] || "Not set"}</span>
                    {agentData.wallets?.[type as keyof Agent["wallets"]] && (
                      <button
                        onClick={() => handleCopy(agentData.wallets![type as keyof Agent["wallets"]]!, `${type} Wallet`)}
                        className="text-[#6a94f0] hover:text-[#8faef0]"
                        title={`Copy ${type} Wallet`}
                      >
                        <FontAwesomeIcon icon={faCopy} size="sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "personality" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tone:</span>
                <span>{agentData.personality?.tone || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Formality:</span>
                <span>{agentData.personality?.formality || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Humor:</span>
                <span>{agentData.personality?.humor ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Catchphrase:</span>
                <span>{agentData.personality?.catchphrase || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Topics:</span>
                <span>{agentData.personality?.preferences?.topics?.join(", ") || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Languages:</span>
                <span>{agentData.personality?.preferences?.languages?.join(", ") || "Not set"}</span>
              </div>
            </div>
          )}

          {activeTab === "knowledge" && (
            <div className="space-y-4">
              {Object.entries(agentData.knowledge).length > 0 ? (
                Object.entries(agentData.knowledge).map(([key, value]) => (
                  <div key={key} className="bg-[#1a1a1a] p-3 rounded-md">
                    <p className="text-gray-400 text-sm">{key}</p>
                    <p className="text-white whitespace-pre-wrap break-words">{value}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No knowledge data available.</p>
              )}
            </div>
          )}

          {isCreator && activeTab === "settings" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Memory Context:</span>
                <span>{agentData.settings?.max_memory_context || "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Platforms:</span>
                <span>{agentData.settings?.platforms?.join(", ") || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rule IDs:</span>
                <span>{agentData.ruleIds?.join(", ") || "Not set"}</span>
              </div>
            </div>
          )}

          {isCreator && activeTab === "twitter" && (
            <div className="space-y-4">
              {(["twitterHandle", "twitterAppKey", "twitterAppSecret", "twitterAccessToken", "twitterAccessSecret"] as const).map((field) => (
                <div key={field} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">{field.replace(/([A-Z])/g, " $1").trim()}:</span>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]">
                      {(agentData[field] as string | undefined) || "Not set"}
                    </span>
                    {agentData[field] && (
                      <button
                        onClick={() => handleCopy(agentData[field] as string, field.replace(/([A-Z])/g, " $1").trim())}
                        className="text-[#6a94f0] hover:text-[#8faef0]"
                        title={`Copy ${field.replace(/([A-Z])/g, " $1").trim()}`}
                      >
                        <FontAwesomeIcon icon={faCopy} size="sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isCreator && activeTab === "api" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">OpenAI API Key:</span>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[200px]">{agentData.openaiApiKey || "Not set"}</span>
                  {agentData.openaiApiKey && (
                    <button
                      onClick={() => handleCopy(agentData.openaiApiKey!, "OpenAI API Key")}
                      className="text-[#6a94f0] hover:text-[#8faef0]"
                      title="Copy OpenAI API Key"
                    >
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}