import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAllAgents, chatWithAgent } from "../api/agentApi";
import { getAgentsByUserId } from "../api/userApi";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";

export default function ChatApplication() {
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [otherAgents, setOtherAgents] = useState<Agent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"myAgents" | "othersAgents">("myAgents");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<{ sender: "user" | "agent"; text: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  const { connected: walletConnected } = useWallet();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !currentUser?.userId) {
      navigate("/");
      return;
    }

    const fetchAgents = async () => {
      try {
        setLoading(true);
        const userAgents = await getAgentsByUserId(currentUser.userId);
        setMyAgents(userAgents);

        const allAgents = await getAllAgents();
        const othersAgents = allAgents.filter(agent => agent.createdBy !== currentUser.userId);
        setOtherAgents(othersAgents);

        if (userAgents.length > 0) {
          setSelectedAgent(userAgents[0]);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast.error("Failed to load agents", {
          description: "Please try again later.",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [walletConnected, currentUser, navigate]);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as "myAgents" | "othersAgents";
    setSelectedCategory(category);
    setSelectedAgent(null);
    setMessages([]);
  };

  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agentList = selectedCategory === "myAgents" ? myAgents : otherAgents;
    const agent = agentList.find(a => a.agentId === agentId) || null;
    setSelectedAgent(agent);
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedAgent) return;

    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: inputMessage }]);

    try {
      // Call the chatWithAgent endpoint
      const response = await chatWithAgent(selectedAgent.agentId, inputMessage);
      setMessages(prev => [...prev, { sender: "agent", text: response.reply }]);
    } catch (error) {
      console.error("Error chatting with agent:", error);
      toast.error("Chat Failed", {
        description: "Unable to get a response from the agent.",
        duration: 3000,
      });
      setMessages(prev => [...prev, { sender: "agent", text: "Sorry, I couldn’t respond. Try again!" }]);
    }

    setInputMessage("");
  };

  const currentAgents = selectedCategory === "myAgents" ? myAgents : otherAgents;

  if (loading) {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
        <div className="text-center">Loading chat application...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col rounded-lg shadow-lg bg-[#222128] border border-[#494848]">
        {/* Header */}
        <div className="p-4 border-b border-[#494848] flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chat with Agents</h1>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-[#6a94f0]"
            >
              <option value="myAgents">My Agents</option>
              <option value="othersAgents">Other People's Agents</option>
            </select>
            <select
              value={selectedAgent?.agentId || ""}
              onChange={handleAgentChange}
              className="bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-[#6a94f0]"
            >
              <option value="" disabled>
                Select an Agent
              </option>
              {currentAgents.map(agent => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedAgent ? (
            messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-[#6a94f0] text-black"
                        : "bg-[#333] text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400">
                Start chatting with {selectedAgent.name}!
              </div>
            )
          ) : (
            <div className="text-center text-gray-400">
              Select an agent to start chatting.
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#494848]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#222128] text-white p-2 rounded-lg border border-[#494848] outline-none focus:ring-1 focus:ring-[#6a94f0]"
              disabled={!selectedAgent}
            />
            <button
              type="submit"
              className="py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 disabled:opacity-50"
              disabled={!selectedAgent || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}