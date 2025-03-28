import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faTrash, faCopy, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent";
import { getAllAgents, deleteAgent } from "../api/agentApi";
import { getAgentsByUserId } from "../api/userApi";
import { useUser } from "../context/UserContext";

const isAgentDebug = import.meta.env.VITE_SOLANA_AGENT_DEBUG === "TRUE";

export default function YourAgent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { connected: walletConnected } = useWallet();
  const { currentUser, viewMode, setViewMode, serverLive, checkServerStatus } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !currentUser?.userId) {
      navigate("/");
      return;
    }

    const fetchAgents = async () => {
      try {
        console.log("Running initial server status check on YourAgent load...");
        await checkServerStatus();
        if (serverLive === false) {
          throw new Error("Server is currently unavailable.");
        }

        if (viewMode === "myAgents") {
          console.log("Fetching My Agents for user:", currentUser.userId);
          const userAgents = await getAgentsByUserId(currentUser.userId);
          setAgents(userAgents);
        } else if (isAgentDebug) {
          console.log("Fetching Other People's Agents");
          const allAgents = await getAllAgents();
          const othersAgents = allAgents.filter(agent => agent.createdBy !== currentUser.userId);
          setAgents(othersAgents);
        }
      } catch (err) {
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
  }, [walletConnected, currentUser, navigate, viewMode, serverLive, checkServerStatus]);

  const openDeleteDialog = (agentId: string) => {
    setAgentToDelete(agentId);
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDialogOpen(false);
    setAgentToDelete(null);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    if (!agentToDelete) return;

    setIsDeleting(true);
    try {
      console.log("Checking server status before deleting agent...");
      await checkServerStatus();
      if (serverLive === false) {
        throw new Error("Server is currently unavailable.");
      }

      await deleteAgent(agentToDelete);
      setAgents(agents.filter(agent => agent.agentId !== agentToDelete));
      toast.success("Agent Deleted", {
        description: `Agent with ID: ${agentToDelete} has been deleted.`,
        duration: 3000,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Error deleting agent:", err);
      setServerError(errorMsg || "Failed to delete the agent.");
      toast.error("Delete Failed", {
        description: errorMsg || "Please try again.",
        duration: 3000,
      });
    } finally {
      closeDeleteDialog();
    }
  };

  const handleCopy = async (agentId: string) => {
    try {
      await navigator.clipboard.writeText(agentId);
      toast.success("Agent ID Copied", {
        description: `Copied ${agentId} to clipboard.`,
        duration: 2000,
      });
    } catch (err) {
      console.error("Error copying agent ID:", err);
      toast.error("Copy Failed", {
        description: "Failed to copy Agent ID.",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#6894f3] text-4xl animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Agents...
          </p>
        </div>
      </div>
    );
  }

  if (serverError && !isDialogOpen) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center text-red-500 text-xl md:text-2xl">{serverError}</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4 relative">
      <div className="w-full p-0 lg:p-6 rounded-none lg:rounded-lg shadow-lg overflow-x-auto max-w-full pt-10 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-4 lg:px-0">
          <h2 className="text-4xl font-bold text-center sm:text-left">
            {viewMode === "myAgents" ? "Your Agents" : "Other People's Agents"}
          </h2>
          {isAgentDebug && (
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "myAgents" | "othersAgents")}
              className="mt-4 sm:mt-0 bg-[#222128] text-white p-2 rounded-lg border border-[#494848] focus:outline-none focus:ring-1 focus:ring-gray-500 w-full sm:w-auto"
            >
              <option value="myAgents">My Agents</option>
              <option value="othersAgents">Other People's Agents</option>
            </select>
          )}
        </div>

        {agents.length === 0 ? (
          <div className="text-center text-3xl text-white pt-40 px-4">
            {viewMode === "myAgents"
              ? "You have not created any agents."
              : "No agents found from other users."}
          </div>
        ) : (
          <div className="overflow-x-auto w-full px-4 lg:px-0">
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
                      <td className="py-2 px-2 md:px-4 text-left truncate max-w-[100px] md:max-w-[200px]">{agent.name}</td>
                      <td className="py-2 px-2 md:px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="truncate max-w-[100px] md:max-w-[150px]">{agent.agentId}</span>
                          <button
                            onClick={() => handleCopy(agent.agentId)}
                            className="text-white hover:text-gray-300 transition duration-200 flex-shrink-0"
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
                      <td className="py-4 px-2 md:px-4 text-right">
                        <div className="flex justify-end space-x-2">
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
                              onClick={() => openDeleteDialog(agent.agentId)}
                              className="px-2 py-1 text-white rounded-lg transition duration-200 backdrop-blur-lg bg-red-500/80 hover:bg-red-600"
                              title="Delete Agent"
                              disabled={isDeleting}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {isDialogOpen && (
          <div
            style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
          >
            <div className="bg-[#222128] p-6 rounded-lg shadow-lg border border-[#494848] w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete the agent with ID:{" "}
                <span className="font-mono text-white break-all">{agentToDelete}</span>?
              </p>
              {serverError && isDialogOpen && (
                <p className="text-red-500 text-center mb-4">{serverError}</p>
              )}
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeDeleteDialog}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}