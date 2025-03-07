import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { Agent } from "../interfaces/agent"; // Your full Agent interface
import { getAllAgents, deleteAgent } from "../api/agentApi"; // Assuming these API functions exist
import { useUser } from "../context/UserContext"; // Assuming you have a UserContext to get the current user

function YourAgent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
        const allAgents = await getAllAgents(); // Fetch all agents from API
        // Filter agents by the current user's ID
        const userAgents = allAgents.filter(agent => agent.createdBy === currentUser.userId);
        setAgents(userAgents);
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

  const handleDelete = async (agentId: string) => {
    if (!confirm(`Are you sure you want to delete agent with ID: ${agentId}?`)) return;

    try {
      await deleteAgent(agentId);
      setAgents(agents.filter(agent => agent.id !== agentId));
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
        <h2 className="text-4xl font-bold mb-6 text-center">Your Agents</h2>
        {agents.length === 0 ? (
          <div className="text-center text-3xl text-white pt-40">
            You have not created any agents.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm md:text-base">
              <thead className="overflow-hidden">
                <tr className="bg-[#222128]">
                  <th className="py-2 px-2 md:px-4 text-left rounded-l-lg font-medium">Name</th>
                  <th className="py-2 px-2 md:px-4 text-center font-medium">Created By</th>
                  <th className="py-2 px-2 md:px-4 text-center font-medium">Active</th>
                  <th className="py-2 px-2 md:px-4 text-right rounded-r-lg font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-[#494848]">
                    <td className="py-2 px-2 md:px-4 text-left text-nowrap">{agent.name}</td>
                    <td className="py-2 px-2 md:px-4 text-center">{agent.createdBy}</td>
                    <td className="py-2 px-2 md:px-4 text-center">
                      <div
                        className={`w-3 h-3 rounded-full inline-block ${
                          agent.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </td>
                    <td className="py-4 px-2 md:px-4 text-right flex justify-end space-x-2">
                      <Link
                        to={`/agent/edit/${agent.id}`} // Assuming you have an EditAgent route
                        className="px-2 py-1 text-white rounded-lg transition duration-200 backdrop-blur-lg bg-white/8 hover:bg-white/30"
                        title="Edit Agent"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <Link
                        to={`/agent/view/${agent.id}`} // Assuming you have a ViewAgent route
                        className="px-2 py-1 text-white rounded-lg transition duration-200 backdrop-blur-lg bg-white/8 hover:bg-white/30"
                        title="View Agent"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="px-2 py-1 text-white rounded-lg transition duration-200 backdrop-blur-lg bg-red-500/80 hover:bg-red-600"
                        title="Delete Agent"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default YourAgent;