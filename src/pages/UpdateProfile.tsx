import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { getUser, updateUser } from "../api/userApi";
import { User } from "../interfaces/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { countryOptions } from "../data/countries";
import { useUser } from "../context/UserContext";

interface FormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  country: string;
  mobileNumber: string;
  twitterHandle: string;
  discordId: string;
  telegramId: string;
}

interface UpdateProfileProps {
  userId: string;
}

export default function UpdateProfile({ userId }: UpdateProfileProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    birthdate: "",
    country: "",
    mobileNumber: "",
    twitterHandle: "",
    discordId: "",
    telegramId: "",
  });
  const [serverError, setServerError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { connected: walletConnected, publicKey } = useWallet();
  const { serverLive, checkServerStatus } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !publicKey || !userId) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        console.log("Fetching user with ID:", userId);
        await checkServerStatus();
        if (serverLive === false) {
          throw new Error("Server is currently unavailable.");
        }

        const user: User = await getUser(userId);
        setFormData({
          username: user.username || "",
          email: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          birthdate: user.birthdate || "",
          country: user.country || "",
          mobileNumber: user.mobileNumber || "",
          twitterHandle: user.twitterHandle || "",
          discordId: user.discordId || "",
          telegramId: user.telegramId || "",
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Fetch user error:", err);
        setServerError(errorMsg || "Failed to load profile data.");
        toast.error("Failed to load profile", {
          description: errorMsg || "Please try again later.",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, walletConnected, publicKey, navigate, serverLive, checkServerStatus]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyWalletAddress = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      toast.success("Wallet Address Copied", {
        description: "The Solana wallet address has been copied to your clipboard.",
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to copy wallet address:", err);
      toast.error("Copy Failed", { description: "Failed to copy the wallet address.", duration: 2000 });
    }
  };

  const calculateAge = (birthdate: string): number => {
    if (!birthdate) return 0;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.username || !formData.email) {
      setServerError("Username and email are required.");
      toast.error("Form Submission Failed", {
        description: "Username and email are required.",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    const updateData: Partial<User> = {
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      birthdate: formData.birthdate || undefined,
      age: calculateAge(formData.birthdate),
      country: formData.country || undefined,
      mobileNumber: formData.mobileNumber || undefined,
      twitterHandle: formData.twitterHandle || undefined,
      discordId: formData.discordId || undefined,
      telegramId: formData.telegramId || undefined,
    };

    try {
      console.log("Checking server status before update...");
      await checkServerStatus();
      if (serverLive === false) {
        throw new Error("Server is currently unavailable.");
      }

      await updateUser(userId, updateData);
      setServerError("");
      toast.success("Profile Updated", {
        description: `Successfully updated profile for ${formData.username}`,
        duration: 3000,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Update user error:", err);
      setServerError(errorMsg || "Failed to update profile.");
      toast.error("Update Failed", {
        description: errorMsg || "Please try again.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate("/profile");

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="text-[#6894f3] text-4xl animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  if (serverError && !isSubmitting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center text-red-500 text-xl md:text-2xl">{serverError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-lg shadow-lg bg-[#222128] border border-[#494848] p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">Update Your Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="username" className="mb-1 text-white">Username *</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Your username"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                minLength={1}
                maxLength={20}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-white">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your email"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="walletAddress" className="mb-1 text-white">Solana Wallet Address</label>
              <div className="relative">
                <input
                  id="walletAddress"
                  type="text"
                  value={publicKey ? publicKey.toBase58() : "Not connected"}
                  readOnly
                  className="w-full border border-[#494848] text-white p-3 pr-10 rounded-lg outline-none bg-[#333]"
                />
                {publicKey && (
                  <button
                    type="button"
                    onClick={handleCopyWalletAddress}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6a94f0] hover:text-[#8faef0]"
                    title="Copy wallet address"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="firstName" className="mb-1 text-white">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Your first name"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                maxLength={50}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="lastName" className="mb-1 text-white">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Your last name"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                maxLength={50}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="birthdate" className="mb-1 text-white">Birthdate</label>
              <input
                id="birthdate"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="country" className="mb-1 text-white">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
              >
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="mobileNumber" className="mb-1 text-white">Mobile Number</label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="text"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Your mobile number"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                maxLength={15}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="twitterHandle" className="mb-1 text-white">Twitter Handle</label>
              <input
                id="twitterHandle"
                name="twitterHandle"
                type="text"
                value={formData.twitterHandle}
                onChange={handleChange}
                placeholder="@yourtwitter"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                maxLength={15}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="discordId" className="mb-1 text-white">Discord ID</label>
              <input
                id="discordId"
                name="discordId"
                type="text"
                value={formData.discordId}
                onChange={handleChange}
                placeholder="Your Discord ID"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                maxLength={32}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="telegramId" className="mb-1 text-white">Telegram ID</label>
              <input
                id="telegramId"
                name="telegramId"
                type="text"
                value={formData.telegramId}
                onChange={handleChange}
                placeholder="@yourtelegram"
                className="w-full border border-[#494848] text-white p-3 rounded-lg outline-none focus:ring-1 focus:ring-[#6a94f0] bg-[#222128]"
                maxLength={32}
              />
            </div>
          </div>

          {serverError && isSubmitting && (
            <p className="text-red-500 text-center mt-2">{serverError}</p>
          )}

          <div className="flex justify-between gap-4 mt-6">
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#6a94f0] text-black rounded-lg hover:bg-white/10 hover:text-white transition-all duration-400 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}