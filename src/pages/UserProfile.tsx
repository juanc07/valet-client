import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
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
        const agents = await getAgentCount(userId);
        setUser(userData);
        setAgentCount(agents);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-4 border-[#6894f3] border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-xl font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center text-red-500 text-xl">{error || "User not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-10">
      <div className="w-full max-w-4xl mx-4 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6894f3] to-[#4b6cb7] p-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">{user.username}'s Profile</h1>
          <p className="text-sm text-gray-200 mt-2">User ID: {user.userId}</p>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">User ID</label>
                <div className="relative flex items-center mt-1">
                  <p className="text-lg truncate flex-1">{user.userId}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.userId, "User ID")}
                    className="ml-2 text-[#6894f3] hover:text-[#8faef0]"
                    title="Copy User ID"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Solana Wallet Address</label>
                <div className="relative flex items-center mt-1">
                  <p className="text-lg truncate flex-1">
                    {publicKey ? publicKey.toBase58() : "Not connected"}
                  </p>
                  {publicKey && (
                    <button
                      type="button"
                      onClick={() => handleCopy(publicKey.toBase58(), "Wallet Address")}
                      className="ml-2 text-[#6894f3] hover:text-[#8faef0]"
                      title="Copy wallet address"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Email</label>
                <p className="text-lg mt-1">{user.email}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Full Name</label>
                <p className="text-lg mt-1">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "Not set"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Age</label>
                <p className="text-lg mt-1">{user.age || "Not set"}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Country</label>
                <p className="text-lg mt-1">
                  {countryOptions.find((opt) => opt.value === user.country)?.label || user.country || "Not set"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Mobile Number</label>
                <p className="text-lg mt-1">{user.mobileNumber || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Social Info */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Social Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Twitter Handle</label>
                <p className="text-lg mt-1">{user.twitterHandle || "Not set"}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Discord ID</label>
                <p className="text-lg mt-1">{user.discordId || "Not set"}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <label className="text-gray-400 text-sm font-medium">Telegram ID</label>
                <p className="text-lg mt-1">{user.telegramId || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#6894f3] to-[#4b6cb7] p-6 rounded-lg shadow-md text-center">
                <p className="text-white text-sm font-medium">Agents Created</p>
                <p className="text-3xl font-bold mt-2">{agentCount}</p>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-400 text-sm font-medium">Active Agents</p>
                <p className="text-3xl font-bold mt-2">0</p> {/* Placeholder */}
              </div>
              <div className="bg-gray-700 p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-400 text-sm font-medium">Total Transactions</p>
                <p className="text-3xl font-bold mt-2">0</p> {/* Placeholder */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}