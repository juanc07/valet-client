import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAgentsByUserId } from "../api/userApi";
import { postTweetManually } from "../api/twitterApi";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";

export default function TwitterTestPage() {
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tweetMessage, setTweetMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [tweetResponse, setTweetResponse] = useState<string | null>(null);

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

  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agent = myAgents.find(a => a.agentId === agentId) || null;
    setSelectedAgent(agent);
    setTweetResponse(null); // Reset response on agent change
  };

  const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !tweetMessage.trim()) return;

    try {
      const response = await postTweetManually(selectedAgent.agentId, tweetMessage);
      setTweetResponse(response.tweetedMessage);
      setTweetMessage(""); // Clear input after success
      toast.success("Tweet posted successfully!", {
        description: `Tweet: ${response.tweetedMessage}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error posting tweet:", error);
      toast.error("Failed to post tweet", {
        description: "Check your agent configuration or try again.",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">Loading Twitter test page...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[90%] sm:max-w-3xl flex flex-col rounded-lg shadow-lg bg-[#222128] border border-[#494848] p-4 sm:p-6">
        {/* Header */}
        <div className="pb-4 border-b border-[#494848] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Twitter Test Page</h1>
          <select
            value={selectedAgent?.agentId || ""}
            onChange={handleAgentChange}
            className="w-full sm:w-auto bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-[#6a94f0]"
          >
            <option value="" disabled>
              Select an Agent
            </option>
            {myAgents.map(agent => (
              <option key={agent.agentId} value={agent.agentId}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tweet Form */}
        <div className="py-4">
          {selectedAgent ? (
            <form onSubmit={handlePostTweet} className="flex flex-col gap-4">
              <textarea
                value={tweetMessage}
                onChange={(e) => setTweetMessage(e.target.value)}
                placeholder="Enter your tweet (max 280 characters)"
                maxLength={280}
                className="w-full bg-[#222128] text-white p-3 rounded-lg border border-[#494848] outline-none focus:ring-1 focus:ring-[#6a94f0] resize-none h-20 sm:h-24 text-sm sm:text-base"
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-400">
                  {tweetMessage.length}/280
                </span>
                <button
                  type="submit"
                  className="w-full sm:w-auto py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 disabled:opacity-50 text-sm sm:text-base"
                  disabled={!tweetMessage.trim()}
                >
                  Post Tweet
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center text-gray-400 text-sm sm:text-base">
              Select an agent to start testing Twitter features.
            </div>
          )}
        </div>

        {/* Tweet Response */}
        {tweetResponse && selectedAgent && (
          <div className="mt-4 p-3 bg-[#333] rounded-lg">
            <p className="text-xs sm:text-sm">
              Tweet posted by {selectedAgent.name}: "{tweetResponse}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}