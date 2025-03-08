import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { getUser, getAgentCount, getActiveAgentCount } from "../api/userApi";
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
        const activeAgentsCount = await getActiveAgentCount(userId, true);

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

  if (loading) {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
        <div className="text-center">Loading your profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
        <div className="text-center text-red-500">{error || "User not found"}</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-4">
      <div className="w-full p-0 lg:p-6 rounded-none lg:rounded-lg shadow-lg overflow-x-auto max-w-full pt-10 pb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {user.username}'s Profile
        </h1>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="mb-1 text-white">User ID</label>
            <div className="relative flex items-center">
              <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg truncate flex-1">
                {user.userId}
              </p>
              <button
                type="button"
                onClick={() => handleCopy(user.userId, "User ID")}
                className="absolute right-2 text-[#6894f3] hover:text-[#8faef0]"
                title="Copy User ID"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Solana Wallet Address</label>
            <div className="relative flex items-center">
              <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg truncate flex-1">
                {publicKey ? publicKey.toBase58() : "Not connected"}
              </p>
              {publicKey && (
                <button
                  type="button"
                  onClick={() => handleCopy(publicKey.toBase58(), "Wallet Address")}
                  className="absolute right-2 text-[#6894f3] hover:text-[#8faef0]"
                  title="Copy wallet address"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Email</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {user.email}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Full Name</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : "Not set"}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Birthdate</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {user.birthdate || "Not set"}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Country</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {countryOptions.find((opt) => opt.value === user.country)?.label || user.country || "Not set"}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Mobile Number</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {user.mobileNumber || "Not set"}
            </p>
          </div>
        </div>

        {/* Social Info */}
        <h2 className="text-xl font-semibold mb-4">Social Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="mb-1 text-white">Twitter Handle</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {user.twitterHandle || "Not set"}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Discord ID</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {user.discordId || "Not set"}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Telegram ID</label>
            <p className="w-full border border-[#494848] p-2 md:p-3 rounded-lg">
              {user.telegramId || "Not set"}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col bg-[#222128] p-4 rounded-lg">
            <label className="mb-1 text-white">Agents Created</label>
            <p className="text-3xl font-bold">{agentCount}</p>
          </div>
          <div className="flex flex-col bg-[#222128] p-4 rounded-lg">
            <label className="mb-1 text-white">Active Agents</label>
            <p className="text-3xl font-bold">{activeAgentCount}</p>
          </div>
          <div className="flex flex-col bg-[#222128] p-4 rounded-lg">
            <label className="mb-1 text-white">Total Transactions</label>
            <p className="text-3xl font-bold">0</p> {/* Placeholder */}
          </div>
        </div>
      </div>
    </div>
  );
}