import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAgentById, updateAgent } from "../api/agentApi";
import { getProfileImage } from "../api/imageApi";
import { requestTwitterOAuth } from "../api/twitterApi";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faArrowLeft, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../context/UserContext";
import Cookies from "js-cookie";
import ProfileImage from "../components/ProfileImage";

// Import default agent images
import agentDefaultImage1 from "../assets/agent-default-image/agent_default-1.jpg";
import agentDefaultImage2 from "../assets/agent-default-image/agent_default-2.jpg";
import agentDefaultImage3 from "../assets/agent-default-image/agent_default-3.jpg";
import agentDefaultImage4 from "../assets/agent-default-image/agent_default-4.jpg";
import agentDefaultImage5 from "../assets/agent-default-image/agent_default-5.jpg";
import agentDefaultImage6 from "../assets/agent-default-image/agent_default-6.jpg";
import agentDefaultImage7 from "../assets/agent-default-image/agent_default-7.jpg";

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
    agentType: "basic",
    createdBy: "",
    profileImageId: "",
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [newKnowledgeKey, setNewKnowledgeKey] = useState("");
  const [newKnowledgeValue, setNewKnowledgeValue] = useState("");
  // Removed isAdvancedTwitterSetup state since it’s always true now
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const { connected: walletConnected } = useWallet();
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();

  // Array of default images
  const defaultImages = [
    agentDefaultImage1,
    agentDefaultImage2,
    agentDefaultImage3,
    agentDefaultImage4,
    agentDefaultImage5,
    agentDefaultImage6,
    agentDefaultImage7,
  ];

  // Function to get a random default image
  const getRandomDefaultImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    return defaultImages[randomIndex];
  };

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!agentId) return;
      try {
        const agentData = await getAgentById(agentId);
        setFormData((prevData) => ({
          ...prevData,
          ...agentData,
          contact: { ...prevData.contact, ...(agentData.contact || {}), socials: { ...prevData.contact.socials, ...(agentData.contact?.socials || {}) } },
          wallets: { ...prevData.wallets, ...(agentData.wallets || {}) },
          knowledge: agentData.knowledge || {},
          personality: {
            ...prevData.personality,
            ...(agentData.personality || {}),
            preferences: { ...prevData.personality.preferences, ...(agentData.personality?.preferences || {}), topics: agentData.personality?.preferences?.topics || [], languages: agentData.personality?.preferences?.languages || [] },
          },
          settings: { ...prevData.settings, ...(agentData.settings || {}), platforms: agentData.settings?.platforms || [] },
          ruleIds: agentData.ruleIds || [],
          enablePostTweet: agentData.enablePostTweet || false,
          postTweetInterval: agentData.postTweetInterval || 0,
          profileImageId: agentData.profileImageId || "",
        }));

        if (agentData.profileImageId) {
          const imageData = await getProfileImage(agentId);
          setProfileImageUrl(imageData.url);
        } else {
          setProfileImageUrl(getRandomDefaultImage());
        }
      } catch (error: any) {
        console.error("Fetch agent or image error:", error);
        if (!formData.profileImageId) {
          setProfileImageUrl(getRandomDefaultImage());
        }
      }
    };
    if (agentId && (walletConnected || currentUser)) fetchAgentData();
  }, [agentId, walletConnected, currentUser]);

  // Removed cookie-based advanced setup logic since it’s always advanced now
  /*
  useEffect(() => {
    const savedAdvancedSetup = Cookies.get("isAdvancedTwitterSetup");
    if (savedAdvancedSetup !== undefined) {
      setIsAdvancedTwitterSetup(savedAdvancedSetup === "true");
    }
  }, []);
  */

  useEffect(() => {
    const isOAuthCallback = window.location.search.includes("oauth_callback");
    console.log("UpdateAgent walletConnected:", walletConnected, "Is OAuth callback:", isOAuthCallback, "Current user:", currentUser);

    if (!walletConnected && !isOAuthCallback && !currentUser) {
      console.log("Redirecting to / due to no wallet connection and no current user");
      navigate("/");
    } else if (isOAuthCallback) {
      const savedTab = sessionStorage.getItem("activeTab");
      const savedUser = sessionStorage.getItem("currentUser");
      if (savedTab === "twitter") {
        setActiveTab("twitter");
        sessionStorage.removeItem("activeTab");
        console.log("Restored tab to twitter and cleared sessionStorage");
      }
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        console.log("Restored currentUser from sessionStorage:", JSON.parse(savedUser));
      }
      window.history.replaceState({}, document.title, `/agent/edit/${agentId}`);
    }
  }, [walletConnected, navigate, agentId, currentUser, setCurrentUser]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.includes(".")) {
      const parts = name.split(".");
      setFormData((prevData) => {
        let current = { ...prevData };
        let ref: any = current;
        for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
        const finalKey = parts[parts.length - 1];
        ref[finalKey] = type === "checkbox" ? checked : value;
        return current;
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (profileImageId: string, url: string) => {
    setFormData((prev) => ({ ...prev, profileImageId }));
    setProfileImageUrl(url);
  };

  const handleArrayChange = (e: ChangeEvent<HTMLInputElement>, field: keyof Agent, subField?: "topics" | "languages" | "platforms") => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => {
      if (subField) {
        if (field === "personality" && (subField === "topics" || subField === "languages")) return { ...prev, personality: { ...prev.personality, preferences: { ...prev.personality.preferences, [subField]: value } } };
        if (field === "settings" && subField === "platforms") return { ...prev, settings: { ...prev.settings, platforms: value } };
      }
      if (field === "ruleIds") return { ...prev, ruleIds: value };
      return prev;
    });
  };

  const handleKnowledgeChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      knowledge: { ...prev.knowledge, [key]: value },
    }));
  };

  const handleAddKnowledge = () => {
    if (newKnowledgeKey && newKnowledgeValue && !formData.knowledge[newKnowledgeKey]) {
      setFormData((prev) => ({
        ...prev,
        knowledge: { ...prev.knowledge, [newKnowledgeKey]: newKnowledgeValue },
      }));
      setNewKnowledgeKey("");
      setNewKnowledgeValue("");
    } else if (!newKnowledgeKey || !newKnowledgeValue) {
      toast.error("Missing Knowledge Fields", { description: "Both key and value are required.", duration: 2000 });
    } else {
      toast.error("Duplicate Key", { description: "This knowledge key already exists.", duration: 2000 });
    }
  };

  const handleRemoveKnowledge = (key: string) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.knowledge;
      return { ...prev, knowledge: rest };
    });
  };

  const handleCopyWalletAddress = (walletType: keyof Agent["wallets"]) => {
    const walletAddress = formData.wallets[walletType];
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).then(() => toast.success(`${walletType} Address Copied`, { description: `The ${walletType} wallet address has been copied to your clipboard.`, duration: 3000 }));
    }
  };

  const handleTwitterOAuth = async () => {
    try {
      if (!agentId) throw new Error("Agent ID is required");
      sessionStorage.removeItem("hasCheckedWallet");
      sessionStorage.setItem("activeTab", "twitter");
      if (currentUser) {
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
      console.log("Cleared hasCheckedWallet, set activeTab to twitter, saved currentUser:", currentUser);
      const { redirectUrl } = await requestTwitterOAuth(agentId);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error) {
      console.error("Twitter OAuth initiation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Twitter Connection Failed", {
        description: `Unable to start Twitter authentication: ${errorMessage}`,
        duration: 3000,
      });
    }
  };

  // Removed handleAdvancedTwitterSetupChange since checkbox is hidden
  /*
  const handleAdvancedTwitterSetupChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsAdvancedTwitterSetup(isChecked);
    Cookies.set("isAdvancedTwitterSetup", isChecked.toString(), { expires: 365 });
  };
  */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agentId) return;

    const requiredFields: (keyof Agent | string)[] = ["name", "description", "bio", "mission", "vision", "personality.tone", "personality.formality", "personality.catchphrase", "agentType"];
    const missingFields = requiredFields.filter((field) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".") as [keyof Agent, string];
        return !(formData[parent] as any)?.[child];
      }
      return !formData[field as keyof Agent];
    });

    if (missingFields.length > 0) {
      toast.error("Form Submission Failed", { description: `Missing required fields: ${missingFields.join(", ")}`, duration: 3000 });
      return;
    }

    const { _id, ...updatePayload } = formData as Agent & { _id?: string };
    try {
      await updateAgent(agentId, updatePayload);
      toast.success("Agent Updated", { description: `Successfully updated agent: ${formData.name}`, duration: 3000 });
      navigate("/youragent");
    } catch (error: any) {
      toast.error("Update Failed", { description: "Please try again.", duration: 3000 });
    }
  };

  const handleBack = () => navigate("/youragent");

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Info" },
    { id: "wallets", label: "Wallets" },
    { id: "personality", label: "Personality" },
    { id: "knowledge", label: "Knowledge" },
    { id: "settings", label: "Settings" },
    { id: "twitter", label: "Twitter Config" },
    { id: "api", label: "API Keys" },
  ];

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py-0 rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-10 pb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-10">Update Agent</h1>
          <p className="text-lg mb-8">Agent ID: {agentId || "Not provided"}</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-8 relative">
              <div className="flex flex-wrap justify-center gap-2 bg-[#2a2a2a] rounded-t-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-all duration-200 relative z-10 ${activeTab === tab.id ? "bg-[#6a94f0] text-black" : "bg-[#494848] text-white hover:bg-[#6a94f0] hover:text-black"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-[#494848] z-0" />
            </div>

            <div className="space-y-6 min-h-[400px]">
              {activeTab === "basic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profile Image Section */}
                  <div className="col-span-1 md:col-span-2 flex justify-center mb-6">
                    <ProfileImage
                      agentId={agentId}
                      profileImageId={formData.profileImageId || ""}
                      profileImageUrl={profileImageUrl}
                      defaultImage={getRandomDefaultImage()}
                      onImageChange={handleImageChange}
                    />
                  </div>
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
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
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
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    >
                      <option value="basic">Basic</option>
                      <option value="puppetos">PuppetOS</option>
                      <option value="thirdparty">Third Party</option>
                    </select>
                  </div>
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
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      rows={3}
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
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      rows={3}
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
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      rows={3}
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
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={handleChange}
                      className="mr-2 text-[#6a94f0] border-[#494848] bg-black focus:ring-[#6a94f0]"
                    />
                    <label htmlFor="isActive" className="text-lg">
                      Is Active
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact.email" className="block text-lg mb-2">
                      Contact Email
                    </label>
                    <input
                      id="contact.email"
                      name="contact.email"
                      type="email"
                      value={formData.contact.email}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
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
                      value={formData.contact.website}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact.socials.twitter" className="block text-lg mb-2">
                      Twitter
                    </label>
                    <input
                      id="contact.socials.twitter"
                      name="contact.socials.twitter"
                      type="text"
                      value={formData.contact.socials.twitter}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact.socials.github" className="block text-lg mb-2">
                      GitHub
                    </label>
                    <input
                      id="contact.socials.github"
                      name="contact.socials.github"
                      type="text"
                      value={formData.contact.socials.github}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact.socials.linkedin" className="block text-lg mb-2">
                      LinkedIn
                    </label>
                    <input
                      id="contact.socials.linkedin"
                      name="contact.socials.linkedin"
                      type="text"
                      value={formData.contact.socials.linkedin}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                </div>
              )}

              {activeTab === "wallets" && (
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
                        value={formData.wallets.solana}
                        onChange={handleChange}
                        className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                      {formData.wallets.solana && (
                        <button
                          type="button"
                          onClick={() => handleCopyWalletAddress("solana")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6a94f0] hover:text-[#8faef0]"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wallets.ethereum" className="block text-lg mb-2">
                      Ethereum Wallet
                    </label>
                    <div className="relative">
                      <input
                        id="wallets.ethereum"
                        name="wallets.ethereum"
                        type="text"
                        value={formData.wallets.ethereum}
                        onChange={handleChange}
                        className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                      {formData.wallets.ethereum && (
                        <button
                          type="button"
                          onClick={() => handleCopyWalletAddress("ethereum")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6a94f0] hover:text-[#8faef0]"
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
                        value={formData.wallets.bitcoin}
                        onChange={handleChange}
                        className="w-full border border-[#494848] text-white p-2 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                      {formData.wallets.bitcoin && (
                        <button
                          type="button"
                          onClick={() => handleCopyWalletAddress("bitcoin")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6a94f0] hover:text-[#8faef0]"
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
                      <label htmlFor="personality.tone" className="block text-lg mb-2">
                        Tone *
                      </label>
                      <input
                        id="personality.tone"
                        name="personality.tone"
                        type="text"
                        value={formData.personality.tone}
                        onChange={handleChange}
                        required
                        className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="personality.formality" className="block text-lg mb-2">
                        Formality *
                      </label>
                      <input
                        id="personality.formality"
                        name="personality.formality"
                        type="text"
                        value={formData.personality.formality}
                        onChange={handleChange}
                        required
                        className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="personality.catchphrase" className="block text-lg mb-2">
                        Catchphrase *
                      </label>
                      <input
                        id="personality.catchphrase"
                        name="personality.catchphrase"
                        type="text"
                        value={formData.personality.catchphrase}
                        onChange={handleChange}
                        required
                        className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <input
                        id="personality.humor"
                        name="personality.humor"
                        type="checkbox"
                        checked={formData.personality.humor}
                        onChange={handleChange}
                        className="mr-2 text-[#6a94f0] border-[#494848] bg-black focus:ring-[#6a94f0]"
                      />
                      <label htmlFor="personality.humor" className="text-lg">
                        Humor
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="personality.preferences.topics" className="block text-lg mb-2">
                        Preferred Topics (comma-separated)
                      </label>
                      <input
                        id="personality.preferences.topics"
                        name="personality.preferences.topics"
                        type="text"
                        value={formData.personality.preferences.topics.join(", ")}
                        onChange={(e) => handleArrayChange(e, "personality", "topics")}
                        className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="personality.preferences.languages" className="block text-lg mb-2">
                        Languages (comma-separated)
                      </label>
                      <input
                        id="personality.preferences.languages"
                        name="personality.preferences.languages"
                        type="text"
                        value={formData.personality.preferences.languages.join(", ")}
                        onChange={(e) => handleArrayChange(e, "personality", "languages")}
                        className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "knowledge" && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(formData.knowledge).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-lg mb-2">Key</label>
                          <input
                            type="text"
                            value={key}
                            disabled
                            className="w-full border border-[#494848] text-white p-2 rounded-lg bg-[#333] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-lg mb-2">Value</label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleKnowledgeChange(key, e.target.value)}
                            className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveKnowledge(key)}
                            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-400 flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faMinus} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="newKnowledgeKey" className="block text-lg mb-2">
                        New Knowledge Key
                      </label>
                      <input
                        id="newKnowledgeKey"
                        type="text"
                        value={newKnowledgeKey}
                        onChange={(e) => setNewKnowledgeKey(e.target.value)}
                        className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="newKnowledgeValue" className="block text-lg mb-2">
                        New Knowledge Value
                      </label>
                      <input
                        id="newKnowledgeValue"
                        type="text"
                        value={newKnowledgeValue}
                        onChange={(e) => setNewKnowledgeValue(e.target.value)}
                        className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddKnowledge}
                        className="w-full py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-[#8faef0] transition-all duration-400 flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="settings.max_memory_context" className="block text-lg mb-2">
                      Max Memory Context
                    </label>
                    <input
                      id="settings.max_memory_context"
                      name="settings.max_memory_context"
                      type="number"
                      value={formData.settings.max_memory_context}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="settings.platforms" className="block text-lg mb-2">
                      Platforms (comma-separated)
                    </label>
                    <input
                      id="settings.platforms"
                      name="settings.platforms"
                      type="text"
                      value={formData.settings.platforms.join(", ")}
                      onChange={(e) => handleArrayChange(e, "settings", "platforms")}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="ruleIds" className="block text-lg mb-2">
                      Rule IDs (comma-separated)
                    </label>
                    <input
                      id="ruleIds"
                      name="ruleIds"
                      type="text"
                      value={formData.ruleIds.join(", ")}
                      onChange={(e) => handleArrayChange(e, "ruleIds")}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                </div>
              )}

              {activeTab === "twitter" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="twitterHandle" className="block text-lg mb-2">
                      Twitter Handle
                    </label>
                    <input
                      id="twitterHandle"
                      name="twitterHandle"
                      type="text"
                      value={formData.twitterHandle}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  {/* Always show advanced fields; no conditional rendering */}
                  <div>
                    <label htmlFor="twitterAppKey" className="block text-lg mb-2">
                      Twitter App Key
                    </label>
                    <input
                      id="twitterAppKey"
                      name="twitterAppKey"
                      type="text"
                      value={formData.twitterAppKey}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitterAppSecret" className="block text-lg mb-2">
                      Twitter App Secret
                    </label>
                    <input
                      id="twitterAppSecret"
                      name="twitterAppSecret"
                      type="text"
                      value={formData.twitterAppSecret}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitterAccessToken" className="block text-lg mb-2">
                      Twitter Access Token
                    </label>
                    <input
                      id="twitterAccessToken"
                      name="twitterAccessToken"
                      type="text"
                      value={formData.twitterAccessToken}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitterAccessSecret" className="block text-lg mb-2">
                      Twitter Access Secret
                    </label>
                    <input
                      id="twitterAccessSecret"
                      name="twitterAccessSecret"
                      type="text"
                      value={formData.twitterAccessSecret}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="enablePostTweet"
                      name="enablePostTweet"
                      type="checkbox"
                      checked={formData.enablePostTweet}
                      onChange={handleChange}
                      className="mr-2 text-[#6a94f0] border-[#494848] bg-black focus:ring-[#6a94f0]"
                    />
                    <label htmlFor="enablePostTweet" className="text-lg">
                      Enable Tweet Posting
                    </label>
                  </div>
                  <div>
                    <label htmlFor="postTweetInterval" className="block text-lg mb-2">
                      Tweet Post Interval (seconds)
                    </label>
                    <input
                      id="postTweetInterval"
                      name="postTweetInterval"
                      type="number"
                      value={formData.postTweetInterval}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                  {/* Checkbox removed from UI */}
                  {/* 
                  <div className="flex items-center">
                    <input
                      id="advancedTwitterSetup"
                      type="checkbox"
                      checked={isAdvancedTwitterSetup}
                      onChange={handleAdvancedTwitterSetupChange}
                      className="mr-2 text-[#6a94f0] border-[#494848] bg-black focus:ring-[#6a94f0]"
                    />
                    <label htmlFor="advancedTwitterSetup" className="text-lg">
                      Advanced Setup
                    </label>
                  </div>
                  */}
                  {/* Basic functionality (Connect with Twitter) commented out for future use */}
                  {/* 
                  <div className="col-span-1 md:col-span-2">
                    <button
                      type="button"
                      onClick={handleTwitterOAuth}
                      className="w-full py-2 px-4 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a91da] transition-all duration-400"
                    >
                      Connect with Twitter
                    </button>
                  </div>
                  */}
                </div>
              )}

              {activeTab === "api" && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="openaiApiKey" className="block text-lg mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      id="openaiApiKey"
                      name="openaiApiKey"
                      type="text"
                      value={formData.openaiApiKey}
                      onChange={handleChange}
                      className="w-full border border-[#494848] text-white p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-black"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button type="submit" className="py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-[#8faef0] transition-all duration-400 font-semibold">
                Save
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-[#8faef0] transition-all duration-400 font-semibold flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}