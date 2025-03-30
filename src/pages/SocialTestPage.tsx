import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAgentsByUserId } from "../api/userApi";
import { postTweetManually, sendTelegramMessage } from "../api/socialApi";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function SocialTestPage() {
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [platform, setPlatform] = useState<'twitter' | 'telegram'>('twitter');
  const [tweetMessage, setTweetMessage] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramMessage, setTelegramMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [response, setResponse] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string>("");
  const [postError, setPostError] = useState<string>("");

  const { connected: walletConnected } = useWallet();
  const { currentUser, serverLive, checkServerStatus } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !currentUser?.userId) {
      navigate("/");
      return;
    }

    const initialCheck = async () => {
      console.log("Running initial server status check on SocialTestPage load...");
      await checkServerStatus();
      if (serverLive === false) {
        setServerError("Server is currently unavailable.");
        setLoading(false);
        toast.error("Server Unavailable", {
          description: "Cannot load Social Test Page at this time. Please try again later.",
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
        if (userAgents.length > 0 && !selectedAgent) {
          setSelectedAgent(userAgents[0]);
          setTelegramChatId(userAgents[0].telegramGroupId || ""); // Pre-populate
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

  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agent = myAgents.find((a) => a.agentId === agentId) || null;
    setSelectedAgent(agent);
    setResponse(null);
    setPostError("");
    setTelegramChatId(agent?.telegramGroupId || ""); // Update chat ID when agent changes
  };

  const handlePlatformChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPlatform(e.target.value as 'twitter' | 'telegram');
    setResponse(null);
    setPostError("");
    setTweetMessage("");
    setTelegramMessage("");
    if (e.target.value === 'telegram' && selectedAgent) {
      setTelegramChatId(selectedAgent.telegramGroupId || ""); // Set default when switching to Telegram
    } else {
      setTelegramChatId("");
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setPostError("");
    setResponse(null);

    try {
      console.log("Checking server status before posting...");
      await checkServerStatus();
      if (serverLive === false) {
        setServerError("Server is currently unavailable.");
        toast.error("Server Unavailable", {
          description: `Cannot send ${platform} message at this time. Please try again later.`,
          duration: 3000,
        });
        return;
      }

      if (platform === 'twitter') {
        if (!tweetMessage.trim()) return;
        const response = await postTweetManually(selectedAgent.agentId, tweetMessage);
        if (!response.tweetedMessage) {
          throw new Error("No tweet message returned from server.");
        }
        setResponse(response.tweetedMessage);
        setTweetMessage("");
        toast.success("Tweet posted successfully!", {
          description: `Tweet: ${response.tweetedMessage}`,
          duration: 3000,
        });
      } else if (platform === 'telegram') {
        if (!telegramMessage.trim()) return;
        const chatId = telegramChatId.trim() || selectedAgent.telegramGroupId; // Use provided or default
        if (!chatId) {
          throw new Error("No Telegram Chat ID provided and no default group configured for this agent.");
        }
        const response = await sendTelegramMessage(selectedAgent.agentId, chatId, telegramMessage);
        setResponse(telegramMessage);
        setTelegramMessage("");
        toast.success("Telegram message sent successfully response: " + response, {
          description: `To ${chatId}: ${telegramMessage}`,
          duration: 3000,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Error posting to ${platform}:`, err);
      setPostError(errorMsg || `Failed to send ${platform} message.`);
      toast.error(`Failed to send ${platform} message`, {
        description: errorMsg || "Check your agent configuration or try again.",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#6894f3] text-4xl animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Social Test Page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[90%] sm:max-w-3xl flex flex-col rounded-lg shadow-lg bg-[#222128] border border-[#494848] p-4 sm:p-6">
        <div className="pb-4 border-b border-[#494848] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Social Test Page</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select
              value={platform}
              onChange={handlePlatformChange}
              className="w-full sm:w-auto bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-[#6a94f0]"
            >
              <option value="twitter">Twitter</option>
              <option value="telegram">Telegram</option>
            </select>
            <select
              value={selectedAgent?.agentId || ""}
              onChange={handleAgentChange}
              className="w-full sm:w-auto bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-[#6a94f0]"
              disabled={!myAgents.length}
            >
              <option value="" disabled>Select an Agent</option>
              {myAgents.map((agent) => (
                <option key={agent.agentId} value={agent.agentId}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="py-4">
          {serverError && (
            <div className="mb-4 p-3 bg-red-900/20 text-red-500 rounded-lg text-sm sm:text-base">
              {serverError}
            </div>
          )}

          {selectedAgent ? (
            <form onSubmit={handlePost} className="flex flex-col gap-4">
              {platform === 'twitter' ? (
                <>
                  <textarea
                    value={tweetMessage}
                    onChange={(e) => setTweetMessage(e.target.value)}
                    placeholder="Enter your tweet (max 280 characters)"
                    maxLength={280}
                    className="w-full bg-[#222128] text-white p-3 rounded-lg border border-[#494848] outline-none focus:ring-1 focus:ring-[#6a94f0] resize-none h-20 sm:h-24 text-sm sm:text-base"
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <span className="text-xs sm:text-sm text-gray-400">{tweetMessage.length}/280</span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 disabled:opacity-50 text-sm sm:text-base"
                      disabled={!tweetMessage.trim() || !!serverError}
                    >
                      Post Tweet
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder={
                      selectedAgent.telegramGroupId
                        ? `Default: ${selectedAgent.telegramGroupId}`
                        : "Enter Telegram Chat ID (e.g., -1007821453917)"
                    }
                    className="w-full bg-[#222128] text-white p-3 rounded-lg border border-[#494848] outline-none focus:ring-1 focus:ring-[#6a94f0] text-sm sm:text-base"
                  />
                  <textarea
                    value={telegramMessage}
                    onChange={(e) => setTelegramMessage(e.target.value)}
                    placeholder="Enter your Telegram message"
                    className="w-full bg-[#222128] text-white p-3 rounded-lg border border-[#494848] outline-none focus:ring-1 focus:ring-[#6a94f0] resize-none h-20 sm:h-24 text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 disabled:opacity-50 text-sm sm:text-base"
                    disabled={!telegramMessage.trim() || !!serverError}
                  >
                    Send Telegram Message
                  </button>
                </>
              )}
              {postError && (
                <div className="mt-2 p-3 bg-red-900/20 text-red-500 rounded-lg text-sm sm:text-base">
                  {postError}
                </div>
              )}
            </form>
          ) : (
            <div className="text-center text-gray-400 text-sm sm:text-base">
              Select an agent to start testing social features. Choose a platform and send a message to verify your configuration.
            </div>
          )}
        </div>

        {response && selectedAgent && (
          <div className="mt-4 p-3 bg-[#333] rounded-lg">
            <p className="text-xs sm:text-sm">
              {platform === 'twitter'
                ? `Tweet posted by ${selectedAgent.name}: "${response}"`
                : `Telegram message sent by ${selectedAgent.name} to ${telegramChatId || selectedAgent.telegramGroupId}: "${response}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}