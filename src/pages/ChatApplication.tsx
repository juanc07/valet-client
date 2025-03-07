import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAllAgents, chatWithAgent, chatWithAgentStream } from "../api/agentApi";
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
  const [isStreamChat, setIsStreamChat] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // Track which message was copied

  const { connected: walletConnected } = useWallet();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  // Fetch agents on component mount
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

        if (userAgents.length > 0 && !selectedAgent) {
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

  // Handle category change and reset selected agent
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as "myAgents" | "othersAgents";
    setSelectedCategory(category);
    const agentList = category === "myAgents" ? myAgents : otherAgents;
    setSelectedAgent(agentList.length > 0 ? agentList[0] : null);
    setMessages([]);
  };

  // Handle agent selection
  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agentList = selectedCategory === "myAgents" ? myAgents : otherAgents;
    const agent = agentList.find(a => a.agentId === agentId) || null;
    setSelectedAgent(agent);
    setMessages([]);
  };

  // Toggle between streaming and non-streaming chat
  const handleToggleChatType = (e: ChangeEvent<HTMLInputElement>) => {
    setIsStreamChat(e.target.checked);
    setMessages([]);
  };

  // Copy text to clipboard with feedback
  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index); // Set the copied index for feedback
      toast.success("Copied to clipboard!", { duration: 2000 });
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy", { duration: 2000 });
    }
  };

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedAgent) return;

    const userMessage = { sender: "user" as const, text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    if (isStreamChat) {
      try {
        setMessages(prev => [...prev, { sender: "agent", text: "" }]);
        await chatWithAgentStream(
          selectedAgent.agentId,
          inputMessage,
          (content) => {
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.sender === "agent") {
                return [
                  ...prev.slice(0, -1),
                  { sender: "agent", text: lastMsg.text + content },
                ];
              }
              return [...prev, { sender: "agent", text: content }];
            });
          },
          () => {
            console.log("Stream complete");
          }
        );
      } catch (error) {
        console.error("Streaming chat error:", error);
        toast.error("Stream Chat Failed", {
          description: "Unable to stream response from the agent.",
          duration: 3000,
        });
        setMessages(prev => [
          ...prev.filter(m => m.sender !== "agent" || m.text !== ""),
          { sender: "agent", text: "Streaming failed. Try again!" },
        ]);
      }
    } else {
      try {
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
    }
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="streamChatToggle"
                checked={isStreamChat}
                onChange={handleToggleChatType}
                className="w-5 h-5 text-[#6a94f0] bg-[#222128] border-[#494848] rounded focus:ring-[#6a94f0]"
              />
              <label htmlFor="streamChatToggle" className="text-sm">
                Stream Chat
              </label>
            </div>
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
                    className={`max-w-[70%] p-3 rounded-lg flex items-center gap-2 ${
                      msg.sender === "user"
                        ? "bg-[#6a94f0] text-black"
                        : "bg-[#333] text-white"
                    }`}
                  >
                    <span className="flex-1">{msg.text}</span>
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="p-1 rounded hover:bg-gray-500/20 transition-colors duration-200"
                      title="Copy text"
                    >
                      {copiedIndex === index ? (
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
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