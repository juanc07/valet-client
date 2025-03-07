import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faTrash, faCopy } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent"; // Your full Agent interface
import { getAllAgents, deleteAgent } from "../api/agentApi"; // For all agents and delete
import { getAgentsByUserId } from "../api/userApi"; // For current user's agents
import { useUser } from "../context/UserContext"; // Assuming you have a UserContext to get the current user

function YourAgent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"myAgents" | "othersAgents">("myAgents"); // Dropdown state
  const { connected: walletConnected } = useWallet();
  const { currentUser } = useUser(); // Get the current user from context
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !currentUser?.userId) {
      navigate("/");
      return;
    }

    const fetchAgents = async () => {
      try {
        setLoading(true);
        if (viewMode === "myAgents") {
          // Fetch only current user's agents
          const userAgents = await getAgentsByUserId(currentUser.userId);
          setAgents(userAgents);
        } else {
          // Fetch all agents and filter out current user's agents
          const allAgents = await getAllAgents();
          const othersAgents = allAgents.filter(agent => agent.createdBy !== currentUser.userId);
          setAgents(othersAgents);
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
  }, [walletConnected, currentUser, navigate, viewMode]); // Re-fetch when viewMode changes

  const handleDelete = async (agentId: string) => {
    if (!confirm(`Are you sure you want to delete agent with ID: ${agentId}?`)) return;

    try {
      await deleteAgent(agentId);
      setAgents(agents.filter(agent => agent.agentId !== agentId));
      toast.success("Agent Deleted", {
        description: `Agent with ID: ${agentId} has been deleted.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Delete Failed", {
        description: "Failed to delete the agent.",
        duration: 3000,
      });
    }
  };

  const handleCopy = (agentId: string) => {
    navigator.clipboard.writeText(agentId).then(() => {
      toast.success("Agent ID Copied", {
        description: `Copied ${agentId} to clipboard.`,
        duration: 2000,
      });
    }).catch((error) => {
      console.error("Error copying agent ID:", error);
      toast.error("Copy Failed", {
        description: "Failed to copy Agent ID.",
        duration: 2000,
      });
    });
  };

  if (loading) {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
        <div className="text-center">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
      <div className="w-full p-0 lg:p-6 rounded-none lg:rounded-lg shadow-lg overflow-x-auto max-w-full pt-10 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-center sm:text-left">
            {viewMode === "myAgents" ? "Your Agents" : "Other People's Agents"}
          </h2>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "myAgents" | "othersAgents")}
            className="mt-4 sm:mt-0 bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="myAgents">My Agents</option>
            <option value="othersAgents">Other People's Agents</option>
          </select>
        </div>
        {agents.length === 0 ? (
          <div className="text-center text-3xl text-white pt-40">
            {viewMode === "myAgents"
              ? "You have not created any agents."
              : "No agents found from other users."}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm md:text-base">
              <thead className="overflow-hidden">
                <tr className="bg-[#222128]">
                  <th className="py-2 px-2 md:px-4 text-left rounded-l-lg font-medium">Name</th>
                  <th className="py-2 px-2 md:px-4 text-center font-medium">Agent ID</th>
                  <th className="py-2 px-2 md:px-4 text-center font-medium">Active</th>
                  <th className="py-2 px-2 md:px-4 text-right rounded-r-lg font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const isOwnAgent = agent.createdBy === currentUser?.userId;
                  return (
                    <tr key={agent.agentId} className="border-b border-[#494848]">
                      <td className="py-2 px-2 md:px-4 text-left text-nowrap">{agent.name}</td>
                      <td className="py-2 px-2 md:px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="truncate max-w-[150px]">{agent.agentId}</span>
                          <button
                            onClick={() => handleCopy(agent.agentId)}
                            className="text-white hover:text-gray-300 transition duration-200"
                            title="Copy Agent ID"
                          >
                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-2 md:px-4 text-center">
                        <div
                          className={`w-3 h-3 rounded-full inline-block ${
                            agent.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                      </td>
                      <td className="py-4 px-2 md:px-4 text-right flex justify-end space-x-2">
                        {isOwnAgent && (
                          <Link
                            to={`/agent/edit/${agent.agentId}`}
                            className="px-2 py-1 text-white rounded-lg transition duration-200 backdrop-blur-lg bg-white/8 hover:bg-white/30"
                            title="Edit Agent"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Link>
                        )}
                        <Link
                          to={`/agent/view/${agent.agentId}`}
                          className="px-2 py-1 text-white rounded-lg transition duration-200 backdrop-blur-lg bg-white/8 hover:bg-white/30"
                          title="View Agent"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        {isOwnAgent && (
                          <button
                            onClick={() => handleDelete(agent.agentId)}
                            className="px-2 py-1 text-white rounded-lg transition duration-200 backdrop-blur-lg bg-red-500/80 hover:bg-red-600"
                            title="Delete Agent"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default YourAgent;