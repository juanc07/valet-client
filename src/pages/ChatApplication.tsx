import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAllAgents, chatWithAgent, chatWithAgentStream, getTaskStatus, Task } from "../api/agentApi"; // Modified: Imported Task
import { getAgentsByUserId } from "../api/userApi";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Message {
  sender: "user" | "agent";
  text: string;
  task_id?: string;
  isTask?: boolean;
  imageUrl?: string;
}

export default function ChatApplication() {
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [otherAgents, setOtherAgents] = useState<Agent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"myAgents" | "othersAgents">("myAgents");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isStreamChat, setIsStreamChat] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string>("");
  const [pollingTasks, setPollingTasks] = useState<{ taskId: string; startTime: number }[]>([]);

  const { connected: walletConnected } = useWallet();
  const { currentUser, serverLive, checkServerStatus } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!walletConnected || !currentUser?.userId) {
      navigate("/");
      return;
    }

    const initialCheck = async () => {
      console.log("Running initial server status check on ChatApplication load...");
      await checkServerStatus();
      console.log("Initial serverLive value:", serverLive);
      if (serverLive === false) {
        setServerError("Server is currently unavailable.");
        setLoading(false);
        toast.error("Server Unavailable", {
          description: "Cannot load chat application at this time. Please try again later.",
          duration: 3000,
        });
      }
    };

    initialCheck();
  }, [walletConnected, currentUser, navigate, checkServerStatus, serverLive]);

  useEffect(() => {
    if (!walletConnected || !currentUser?.userId || serverLive === false) return;

    const fetchAgents = async () => {
      try {
        console.log("Fetching agents since server is live...");
        const userAgents = await getAgentsByUserId(currentUser.userId);
        setMyAgents(userAgents);

        const allAgents = await getAllAgents();
        const othersAgents = allAgents.filter((agent) => agent.createdBy !== currentUser.userId);
        setOtherAgents(othersAgents);

        if (userAgents.length > 0 && !selectedAgent) {
          setSelectedAgent(userAgents[0]);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Error fetching agents:", err);
        setServerError(errorMsg || "Failed to load agents.");
        toast.error("Failed to load agents", {
          description: errorMsg || "Please try again later.",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [walletConnected, currentUser, navigate, serverLive, selectedAgent]);

  useEffect(() => {
    if (pollingTasks.length === 0) return;

    const pollTasks = async () => {
      const now = Date.now();
      const updatedTasks = [...pollingTasks];

      for (const task of pollingTasks) {
        const elapsed = (now - task.startTime) / 1000;
        if (elapsed > 30) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.task_id === task.taskId
                ? { ...msg, text: "Image generation timed out. Please try again.", isTask: false }
                : msg
            )
          );
          updatedTasks.splice(updatedTasks.findIndex((t) => t.taskId === task.taskId), 1);
          continue;
        }

        try {
          const taskData: Task = await getTaskStatus(task.taskId); // Modified: Used Task interface
          if (taskData.status === "completed") {
            let messageText = "Task completed!";
            let imageUrl: string | undefined;

            if (taskData.task_type === "api_call" && taskData.external_service?.service_name === "image_generation") {
              imageUrl = taskData.result;
              messageText = "Image generated successfully!";
            } else {
              messageText = taskData.result || "Task completed!";
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.task_id === task.taskId
                  ? { ...msg, text: messageText, imageUrl, isTask: false }
                  : msg
              )
            );
            updatedTasks.splice(updatedTasks.findIndex((t) => t.taskId === task.taskId), 1);
          } else if (taskData.status === "failed") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.task_id === task.taskId
                  ? { ...msg, text: `Task failed: ${taskData.external_service?.error || "Unknown error"}`, isTask: false }
                  : msg
              )
            );
            updatedTasks.splice(updatedTasks.findIndex((t) => t.taskId === task.taskId), 1);
          }
        } catch (error) {
          console.error(`Error polling task ${task.taskId}:`, error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.task_id === task.taskId
                ? { ...msg, text: "Error checking task status.", isTask: false }
                : msg
            )
          );
          updatedTasks.splice(updatedTasks.findIndex((t) => t.taskId === task.taskId), 1);
        }
      }

      setPollingTasks(updatedTasks);
    };

    const interval = setInterval(pollTasks, 5000);
    return () => clearInterval(interval);
  }, [pollingTasks]);

  useEffect(() => {
    return () => {
      setPollingTasks([]);
    };
  }, [location]);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as "myAgents" | "othersAgents";
    setSelectedCategory(category);
    const agentList = category === "myAgents" ? myAgents : otherAgents;
    setSelectedAgent(agentList.length > 0 ? agentList[0] : null);
    setMessages([]);
    setPollingTasks([]);
  };

  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agentList = selectedCategory === "myAgents" ? myAgents : otherAgents;
    const agent = agentList.find((a) => a.agentId === agentId) || null;
    setSelectedAgent(agent);
    setMessages([]);
    setPollingTasks([]);
  };

  const handleToggleChatType = (e: ChangeEvent<HTMLInputElement>) => {
    setIsStreamChat(e.target.checked);
    setMessages([]);
    setPollingTasks([]);
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Copied to clipboard!", { duration: 2000 });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy", { duration: 2000 });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedAgent) return;

    const userMessage: Message = { sender: "user", text: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      console.log("Checking server status before sending message...");
      await checkServerStatus();
      console.log("serverLive before chat:", serverLive);
      if (serverLive === false) {
        setServerError("Server is currently unavailable.");
        toast.error("Server Unavailable", {
          description: "Cannot send message at this time. Please try again later.",
          duration: 3000,
        });
        setMessages((prev) => [...prev, { sender: "agent", text: "Server is currently unavailable." }]);
        return;
      }

      if (isStreamChat) {
        setIsStreaming(true);
        await chatWithAgentStream(
          selectedAgent.agentId,
          inputMessage,
          currentUser?.userId,
          (content, task_id, isTask) => {
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.sender === "agent" && !lastMsg.text.startsWith("Unable") && !isTask) {
                return [
                  ...prev.slice(0, -1),
                  { sender: "agent", text: lastMsg.text + content },
                ];
              }
              const newMessage: Message = { sender: "agent", text: content, task_id, isTask };
              if (isTask && task_id) {
                // Modified: Ensured task_id is string
                setPollingTasks((prev) => [...prev, { taskId: task_id, startTime: Date.now() }]);
              }
              return [...prev, newMessage];
            });
          },
          () => {
            setIsStreaming(false);
            console.log("Stream complete");
          }
        );
      } else {
        const response = await chatWithAgent(selectedAgent.agentId, inputMessage, currentUser?.userId);
        const newMessage: Message = {
          sender: "agent",
          text: response.reply,
          task_id: response.task_id,
          isTask: response.isTask,
        };
        setMessages((prev) => [...prev, newMessage]);
        if (response.isTask && response.task_id) {
          // Modified: Fixed type mismatch with task_id
          setPollingTasks((prev) => [...prev, { taskId: response.task_id as string, startTime: Date.now() }]);
        }
      }
    } catch (err: unknown) {
      setIsStreaming(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Chat error:", errorMessage);
      let displayMessage = "Unable to get a response from the agent.";
      if (err instanceof Error && err.message) {
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.status === 403) {
            displayMessage = errorData.reply || "This agent is currently inactive.";
          } else if (errorData.status === 404) {
            displayMessage = "Agent not found.";
          } else if (errorData.status === 400) {
            displayMessage = errorData.reply || "Bad request. Check agent configuration.";
          } else {
            displayMessage = errorData.reply || "Chat failed or agent configuration isn’t set up.";
          }
        } catch (parseError: unknown) {
          console.error("Error parsing error message:", parseError);
        }
      }
      toast.error(isStreamChat ? "Stream Chat Failed" : "Chat Failed", {
        description: displayMessage,
        duration: 3000,
      });
      setMessages((prev) => [...prev, { sender: "agent", text: displayMessage }]);
    }
  };

  const currentAgents = selectedCategory === "myAgents" ? myAgents : otherAgents;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-[#6894f3] text-4xl animate-spin"
          />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Chat Application...
          </p>
        </div>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center text-red-500 text-xl md:text-2xl">
          {serverError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[calc(100vh-8rem)] sm:h-[80vh] flex flex-col rounded-lg shadow-lg bg-[#222128] border border-[#494848]">
        <div className="p-4 border-b border-[#494848] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Chat with Agents</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="streamChatToggle"
                checked={isStreamChat}
                onChange={handleToggleChatType}
                className="w-5 h-5 text-[#6a94f0] bg-[#222128] border-[#494848] rounded focus:ring-[#6a94f0]"
              />
              <label htmlFor="streamChatToggle" className="text-sm whitespace-nowrap">
                Stream Chat
              </label>
            </div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full sm:w-auto bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-[#6a94f0]"
            >
              <option value="myAgents">My Agents</option>
              <option value="othersAgents">Other People's Agents</option>
            </select>
            <select
              value={selectedAgent?.agentId || ""}
              onChange={handleAgentChange}
              className="w-full sm:w-auto bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-[#6a94f0]"
            >
              <option value="" disabled>
                Select an Agent
              </option>
              {currentAgents.map((agent) => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {selectedAgent ? (
            messages.length > 0 || isStreaming ? (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-lg ${
                        msg.sender === "user" ? "bg-[#6a94f0] text-black" : "bg-[#333] text-white"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap break-words">{msg.text}</div>
                      {msg.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={msg.imageUrl}
                            alt="Generated Image"
                            className="max-w-full rounded-lg"
                          />
                        </div>
                      )}
                      {msg.isTask && pollingTasks.some((t) => t.taskId === msg.task_id) && (
                        <div className="mt-2 text-gray-400 animate-pulse">
                          <FontAwesomeIcon icon={faSpinner} className="mr-2" />
                          Waiting for task...
                        </div>
                      )}
                      {msg.sender === "agent" && (
                        <div className="flex justify-end mt-2">
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
                      )}
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="text-center text-gray-400 animate-pulse">Streaming response...</div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400">
                {selectedCategory === "myAgents"
                  ? `Start chatting with ${selectedAgent.name}! Test your agent response to see if it’s responding based on your goal.`
                  : `Start chatting with ${selectedAgent.name}!`}
              </div>
            )
          ) : (
            <div className="text-center text-gray-400">
              Select an agent to start chatting.
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#494848]">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#222128] text-white p-2 rounded-lg border border-[#494848] outline-none focus:ring-1 focus:ring-[#6a94f0]"
              disabled={!selectedAgent || isStreaming}
            />
            <button
              type="submit"
              className="w-full sm:w-auto py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 disabled:opacity-50"
              disabled={!selectedAgent || !inputMessage.trim() || isStreaming}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}