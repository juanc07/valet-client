import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { getUser, getAgentCount } from "../api/userApi";
import { User } from "../interfaces/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { countryOptions } from "../data/countries";

interface UserProfileProps {
  userId: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [agentCount, setAgentCount] = useState<number>(0);
  const [activeAgentCount, setActiveAgentCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const { connected: walletConnected, publicKey } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected) {
      navigate("/");
    }
  }, [walletConnected, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUser(userId);
        const totalAgents = await getAgentCount(userId);
        const activeAgentsCount = await getAgentCount(userId);

        setUser(userData);
        setAgentCount(totalAgents);
        setActiveAgentCount(activeAgentsCount);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data.");
        toast.error("Failed to load profile", {
          description: "Please try again later.",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId && walletConnected) {
      fetchUserData();
    }
  }, [userId, walletConnected]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} Copied`, {
        description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
        duration: 3000,
      });
    }).catch((err) => {
      console.error(`Failed to copy ${label.toLowerCase()}:`, err);
      toast.error("Copy Failed", {
        description: `Failed to copy the ${label.toLowerCase()}.`,
        duration: 3000,
      });
    });
  };

  const handleUpdateProfile = () => {
    navigate("/update-profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-[#6894f3] text-4xl animate-spin"
          />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Your Profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center text-red-500">{error || "User not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#6a94f0]">{user.username}'s Profile</h1>
          <p className="text-gray-400 mt-2">Your personal overview</p>
        </div>

        {/* Top Row: Personal Details and Social Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Personal Details */}
          <div className="bg-[#222128] rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-4">Personal Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">User ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white truncate max-w-[150px] md:max-w-[200px] text-sm">
                    {user.userId}
                  </span>
                  <button
                    onClick={() => handleCopy(user.userId, "User ID")}
                    className="text-[#6a94f0] hover:text-[#8faef0]"
                    title="Copy User ID"
                  >
                    <FontAwesomeIcon icon={faCopy} size="sm" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Wallet:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white truncate max-w-[150px] md:max-w-[200px] text-sm">
                    {publicKey ? publicKey.toBase58() : "Not connected"}
                  </span>
                  {publicKey && (
                    <button
                      onClick={() => handleCopy(publicKey.toBase58(), "Wallet Address")}
                      className="text-[#6a94f0] hover:text-[#8faef0]"
                      title="Copy Wallet Address"
                    >
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Email:</span>
                <span className="text-white text-sm">{user.email || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Full Name:</span>
                <span className="text-white text-sm">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Birthdate:</span>
                <span className="text-white text-sm">{user.birthdate || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Country:</span>
                <span className="text-white text-sm">
                  {countryOptions.find((opt) => opt.value === user.country)?.label || user.country || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Mobile:</span>
                <span className="text-white text-sm">{user.mobileNumber || "Not set"}</span>
              </div>
            </div>
          </div>

          {/* Social Connections */}
          <div className="bg-[#222128] rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-4">Social Connections</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Twitter:</span>
                <span className="text-white text-sm">{user.twitterHandle || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Discord:</span>
                <span className="text-white text-sm">{user.discordId || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Telegram:</span>
                <span className="text-white text-sm">{user.telegramId || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#222128] rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Agents Created</p>
              <p className="text-2xl font-bold text-[#6a94f0]">{agentCount}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Active Agents</p>
              <p className="text-2xl font-bold text-[#6a94f0]">{activeAgentCount}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Credits</p>
              <p className="text-2xl font-bold text-[#6a94f0]">{user.credit ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Update Profile Button */}
        <div className="text-center">
          <button
            onClick={handleUpdateProfile}
            className="py-2 px-6 bg-[#6a94f0] text-black rounded-lg hover:bg-[#8faef0] transition-all duration-300"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}