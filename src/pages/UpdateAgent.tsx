import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { Agent } from "../interfaces/agent";
import { updateAgent } from "../api/agentApi";

const BASE_URL = "http://localhost:3000";

interface UpdateAgentProps {
    agentId: string;
}

export default function UpdateAgent({ agentId }: UpdateAgentProps) {
    const [formData, setFormData] = useState<Agent>({
        name: "",
        id: agentId,
        description: "",
        bio: "",
        mission: "",
        vision: "",
        contact: {
            email: "",
            website: "",
            socials: {
                twitter: "",
                github: "",
                linkedin: "",
            },
        },
        wallets: {
            solana: "",
            ethereum: "",
            bitcoin: "",
        },
        knowledge: {
            type: "",
            data: [],
        },
        personality: {
            tone: "",
            humor: false,
            formality: "",
            catchphrase: "",
            preferences: {
                topics: [],
                languages: [],
            },
        },
        settings: {
            max_memory_context: 0,
            platforms: [],
        },
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
    const [error, setError] = useState<string>("");

    const { connected: walletConnected, publicKey } = useWallet();
    const navigate = useNavigate();

    useEffect(() => {
        if (!walletConnected) {
            navigate("/");
        }
    }, [walletConnected, navigate]);

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                console.log("Fetching agent with ID:", agentId);
                const response = await fetch(`${BASE_URL}/agents/${agentId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const agentData: Agent = await response.json();
                console.log("Fetched agent data:", agentData);
                setFormData(agentData);
            } catch (error) {
                console.error("Fetch agent error:", error);
                setError("Failed to load agent data.");
                toast.error("Failed to load agent", {
                    description: "Please try again later.",
                    duration: 3000,
                });
            }
        };

        if (agentId && walletConnected) {
            fetchAgentData();
        }
    }, [agentId, walletConnected]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

        if (name.includes(".")) {
            const [parent, child] = name.split(".") as [keyof Agent, string];
            setFormData((prevData) => {
                const parentValue = prevData[parent];
                if (typeof parentValue === "object" && parentValue !== null) {
                    return {
                        ...prevData,
                        [parent]: {
                            ...parentValue,
                            [child]: type === "checkbox" ? checked : value,
                        } as any,
                    };
                }
                return prevData;
            });
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name as keyof Agent]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleArrayChange = (
        e: ChangeEvent<HTMLInputElement>,
        field: keyof Agent,
        subField?: "data" | "topics" | "languages" | "platforms"
    ) => {
        const value = e.target.value.split(",").map(item => item.trim());
        setFormData((prev) => {
            if (subField) {
                if (field === "knowledge" && subField === "data") {
                    return {
                        ...prev,
                        knowledge: {
                            ...prev.knowledge,
                            data: value,
                        },
                    };
                }
                if (field === "personality" && (subField === "topics" || subField === "languages")) {
                    return {
                        ...prev,
                        personality: {
                            ...prev.personality,
                            preferences: {
                                ...prev.personality.preferences,
                                [subField]: value,
                            },
                        },
                    };
                }
                if (field === "settings" && subField === "platforms") {
                    return {
                        ...prev,
                        settings: {
                            ...prev.settings,
                            platforms: value,
                        },
                    };
                }
                return prev; // Fallback if no match
            }
            if (field === "ruleIds") {
                return {
                    ...prev,
                    ruleIds: value,
                };
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

        const missingFields = requiredFields.filter((field): boolean => {
            if (typeof field === "string" && field.includes(".")) {
                const [parent, child] = field.split(".") as [keyof Agent, string];
                const parentValue = formData[parent];
                if (typeof parentValue === "object" && parentValue !== null) {
                    return !((parentValue as any)[child]);
                }
                return true;
            }
            return !formData[field as keyof Agent];
        });

        if (missingFields.length > 0) {
            setError(`Missing required fields: ${missingFields.join(", ")}`);
            toast.error("Form Submission Failed", {
                description: `Missing required fields: ${missingFields.join(", ")}`,
                duration: 3000,
            });
            return;
        }

        try {
            console.log("Submitting update for agentId:", agentId, "with data:", formData);
            const response = await updateAgent(agentId, formData);
            console.log("Update successful:", response);
            setError("");
            toast.success("Agent Updated", {
                description: `Successfully updated agent: ${formData.name}`,
                duration: 3000,
            });
        } catch (error) {
            console.error("Update agent error:", error);
            setError("Failed to update agent.");
            toast.error("Update Failed", {
                description: "Please try again.",
                duration: 3000,
            });
        }
    };

    return (
        <>
            <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
                <div className="w-full px-2 py-2 lg:px-0 lg:py- rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
                    <div className="w-full lg:w-4/5 pt-10 pb-10">
                        <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">
                            Update Agent
                        </h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mx-auto py-2">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="name" className="mb-1 text-white">Name *</label>
                                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="agentType" className="mb-1 text-white">Agent Type *</label>
                                        <select id="agentType" name="agentType" value={formData.agentType} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500 bg-black">
                                            <option value="basic">Basic</option>
                                            <option value="puppetos">PuppetOS</option>
                                            <option value="thirdparty">Third Party</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description Fields */}
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="description" className="mb-1 text-white">Description *</label>
                                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="bio" className="mb-1 text-white">Bio *</label>
                                        <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="mission" className="mb-1 text-white">Mission *</label>
                                        <textarea id="mission" name="mission" value={formData.mission} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="vision" className="mb-1 text-white">Vision *</label>
                                        <textarea id="vision" name="vision" value={formData.vision} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="contact.email" className="mb-1 text-white">Contact Email</label>
                                        <input id="contact.email" name="contact.email" type="email" value={formData.contact.email} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="contact.website" className="mb-1 text-white">Website</label>
                                        <input id="contact.website" name="contact.website" type="url" value={formData.contact.website} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                </div>

                                {/* Socials */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="contact.socials.twitter" className="mb-1 text-white">Twitter</label>
                                        <input id="contact.socials.twitter" name="contact.socials.twitter" type="text" value={formData.contact.socials.twitter} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="contact.socials.github" className="mb-1 text-white">GitHub</label>
                                        <input id="contact.socials.github" name="contact.socials.github" type="text" value={formData.contact.socials.github} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="contact.socials.linkedin" className="mb-1 text-white">LinkedIn</label>
                                        <input id="contact.socials.linkedin" name="contact.socials.linkedin" type="text" value={formData.contact.socials.linkedin} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                </div>

                                {/* Wallets */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="wallets.solana" className="mb-1 text-white">Solana Wallet</label>
                                        <div className="relative">
                                            <input id="wallets.solana" name="wallets.solana" type="text" value={formData.wallets.solana} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                            {formData.wallets.solana && (
                                                <button type="button" onClick={() => handleCopyWalletAddress("solana")} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]">
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="wallets.ethereum" className="mb-1 text-white">Ethereum Wallet</label>
                                        <div className="relative">
                                            <input id="wallets.ethereum" name="wallets.ethereum" type="text" value={formData.wallets.ethereum} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                            {formData.wallets.ethereum && (
                                                <button type="button" onClick={() => handleCopyWalletAddress("ethereum")} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]">
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="wallets.bitcoin" className="mb-1 text-white">Bitcoin Wallet</label>
                                        <div className="relative">
                                            <input id="wallets.bitcoin" name="wallets.bitcoin" type="text" value={formData.wallets.bitcoin} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 pr-10 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                            {formData.wallets.bitcoin && (
                                                <button type="button" onClick={() => handleCopyWalletAddress("bitcoin")} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6894f3] hover:text-[#8faef0]">
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Knowledge */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="knowledge.type" className="mb-1 text-white">Knowledge Type</label>
                                        <input id="knowledge.type" name="knowledge.type" type="text" value={formData.knowledge.type} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="knowledge.data" className="mb-1 text-white">Knowledge Data (comma-separated)</label>
                                        <input 
                                            id="knowledge.data" 
                                            name="knowledge.data" 
                                            type="text" 
                                            value={formData.knowledge.data.join(", ")} 
                                            onChange={(e) => handleArrayChange(e, "knowledge", "data")} 
                                            className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" 
                                        />
                                    </div>
                                </div>

                                {/* Personality */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="personality.tone" className="mb-1 text-white">Tone *</label>
                                        <input id="personality.tone" name="personality.tone" type="text" value={formData.personality.tone} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="personality.formality" className="mb-1 text-white">Formality *</label>
                                        <input id="personality.formality" name="personality.formality" type="text" value={formData.personality.formality} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="personality.catchphrase" className="mb-1 text-white">Catchphrase *</label>
                                        <input id="personality.catchphrase" name="personality.catchphrase" type="text" value={formData.personality.catchphrase} onChange={handleChange} required className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex items-center">
                                        <input id="personality.humor" name="personality.humor" type="checkbox" checked={formData.personality.humor} onChange={handleChange} className="mr-2" />
                                        <label htmlFor="personality.humor" className="text-white">Humor</label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="personality.preferences.topics" className="mb-1 text-white">Preferred Topics (comma-separated)</label>
                                        <input 
                                            id="personality.preferences.topics" 
                                            name="personality.preferences.topics" 
                                            type="text" 
                                            value={formData.personality.preferences.topics.join(", ")} 
                                            onChange={(e) => handleArrayChange(e, "personality", "topics")} 
                                            className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="personality.preferences.languages" className="mb-1 text-white">Languages (comma-separated)</label>
                                        <input 
                                            id="personality.preferences.languages" 
                                            name="personality.preferences.languages" 
                                            type="text" 
                                            value={formData.personality.preferences.languages.join(", ")} 
                                            onChange={(e) => handleArrayChange(e, "personality", "languages")} 
                                            className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" 
                                        />
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="settings.max_memory_context" className="mb-1 text-white">Max Memory Context</label>
                                        <input 
                                            id="settings.max_memory_context" 
                                            name="settings.max_memory_context" 
                                            type="number" 
                                            value={formData.settings.max_memory_context} 
                                            onChange={handleChange} 
                                            className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="settings.platforms" className="mb-1 text-white">Platforms (comma-separated)</label>
                                        <input 
                                            id="settings.platforms" 
                                            name="settings.platforms" 
                                            type="text" 
                                            value={formData.settings.platforms.join(", ")} 
                                            onChange={(e) => handleArrayChange(e, "settings", "platforms")} 
                                            className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" 
                                        />
                                    </div>
                                </div>

                                {/* API Keys and Twitter */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="openaiApiKey" className="mb-1 text-white">OpenAI API Key</label>
                                        <input id="openaiApiKey" name="openaiApiKey" type="text" value={formData.openaiApiKey} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="twitterHandle" className="mb-1 text-white">Twitter Handle</label>
                                        <input id="twitterHandle" name="twitterHandle" type="text" value={formData.twitterHandle} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="twitterAppKey" className="mb-1 text-white">Twitter App Key</label>
                                        <input id="twitterAppKey" name="twitterAppKey" type="text" value={formData.twitterAppKey} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="twitterAppSecret" className="mb-1 text-white">Twitter App Secret</label>
                                        <input id="twitterAppSecret" name="twitterAppSecret" type="text" value={formData.twitterAppSecret} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="twitterAccessToken" className="mb-1 text-white">Twitter Access Token</label>
                                        <input id="twitterAccessToken" name="twitterAccessToken" type="text" value={formData.twitterAccessToken} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="twitterAccessSecret" className="mb-1 text-white">Twitter Access Secret</label>
                                        <input id="twitterAccessSecret" name="twitterAccessSecret" type="text" value={formData.twitterAccessSecret} onChange={handleChange} className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" />
                                    </div>
                                </div>

                                {/* Other Fields */}
                                <div className="flex flex-col mb-2">
                                    <label htmlFor="ruleIds" className="mb-1 text-white">Rule IDs (comma-separated)</label>
                                    <input 
                                        id="ruleIds" 
                                        name="ruleIds" 
                                        type="text" 
                                        value={formData.ruleIds.join(", ")} 
                                        onChange={(e) => handleArrayChange(e, "ruleIds")} 
                                        className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500" 
                                    />
                                </div>
                                <div className="flex items-center mb-2">
                                    <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="mr-2" />
                                    <label htmlFor="isActive" className="text-white">Is Active</label>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

                            <div className="text-center w-full">
                                <button
                                    type="submit"
                                    className="w-full py-2 rounded-4xl text-lg text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:text-white"
                                >
                                    Update Agent
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}