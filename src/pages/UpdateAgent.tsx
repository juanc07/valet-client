import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAgentById, updateAgent } from "../api/agentApi";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

export default function UpdateAgent() {
  const { agentId } = useParams<{ agentId: string }>();
  const [formData, setFormData] = useState<Agent>({
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

  const { connected: walletConnected } = useWallet();
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
        return;
      }

      try {
        console.log("Fetching agent with ID:", agentId);
        const agentData = await getAgentById(agentId);
        console.log("Fetched agent data:", agentData);
        setFormData((prevData) => ({
          ...prevData,
          ...agentData,
          contact: {
            ...prevData.contact,
            ...(agentData.contact || {}),
            socials: {
              ...prevData.contact.socials,
              ...(agentData.contact?.socials || {}),
            },
          },
          wallets: {
            ...prevData.wallets,
            ...(agentData.wallets || {}),
          },
          knowledge: {
            ...prevData.knowledge,
            ...(agentData.knowledge || {}),
            data: agentData.knowledge?.data || [],
          },
          personality: {
            ...prevData.personality,
            ...(agentData.personality || {}),
            preferences: {
              ...prevData.personality.preferences,
              ...(agentData.personality?.preferences || {}),
              topics: agentData.personality?.preferences?.topics || [],
              languages: agentData.personality?.preferences?.languages || [],
            },
          },
          settings: {
            ...prevData.settings,
            ...(agentData.settings || {}),
            platforms: agentData.settings?.platforms || [],
          },
          ruleIds: agentData.ruleIds || [],
        }));
      } catch (error: any) {
        console.error("Fetch agent error:", error);
      }
    };

    if (agentId && walletConnected) {
      fetchAgentData();
    }
  }, [agentId, walletConnected]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.includes(".")) {
      const parts = name.split("."); // Split into array: e.g., ["contact", "socials", "twitter"]
      setFormData((prevData) => {
        let current = { ...prevData };

        // Navigate and update nested structure
        let ref: any = current;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = parts[i] as keyof Agent;
          if (!ref[key] || typeof ref[key] !== "object") {
            ref[key] = {};
          }
          ref = ref[key];
        }

        const finalKey = parts[parts.length - 1];
        const newValue = type === "checkbox" ? checked : value;
        if (newValue !== undefined) {
          ref[finalKey] = newValue;
        }

        return current;
      });
    } else {
      setFormData((prevData) => {
        const newValue = type === "checkbox" ? checked : value;
        if (newValue === undefined) return prevData;
        return {
          ...prevData,
          [name]: newValue,
        };
      });
    }
  };

  const handleArrayChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof Agent,
    subField?: "data" | "topics" | "languages" | "platforms"
  ) => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => {
      if (subField) {
        if (field === "knowledge" && subField === "data") {
          return {
            ...prev,
            knowledge: { ...prev.knowledge, data: value },
          };
        }
        if (field === "personality" && (subField === "topics" || subField === "languages")) {
          return {
            ...prev,
            personality: {
              ...prev.personality,
              preferences: { ...prev.personality.preferences, [subField]: value },
            },
          };
        }
        if (field === "settings" && subField === "platforms") {
          return {
            ...prev,
            settings: { ...prev.settings, platforms: value },
          };
        }
        return prev;
      }
      if (field === "ruleIds") {
        return { ...prev, ruleIds: value };
      }
      return prev;
    });
  };

  const handleCopyWalletAddress = (walletType: keyof Agent["wallets"]) => {
    const walletAddress = formData.wallets[walletType];
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).then(() => {
        toast.success(`${walletType} Address Copied`, {
          description: `The ${walletType} wallet address has been copied to your clipboard.`,
          duration: 3000,
        });
      }).catch((err) => {
        console.error(`Failed to copy ${walletType} address:`, err);
        toast.error("Copy Failed", {
          description: `Failed to copy the ${walletType} address.`,
          duration: 3000,
        });
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agentId) return;

    const requiredFields: (keyof Agent | string)[] = [
      "name",
      "description",
      "bio",
      "mission",
      "vision",
      "personality.tone",
      "personality.formality",
      "personality.catchphrase",
      "agentType",
    ];

    const missingFields = requiredFields.filter((field) => {
      if (typeof field === "string" && field.includes(".")) {
        const [parent, child] = field.split(".") as [keyof Agent, string];
        const parentValue = formData[parent];
        return typeof parentValue === "object" && parentValue !== null ? !((parentValue as any)[child]) : true;
      }
      return !formData[field as keyof Agent];
    });

    if (missingFields.length > 0) {
      toast.error("Form Submission Failed", {
        description: `Missing required fields: ${missingFields.join(", ")}`,
        duration: 3000,
      });
      return;
    }

    // Only exclude _id since agentId is part of the interface and allowed in payload
    const { _id, ...updatePayload } = formData as Agent & { _id?: string };

    try {
      console.log("Submitting formData:", updatePayload);
      await updateAgent(agentId, updatePayload);
      toast.success("Agent Updated", {
        description: `Successfully updated agent: ${formData.name}`,
        duration: 3000,
      });
      navigate("/youragent");
    } catch (error: any) {
      console.error("Update agent error:", error);
      toast.error("Update Failed", {
        description: "Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py-0 rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-10 pb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-10">Update Agent</h1>
          <p className="text-lg mb-4">Agent ID: {agentId || "Not provided"}</p>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-lg mb-2">
                    Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="agentType" className="block text-lg mb-2">
                    Agent Type *
                  </label>
                  <select
                    id="agentType"
                    name="agentType"
                    value={formData.agentType}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500 bg-black"
                  >
                    <option value="basic">Basic</option>
                    <option value="puppetos">PuppetOS</option>
                    <option value="thirdparty">Third Party</option>
                  </select>
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="description" className="block text-lg mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-lg mb-2">
                    Bio *
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="mission" className="block text-lg mb-2">
                    Mission *
                  </label>
                  <textarea
                    id="mission"
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="vision" className="block text-lg mb-2">
                    Vision *
                  </label>
                  <textarea
                    id="vision"
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact.email" className="block text-lg mb-2">
                    Contact Email
                  </label>
                  <input
                    id="contact.email"
                    name="contact.email"
                    type="email"
                    value={formData.contact?.email || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="contact.website" className="block text-lg mb-2">
                    Website
                  </label>
                  <input
                    id="contact.website"
                    name="contact.website"
                    type="url"
                    value={formData.contact?.website || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Socials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="contact.socials.twitter"
                    className="block text-lg mb-2"
                  >
                    Twitter
                  </label>
                  <input
                    id="contact.socials.twitter"
                    name="contact.socials.twitter"
                    type="text"
                    value={formData.contact?.socials?.twitter || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact.socials.github"
                    className="block text-lg mb-2"
                  >
                    GitHub
                  </label>
                  <input
                    id="contact.socials.github"
                    name="contact.socials.github"
                    type="text"
                    value={formData.contact?.socials?.github || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact.socials.linkedin"
                    className="block text-lg mb-2"
                  >
                    LinkedIn
                  </label>
                  <input
                    id="contact.socials.linkedin"
                    name="contact.socials.linkedin"
                    type="text"
                    value={formData.contact?.socials?.linkedin || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Wallets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="wallets.solana" className="block text-lg mb-2">
                    Solana Wallet
                  </label>
                  <div className="relative">
                    <input
                      id="wallets.solana"
                      name="wallets.solana"
                      type="text"
                      value={formData.wallets?.solana || ""}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    />
                    {formData.wallets?.solana && (
                      <button
                        type="button"
                        onClick={() => handleCopyWalletAddress("solana")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="wallets.ethereum"
                    className="block text-lg mb-2"
                  >
                    Ethereum Wallet
                  </label>
                  <div className="relative">
                    <input
                      id="wallets.ethereum"
                      name="wallets.ethereum"
                      type="text"
                      value={formData.wallets?.ethereum || ""}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    />
                    {formData.wallets?.ethereum && (
                      <button
                        type="button"
                        onClick={() => handleCopyWalletAddress("ethereum")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="wallets.bitcoin" className="block text-lg mb-2">
                    Bitcoin Wallet
                  </label>
                  <div className="relative">
                    <input
                      id="wallets.bitcoin"
                      name="wallets.bitcoin"
                      type="text"
                      value={formData.wallets?.bitcoin || ""}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    />
                    {formData.wallets?.bitcoin && (
                      <button
                        type="button"
                        onClick={() => handleCopyWalletAddress("bitcoin")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]"
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
                  <label htmlFor="knowledge.type" className="block text-lg mb-2">
                    Knowledge Type
                  </label>
                  <input
                    id="knowledge.type"
                    name="knowledge.type"
                    type="text"
                    value={formData.knowledge?.type || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="knowledge.data" className="block text-lg mb-2">
                    Knowledge Data (comma-separated)
                  </label>
                  <input
                    id="knowledge.data"
                    name="knowledge.data"
                    type="text"
                    value={formData.knowledge?.data?.join(", ") || ""}
                    onChange={(e) => handleArrayChange(e, "knowledge", "data")}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Personality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="personality.tone"
                    className="block text-lg mb-2"
                  >
                    Tone *
                  </label>
                  <input
                    id="personality.tone"
                    name="personality.tone"
                    type="text"
                    value={formData.personality?.tone || ""}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="personality.formality"
                    className="block text-lg mb-2"
                  >
                    Formality *
                  </label>
                  <input
                    id="personality.formality"
                    name="personality.formality"
                    type="text"
                    value={formData.personality?.formality || ""}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="personality.catchphrase"
                    className="block text-lg mb-2"
                  >
                    Catchphrase *
                  </label>
                  <input
                    id="personality.catchphrase"
                    name="personality.catchphrase"
                    type="text"
                    value={formData.personality?.catchphrase || ""}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <input
                    id="personality.humor"
                    name="personality.humor"
                    type="checkbox"
                    checked={formData.personality?.humor || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="personality.humor"
                    className="text-lg"
                  >
                    Humor
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="personality.preferences.topics"
                    className="block text-lg mb-2"
                  >
                    Preferred Topics (comma-separated)
                  </label>
                  <input
                    id="personality.preferences.topics"
                    name="personality.preferences.topics"
                    type="text"
                    value={formData.personality?.preferences?.topics?.join(", ") || ""}
                    onChange={(e) => handleArrayChange(e, "personality", "topics")}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="personality.preferences.languages"
                    className="block text-lg mb-2"
                  >
                    Languages (comma-separated)
                  </label>
                  <input
                    id="personality.preferences.languages"
                    name="personality.preferences.languages"
                    type="text"
                    value={formData.personality?.preferences?.languages?.join(", ") || ""}
                    onChange={(e) => handleArrayChange(e, "personality", "languages")}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="settings.max_memory_context"
                    className="block text-lg mb-2"
                  >
                    Max Memory Context
                  </label>
                  <input
                    id="settings.max_memory_context"
                    name="settings.max_memory_context"
                    type="number"
                    value={formData.settings?.max_memory_context || 0}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="settings.platforms"
                    className="block text-lg mb-2"
                  >
                    Platforms (comma-separated)
                  </label>
                  <input
                    id="settings.platforms"
                    name="settings.platforms"
                    type="text"
                    value={formData.settings?.platforms?.join(", ") || ""}
                    onChange={(e) => handleArrayChange(e, "settings", "platforms")}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* API Keys and Twitter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="openaiApiKey" className="block text-lg mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    id="openaiApiKey"
                    name="openaiApiKey"
                    type="text"
                    value={formData.openaiApiKey || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="twitterHandle" className="block text-lg mb-2">
                    Twitter Handle
                  </label>
                  <input
                    id="twitterHandle"
                    name="twitterHandle"
                    type="text"
                    value={formData.twitterHandle || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="twitterAppKey" className="block text-lg mb-2">
                    Twitter App Key
                  </label>
                  <input
                    id="twitterAppKey"
                    name="twitterAppKey"
                    type="text"
                    value={formData.twitterAppKey || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="twitterAppSecret"
                    className="block text-lg mb-2"
                  >
                    Twitter App Secret
                  </label>
                  <input
                    id="twitterAppSecret"
                    name="twitterAppSecret"
                    type="text"
                    value={formData.twitterAppSecret || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="twitterAccessToken"
                    className="block text-lg mb-2"
                  >
                    Twitter Access Token
                  </label>
                  <input
                    id="twitterAccessToken"
                    name="twitterAccessToken"
                    type="text"
                    value={formData.twitterAccessToken || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="twitterAccessSecret"
                    className="block text-lg mb-2"
                  >
                    Twitter Access Secret
                  </label>
                  <input
                    id="twitterAccessSecret"
                    name="twitterAccessSecret"
                    type="text"
                    value={formData.twitterAccessSecret || ""}
                    onChange={handleChange}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Other Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="ruleIds" className="block text-lg mb-2">
                    Rule IDs (comma-separated)
                  </label>
                  <input
                    id="ruleIds"
                    name="ruleIds"
                    type="text"
                    value={formData.ruleIds?.join(", ") || ""}
                    onChange={(e) => handleArrayChange(e, "ruleIds")}
                    className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-lg">
                    Is Active
                  </label>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}