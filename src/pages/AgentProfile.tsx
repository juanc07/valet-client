import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAgentById } from "../api/agentApi";
import { getProfileImage } from "../api/imageApi";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../context/UserContext";

// Import default agent images
import agentDefaultImage1 from "../assets/agent-default-image/agent_default-1.jpg";
import agentDefaultImage2 from "../assets/agent-default-image/agent_default-2.jpg";
import agentDefaultImage3 from "../assets/agent-default-image/agent_default-3.jpg";
import agentDefaultImage4 from "../assets/agent-default-image/agent_default-4.jpg";
import agentDefaultImage5 from "../assets/agent-default-image/agent_default-5.jpg";
import agentDefaultImage6 from "../assets/agent-default-image/agent_default-6.jpg";
import agentDefaultImage7 from "../assets/agent-default-image/agent_default-7.jpg";

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
    enablePostTweet: false,
    postTweetInterval: 0,
    isTwitterPaid: false,
    telegramBotToken: "", // Added Telegram fields
    telegramGroupId: "",
    enableTelegramReplies: false,
    agentType: "basic",
    createdBy: "",
    profileImageId: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const { connected: walletConnected } = useWallet();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const defaultImages = [
    agentDefaultImage1,
    agentDefaultImage2,
    agentDefaultImage3,
    agentDefaultImage4,
    agentDefaultImage5,
    agentDefaultImage6,
    agentDefaultImage7,
  ];

  const getRandomDefaultImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    return defaultImages[randomIndex];
  };

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
        setLoading(false);
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
          enablePostTweet: agent.enablePostTweet || false,
          postTweetInterval: agent.postTweetInterval || 0,
          isTwitterPaid: agent.isTwitterPaid || false,
          telegramBotToken: agent.telegramBotToken || "", // Populate Telegram fields
          telegramGroupId: agent.telegramGroupId || "",
          enableTelegramReplies: agent.enableTelegramReplies || false,
          agentType: agent.agentType || "basic",
          profileImageId: agent.profileImageId || "",
        }));

        if (agent.profileImageId) {
          const imageData = await getProfileImage(agentId);
          setProfileImageUrl(imageData.url);
        } else {
          setProfileImageUrl(getRandomDefaultImage());
        }
      } catch (error: unknown) {
        console.error("Fetch agent or image error:", error);
        toast.error("Failed to Load Agent", {
          description: "Unable to fetch agent data or image. Please try again later.",
          duration: 3000,
        });
        if (!agentData.profileImageId) {
          setProfileImageUrl(getRandomDefaultImage());
        }
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
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-[#6894f3] text-4xl animate-spin"
          />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Agent Profile...
          </p>
        </div>
      </div>
    );
  }

  const isCreator = currentUser?.userId === agentData.createdBy;

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact" },
    { id: "wallets", label: "Wallets" },
    { id: "personality", label: "Personality" },
    ...(isCreator
      ? [
          { id: "knowledge", label: "Knowledge" },
          { id: "settings", label: "Settings" },
          { id: "twitter", label: "Twitter" },
          { id: "telegram", label: "Telegram" }, // Added Telegram tab
          { id: "api", label: "API Keys" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-lg shadow-lg p-4 sm:p-6 flex flex-col min-h-[80vh] relative">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-[#6a94f0] hover:text-[#8faef0] flex items-center gap-2 text-xs sm:text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Agents</span>
        </button>

        {/* Header with Profile Image */}
        <div className="mb-4 sm:mb-6 pt-8 flex flex-col items-center sm:flex-row sm:items-start sm:gap-4">
          {profileImageUrl && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
              <img
                src={profileImageUrl}
                alt={`${agentData.name || "Agent"} Profile`}
                className="w-full h-full rounded-full object-cover border-2 border-[#6a94f0] shadow-md"
              />
            </div>
          )}
          <div className="text-center mt-3 sm:mt-0 sm:text-left">
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-[#6a94f0] break-words max-w-[180px] sm:max-w-[200px] md:max-w-[300px] mx-auto sm:mx-0">
              {agentData.name || "Unnamed Agent"}
            </h1>
            <div className="flex justify-center sm:justify-start items-center gap-2 mt-2">
              <p className="text-gray-400 text-xs sm:text-sm">
                ID:{" "}
                <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
                  {agentData.agentId || "Not set"}
                </span>
              </p>
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
            <p className="text-xs sm:text-sm mt-1">
              Status:{" "}
              <span className={agentData.isActive ? "text-green-400" : "text-red-400"}>
                {agentData.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 bg-[#222128] p-2 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#6a94f0] text-black"
                  : "text-gray-300 hover:bg-[#333] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#222128] rounded-lg p-4 flex-1 overflow-y-auto text-xs sm:text-sm">
          {activeTab === "basic" && (
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Type:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{agentData.agentType || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Created By:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{agentData.createdBy || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Description:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">
                  {agentData.description || "Not set"}
                </p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Bio:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">{agentData.bio || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Mission:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">
                  {agentData.mission || "Not set"}
                </p>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Vision:</span>
                <p className="bg-[#1a1a1a] p-2 rounded-md whitespace-pre-wrap break-words">{agentData.vision || "Not set"}</p>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Email:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{agentData.contact?.email || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Website:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{agentData.contact?.website || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Twitter:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.contact?.socials?.twitter || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">GitHub:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.contact?.socials?.github || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">LinkedIn:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.contact?.socials?.linkedin || "Not set"}
                </span>
              </div>
            </div>
          )}

          {activeTab === "wallets" && (
            <div className="space-y-2 sm:space-y-4">
              {["solana", "ethereum", "bitcoin"].map((type) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">{type}:</span>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
                      {agentData.wallets?.[type as keyof Agent["wallets"]] || "Not set"}
                    </span>
                    {agentData.wallets?.[type as keyof Agent["wallets"]] && (
                      <button
                        onClick={() =>
                          handleCopy(agentData.wallets![type as keyof Agent["wallets"]]!, `${type} Wallet`)
                        }
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
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tone:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{agentData.personality?.tone || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Formality:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.personality?.formality || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Humor:</span>
                <span>{agentData.personality?.humor ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Catchphrase:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.personality?.catchphrase || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Topics:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.personality?.preferences?.topics?.join(", ") || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Languages:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.personality?.preferences?.languages?.join(", ") || "Not set"}
                </span>
              </div>
            </div>
          )}

          {isCreator && activeTab === "knowledge" && (
            <div className="space-y-2 sm:space-y-4">
              {Object.entries(agentData.knowledge).length > 0 ? (
                Object.entries(agentData.knowledge).map(([key, value]) => (
                  <div key={key} className="bg-[#1a1a1a] p-2 sm:p-3 rounded-md">
                    <p className="text-gray-400 text-xs sm:text-sm">{key}</p>
                    <p className="text-white whitespace-pre-wrap break-words">{value}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No knowledge data available.</p>
              )}
            </div>
          )}

          {isCreator && activeTab === "settings" && (
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Memory Context:</span>
                <span>{agentData.settings?.max_memory_context || "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Platforms:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.settings?.platforms?.join(", ") || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rule IDs:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {agentData.ruleIds?.join(", ") || "Not set"}
                </span>
              </div>
            </div>
          )}

          {isCreator && activeTab === "twitter" && (
            <div className="space-y-2 sm:space-y-4">
              {(["twitterHandle", "twitterAppKey", "twitterAppSecret", "twitterAccessToken", "twitterAccessSecret"] as const).map(
                (field) => (
                  <div key={field} className="flex justify-between items-center">
                    <span className="text-gray-400 capitalize">{field.replace(/([A-Z])/g, " $1").trim()}:</span>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
                        {(agentData[field] as string | undefined) || "Not set"}
                      </span>
                      {agentData[field] && (
                        <button
                          onClick={() =>
                            handleCopy(agentData[field] as string, field.replace(/([A-Z])/g, " $1").trim())
                          }
                          className="text-[#6a94f0] hover:text-[#8faef0]"
                          title={`Copy ${field.replace(/([A-Z])/g, " $1").trim()}`}
                        >
                          <FontAwesomeIcon icon={faCopy} size="sm" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Enable Tweet Posting:</span>
                <span>{agentData.enablePostTweet ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tweet Post Interval:</span>
                <span>{agentData.postTweetInterval ? `${agentData.postTweetInterval} seconds` : "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Twitter Paid Developer Account:</span>
                <span>{agentData.isTwitterPaid ? "Yes" : "No"}</span>
              </div>
            </div>
          )}

          {isCreator && activeTab === "telegram" && (
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Telegram Bot Token:</span>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
                    {agentData.telegramBotToken || "Not set"}
                  </span>
                  {agentData.telegramBotToken && (
                    <button
                      onClick={() => handleCopy(agentData.telegramBotToken!, "Telegram Bot Token")}
                      className="text-[#6a94f0] hover:text-[#8faef0]"
                      title="Copy Telegram Bot Token"
                    >
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Telegram Group ID:</span>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
                    {agentData.telegramGroupId || "Not set"}
                  </span>
                  {agentData.telegramGroupId && (
                    <button
                      onClick={() => handleCopy(agentData.telegramGroupId!, "Telegram Group ID")}
                      className="text-[#6a94f0] hover:text-[#8faef0]"
                      title="Copy Telegram Group ID"
                    >
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Enable Telegram Replies:</span>
                <span>{agentData.enableTelegramReplies ? "Yes" : "No"}</span>
              </div>
            </div>
          )}

          {isCreator && activeTab === "api" && (
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">OpenAI API Key:</span>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
                    {agentData.openaiApiKey || "Not set"}
                  </span>
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