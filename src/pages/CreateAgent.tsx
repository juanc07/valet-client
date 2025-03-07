import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import puppet from "../assets/puppet.jpg";
import openai from "../assets/openai.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faTelegram,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react"; // Import useWallet
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface FormData {
  name: string;
  age: number | string;
  personality: string;
  description: string;
  openaiSelected: boolean;
  puppetosSelected: boolean;
}

export default function CreateAgent() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    personality: "",
    description: "",
    openaiSelected: false,
    puppetosSelected: false,
  });

  const [error, setError] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  const { connected: walletConnected } = useWallet(); // Get wallet connection status
  const navigate = useNavigate();

  // Navigate to Start if wallet is not connected
  useEffect(() => {
    if (!walletConnected) {
      navigate("/"); // Redirect to Start page
    }
  }, [walletConnected, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "age" ? (isNaN(Number(value)) ? value : Number(value)) : value,
    }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.openaiSelected && !formData.puppetosSelected) {
      setError("Please select either OpenAI or PuppetOS.");
      toast.error("Form Submission Failed", {
        description: "Please select either OpenAI or PuppetOS.",
        duration: 3000,
      });
      return;
    }

    setError("");
    toast.success("Agent Created", {
      description: `Successfully created agent: ${formData.name}`,
      duration: 3000,
    });
    setFormData({
      name: "",
      age: "",
      personality: "",
      description: "",
      openaiSelected: false,
      puppetosSelected: false,
    });
  };

  return (
    <>
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
        <div className="w-full px-2 py-2 lg:px-0 lg:py- rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
          <div className="w-full lg:w-4/5 pt-10 pb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Automate Your AI Agent
            </h1>
            <form onSubmit={handleSubmit}>
              <div>
                <p className="font-semibold text-lg text-white mb-4">
                  Select Framework
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="flex flex-col lg:flex-row items-center border border-[#494848] px-2 py-4 xl:px-4 xl:py-4 rounded-lg text-center duration-700 lg:text-left cursor-pointer hover:bg-gray-900"
                    onClick={() => document.getElementById("openai")?.click()}
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
                    <div>
                      <input
                        type="checkbox"
                        id="openai"
                        name="openaiSelected"
                        checked={formData.openaiSelected}
                        onChange={handleCheckboxChange}
                        className="mt-5 lg:mt-3 p-2 ps-4"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center border border-[#494848] px-2 py-4 xl:px-4 xl:py-4 rounded-lg text-center duration-700 lg:text-left cursor-pointer hover:bg-gray-900">
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
                    <div className="cursor-not-allowed">
                      <input
                        type="checkbox"
                        id="puppetos"
                        name="puppetosSelected"
                        checked={formData.puppetosSelected}
                        onChange={handleCheckboxChange}
                        disabled
                        className="pointer-events-none mt-5 lg:mt-3 p-2 ps-4"
                      />
                    </div>
                  </div>
                </div>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
              </div>

              <div className="mx-auto py-2">
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
                      maxLength={10}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="age" className="mb-1 text-white">
                      Age *
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age || ""}
                      onChange={handleChange}
                      required
                      placeholder="Agent's age"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      min={18}
                      max={100}
                    />
                  </div>
                </div>
                <div className="flex flex-col mb-2">
                  <label htmlFor="personality" className="mb-1 text-white">
                    Personality *
                  </label>
                  <input
                    id="personality"
                    name="personality"
                    type="text"
                    value={formData.personality}
                    onChange={handleChange}
                    required
                    placeholder="Agent's personality"
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    minLength={1}
                    maxLength={20}
                  />
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
                  ></textarea>
                </div>
              </div>

              <div className="w-full flex items-center justify-between mb-6">
                {!connected ? (
                  <button
                    type="button"
                    className="w-full py-2 rounded-4xl flex items-center justify-center gap-2 cursor-pointer text-nowrap transition-all duration-400 ease-in-out backdrop-blur-lg border border-[#6a94f0] hover:bg-white/15"
                    onClick={() => setConnected(true)} // Temporary local state toggle (replace with wallet logic if needed)
                  >
                    Connect With <FontAwesomeIcon icon={faXTwitter} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full py-2 rounded-4xl flex items-center justify-center gap-2 text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10"
                    onClick={() => setConnected(false)} // Temporary local state toggle
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
                <FontAwesomeIcon
                  icon={faDiscord}
                  size="2x"
                  className="text-[#5a65ee]"
                />
                <FontAwesomeIcon
                  icon={faTelegram}
                  size="2x"
                  className="text-[#2da8e7]"
                />
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
    </>
  );
}