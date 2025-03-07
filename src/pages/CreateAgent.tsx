import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import puppet from "../assets/puppet.jpg";
import openai from "../assets/openai.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTelegram, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { fetchWrapper } from "../utils/fetchWrapper";

const BASE_URL = "http://localhost:3000"; // Adjust to your backend URL

interface FormData {
  name: string;
  description: string;
  bio: string;
  mission: string;
  vision: string;
  tone: string;
  humor: boolean;
  formality: string;
  catchphrase: string;
  agentType: "basic" | "puppetos" | "thirdparty";
  openaiApiKey: string;
}

export default function CreateAgent() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    bio: "",
    mission: "",
    vision: "",
    tone: "",
    humor: false,
    formality: "",
    catchphrase: "",
    agentType: "basic",
    openaiApiKey: "",
  });
  const [error, setError] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  const { connected: walletConnected } = useWallet();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected) {
      navigate("/");
    }
  }, [walletConnected, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "description",
      "bio",
      "mission",
      "vision",
      "tone",
      "formality",
      "catchphrase",
      "openaiApiKey",
    ];
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

    const agentData = {
      name: formData.name,
      description: formData.description,
      bio: formData.bio,
      mission: formData.mission,
      vision: formData.vision,
      personality: {
        tone: formData.tone,
        humor: formData.humor,
        formality: formData.formality,
        catchphrase: formData.catchphrase,
      },
      agentType: formData.agentType,
      userId: currentUser.userId,
      openaiApiKey: formData.openaiApiKey,
    };

    console.log("Submitting agentData:", agentData); // Debug payload

    try {
      const response = await fetchWrapper<{ message: string; agentId: string }>(
        `${BASE_URL}/agents`,
        {
          method: "POST",
          body: JSON.stringify(agentData),
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response from server:", response); // Debug response
      setError("");
      toast.success("Agent Created", {
        description: `Successfully created agent: ${formData.name} (ID: ${response.agentId})`,
        duration: 3000,
      });
      setFormData({
        name: "",
        description: "",
        bio: "",
        mission: "",
        vision: "",
        tone: "",
        humor: false,
        formality: "",
        catchphrase: "",
        agentType: "basic",
        openaiApiKey: "",
      });
    } catch (err: any) {
      console.error("Error creating agent:", err.message, err.stack); // Detailed error logging
      setError("Failed to create agent.");
      toast.error("Agent Creation Failed", {
        description: err.message || "Please try again later.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py- rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-10 pb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Create Your AI Agent
          </h1>
          <form onSubmit={handleSubmit}>
            {/* Agent Type Selection */}
            <div>
              <p className="font-semibold text-lg text-white mb-4">Select Framework</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="flex flex-col lg:flex-row items-center border border-[#494848] px-2 py-4 xl:px-4 xl:py-4 rounded-lg text-center duration-700 lg:text-left cursor-pointer hover:bg-gray-900"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, agentType: "thirdparty" }))
                  }
                >
                  <img
                    src={openai}
                    className="w-14 h-14 lg:w-10 lg:h-10 mb-4 lg:mb-0 lg:mr-4 rounded-lg"
                    alt="OpenAI"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm md:text-base">
                      OpenAI
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 mt-2 md:mt-0">
                      GPT-4{" "}
                      <a
                        href="https://platform.openai.com/docs/overview"
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
                    value="thirdparty"
                    checked={formData.agentType === "thirdparty"}
                    onChange={handleChange}
                    className="mt-5 lg:mt-3 p-2"
                  />
                </div>
                <div
                  className="flex flex-col lg:flex-row items-center border border-[#494848] px-2 py-4 xl:px-4 xl:py-4 rounded-lg text-center duration-700 lg:text-left cursor-pointer hover:bg-gray-900"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, agentType: "puppetos" }))
                  }
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
                <label htmlFor="description" className="mb-1 text-white">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Description of your agent"
                  className="w-full border border-[#494848] text-white px-2 py-5 rounded-lg outline-none focus:ring-1 focus:ring-gray-500 resize-none"
                  minLength={10}
                  maxLength={900}
                />
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
              <div className="flex flex-col mb-2">
                <label htmlFor="mission" className="mb-1 text-white">
                  Mission *
                </label>
                <textarea
                  id="mission"
                  name="mission"
                  value={formData.mission}
                  onChange={handleChange}
                  required
                  placeholder="Agent's mission"
                  className="w-full border border-[#494848] text-white px-2 py-5 rounded-lg outline-none focus:ring-1 focus:ring-gray-500 resize-none"
                  minLength={10}
                  maxLength={500}
                />
              </div>
              <div className="flex flex-col mb-2">
                <label htmlFor="vision" className="mb-1 text-white">
                  Vision *
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  value={formData.vision}
                  onChange={handleChange}
                  required
                  placeholder="Agent's vision"
                  className="w-full border border-[#494848] text-white px-2 py-5 rounded-lg outline-none focus:ring-1 focus:ring-gray-500 resize-none"
                  minLength={10}
                  maxLength={500}
                />
              </div>
              <div className="flex items-center mb-2">
                <input
                  id="humor"
                  name="humor"
                  type="checkbox"
                  checked={formData.humor}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="humor" className="text-white">
                  Humor *
                </label>
              </div>
              <div className="flex flex-col mb-2">
                <label htmlFor="openaiApiKey" className="mb-1 text-white">
                  OpenAI API Key *
                </label>
                <input
                  id="openaiApiKey"
                  name="openaiApiKey"
                  type="text"
                  value={formData.openaiApiKey}
                  onChange={handleChange}
                  required
                  placeholder="Enter OpenAI API Key"
                  className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            {/* Connect/Disconnect Button */}
            <div className="w-full flex items-center justify-between mb-6">
              {!connected ? (
                <button
                  type="button"
                  className="w-full py-2 rounded-4xl flex items-center justify-center gap-2 cursor-pointer text-nowrap transition-all duration-400 ease-in-out backdrop-blur-lg border border-[#6a94f0] hover:bg-white/15"
                  onClick={() => setConnected(true)}
                >
                  Connect With <FontAwesomeIcon icon={faXTwitter} />
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full py-2 rounded-4xl flex items-center justify-center gap-2 text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10"
                  onClick={() => setConnected(false)}
                >
                  Disconnect <FontAwesomeIcon icon={faXTwitter} />
                </button>
              )}
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center mb-4 px-4 mx-auto">
              <div className="flex-grow border-t border-gray-500 mx-2"></div>
              <p className="text-gray-400">Coming Soon</p>
              <div className="flex-grow border-t border-gray-500 mx-2"></div>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-6">
              <FontAwesomeIcon icon={faDiscord} size="2x" className="text-[#5a65ee]" />
              <FontAwesomeIcon icon={faTelegram} size="2x" className="text-[#2da8e7]" />
            </div>

            <div className="text-center w-full">
              <button
                type="submit"
                className="w-full py-2 rounded-4xl text-lg text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:text-white"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}