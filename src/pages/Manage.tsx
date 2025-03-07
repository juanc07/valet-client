import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faDiscord, faTelegram } from "@fortawesome/free-brands-svg-icons";

type Platform = "twitter" | "discord" | "telegram";

export default function Manage() {
  const [selected, setSelected] = useState<Platform>("twitter");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    personality: "",
    description: "",
    mood: "",
    maxPosts: "",
    maxReplies: "",
  });
  const [connected, setConnected] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData({
      name: "",
      age: "",
      personality: "",
      description: "",
      mood: "",
      maxPosts: "",
      maxReplies: "",
    });
  };

  const handleButtonClick = (platform: Platform) => {
    if (platform === "twitter") {
      setSelected(platform);
      setConnected((prevConnected) => !prevConnected);
    }
  };

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
      <div className="w-full px-2 py-2 lg:px-0 lg:py- rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
        <div className="w-full lg:w-4/5 pt-5 pb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-5">
            Manage Your AI Agent
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-4 mb-0">
              <button
                className={`w-12 h-12 flex items-center justify-center rounded-full text-white border-2 transition-all duration-300 ${
                  selected === "twitter"
                    ? "bg-[#76a0ff] border-[#6694f6]"
                    : "bg-[#262625] border-[#40403e]"
                } hover:cursor-pointer`}
                onClick={() => handleButtonClick("twitter")}
              >
                <FontAwesomeIcon icon={faXTwitter} size="lg" />
              </button>
              <button
                className={`w-12 h-12 flex items-center justify-center rounded-full text-white border-2 transition-all duration-300 ${
                  selected === "discord"
                    ? "bg-[#76a0ff] border-[#6694f6]"
                    : "bg-[#242323] border-[#40403e]"
                }  hover:bg-[#3e3e3e] hover:cursor-pointer`}
                disabled={true}
              >
                <FontAwesomeIcon icon={faDiscord} size="lg" />
              </button>
              <button
                className={`w-12 h-12 flex items-center justify-center rounded-full text-white border-2 transition-all duration-300 ${
                  selected === "telegram"
                    ? "bg-[#76a0ff] border-[#6694f6]"
                    : "bg-[#242323] border-[#40403e]"
                } hover:bg-[#3e3e3e] hover:cursor-pointer`}
                disabled={true}
              >
                <FontAwesomeIcon icon={faTelegram} size="lg" />
              </button>
            </div>

            <div className="mx-auto py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col">
                  <label htmlFor="name" className="mb-1 text-white">
                    Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Agent's name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    required
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
                    placeholder="Agent's age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    required
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
                  placeholder="Agent's personality"
                  type="text"
                  value={formData.personality}
                  onChange={handleInputChange}
                  className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  required
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
                  placeholder="Description of your agent"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-[#494848] text-white px-2 py-4 rounded-lg outline-none focus:ring-1 focus:ring-gray-500 resize-none"
                  minLength={10}
                  maxLength={900}
                />
              </div>
              <div className="flex flex-col mb-2">
                <label htmlFor="mood" className="mb-1 text-white">
                  Mood
                </label>
                <input
                  id="mood"
                  name="mood"
                  type="text"
                  value={formData.mood}
                  onChange={handleInputChange}
                  className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="Enter agent's mood"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col">
                  <label htmlFor="maxPosts" className="mb-1 text-white">
                    Max Posts per Day
                  </label>
                  <input
                    id="maxPosts"
                    name="maxPosts"
                    type="number"
                    placeholder="Max 10 posts per day"
                    value={formData.maxPosts}
                    onChange={handleInputChange}
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    min={1}
                    max={10}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="maxReplies" className="mb-1 text-white">
                    Max Replies per Day
                  </label>
                  <input
                    id="maxReplies"
                    name="maxReplies"
                    type="number"
                    placeholder="Max 10 replies per day"
                    value={formData.maxReplies}
                    onChange={handleInputChange}
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <div className="w-full flex items-center justify-between mb-4">
                <button
                  className={`w-full py-2 rounded-4xl flex items-center justify-center gap-2 cursor-pointer text-nowrap transition-all duration-400 ease-in-out backdrop-blur-lg border ${
                    connected ? "border-[#6a94f0] bg-[#6a94f0]" : "border-[#6a94f0] hover:bg-white/15"
                  }`}
                  onClick={() => setConnected((prev) => !prev)}
                >
                  {connected ? "Disconnect" : "Connect"}{" "}
                  <FontAwesomeIcon icon={faXTwitter} className="" />
                </button>
              </div>

              <div className="text-center w-full mb-4">
                <button
                  className="w-full py-2 rounded-4xl flex items-center justify-center gap-2 cursor-pointer text-nowrap transition-all duration-400 ease-in-out backdrop-blur-lg border border-[#6a94f0] hover:bg-white/15"
                >
                  Start Automation
                </button>
              </div>

              <div className="text-center w-full">
                <button
                  type="submit"
                  className="w-full py-2 rounded-4xl text-lg text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:text-white"
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
