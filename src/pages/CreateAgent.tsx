import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import puppet from "../assets/puppet.jpg";
import openai from "../assets/openai.jpg";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { fetchWrapper } from "../utils/fetchWrapper";

const BASE_URL = "http://localhost:3000"; // Adjust to your backend URL

interface FormData {
  name: string;
  bio: string;
  tone: string;
  formality: string;
  catchphrase: string;
  agentType: "puppetos" | "basic";
  openaiApiKey: string;
}

export default function CreateAgent() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    bio: "",
    tone: "",
    formality: "",
    catchphrase: "",
    agentType: "basic",
    openaiApiKey: "",
  });
  const [error, setError] = useState<string>("");

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
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "bio",
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
      bio: formData.bio,
      personality: {
        tone: formData.tone,
        formality: formData.formality,
        catchphrase: formData.catchphrase,
      },
      agentType: formData.agentType,
      createdBy: currentUser.userId,
      openaiApiKey: formData.openaiApiKey,
    };

    console.log("Submitting agentData:", JSON.stringify(agentData, null, 2));

    try {
      const response = await fetchWrapper<{ message: string; agentId: string }>(
        `${BASE_URL}/agents`,
        {
          method: "POST",
          body: JSON.stringify(agentData),
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response from server:", response);
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
        openaiApiKey: "",
      });
    } catch (err: any) {
      console.error("Error creating agent:", err.message, err.stack);
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
                    setFormData((prev) => ({ ...prev, agentType: "basic" }))
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