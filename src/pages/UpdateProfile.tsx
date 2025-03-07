import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTelegram, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { toast } from "sonner";
import { getUser, updateUser } from "../api/userApi";
import { User } from "../interfaces/user";
import { useWallet } from "@solana/wallet-adapter-react"; // Import useWallet
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface FormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number | string;
  country: number | string;
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
    age: "",
    country: "",
    mobileNumber: "",
    twitterHandle: "",
    discordId: "",
    telegramId: "",
  });
  const [error, setError] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  const { connected: walletConnected } = useWallet(); // Get wallet connection status
  const navigate = useNavigate();

  // Navigate to Start if wallet is not connected
  useEffect(() => {
    if (!walletConnected) {
      navigate("/"); // Redirect to Start page
    }
  }, [walletConnected, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser(userId);
        setFormData({
          username: user.username || "",
          email: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          age: user.age || "",
          country: user.country || "",
          mobileNumber: user.mobileNumber || "",
          twitterHandle: user.twitterHandle || "",
          discordId: user.discordId || "",
          telegramId: user.telegramId || "",
        });
      } catch (error) {
        setError("Failed to load profile data.");
        toast.error("Failed to load profile", {
          description: "Please try again later.",
          duration: 3000,
        });
      }
    };

    if (userId && walletConnected) { // Only fetch if wallet is connected
      fetchUserData();
    }
  }, [userId, walletConnected]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "age" || name === "country"
          ? isNaN(Number(value))
            ? value
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.email) {
      setError("Username and email are required.");
      toast.error("Form Submission Failed", {
        description: "Username and email are required.",
        duration: 3000,
      });
      return;
    }

    const updateData: Partial<User> = {
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: typeof formData.age === "string" ? parseInt(formData.age) || 0 : formData.age,
      country: typeof formData.country === "string" ? parseInt(formData.country) || 0 : formData.country,
      mobileNumber: formData.mobileNumber,
      twitterHandle: formData.twitterHandle,
      discordId: formData.discordId,
      telegramId: formData.telegramId,
    };

    try {
      await updateUser(userId, updateData);
      setError("");
      toast.success("Profile Updated", {
        description: `Successfully updated profile for ${formData.username}`,
        duration: 3000,
      });
    } catch (error) {
      setError("Failed to update profile.");
      toast.error("Update Failed", {
        description: "Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <div className="h-full bg-black text-white flex items-center justify-center p-0 lg:p-0 mt-5">
        <div className="w-full px-2 py-2 lg:px-0 lg:py- rounded-4xl md:rounded-lg shadow-lg flex justify-center items-center">
          <div className="w-full lg:w-4/5 pt-10 pb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Update Your Profile
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mx-auto py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col">
                    <label htmlFor="username" className="mb-1 text-white">
                      Username *
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Your username"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      minLength={1}
                      maxLength={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="email" className="mb-1 text-white">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Your email"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col">
                    <label htmlFor="firstName" className="mb-1 text-white">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Your first name"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      maxLength={50}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="lastName" className="mb-1 text-white">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Your last name"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      maxLength={50}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col">
                    <label htmlFor="age" className="mb-1 text-white">
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age || ""}
                      onChange={handleChange}
                      placeholder="Your age"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      min={18}
                      max={120}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="country" className="mb-1 text-white">
                      Country Code
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="number"
                      value={formData.country || ""}
                      onChange={handleChange}
                      placeholder="Country code (e.g., 1 for USA)"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      min={1}
                      max={999}
                    />
                  </div>
                </div>
                <div className="flex flex-col mb-2">
                  <label htmlFor="mobileNumber" className="mb-1 text-white">
                    Mobile Number
                  </label>
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="text"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="Your mobile number"
                    className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                    maxLength={15}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <div className="flex flex-col">
                    <label htmlFor="twitterHandle" className="mb-1 text-white">
                      Twitter Handle
                    </label>
                    <input
                      id="twitterHandle"
                      name="twitterHandle"
                      type="text"
                      value={formData.twitterHandle}
                      onChange={handleChange}
                      placeholder="@yourtwitter"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      maxLength={15}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="discordId" className="mb-1 text-white">
                      Discord ID
                    </label>
                    <input
                      id="discordId"
                      name="discordId"
                      type="text"
                      value={formData.discordId}
                      onChange={handleChange}
                      placeholder="Your Discord ID"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      maxLength={32}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="telegramId" className="mb-1 text-white">
                      Telegram ID
                    </label>
                    <input
                      id="telegramId"
                      name="telegramId"
                      type="text"
                      value={formData.telegramId}
                      onChange={handleChange}
                      placeholder="@yourtelegram"
                      className="w-full border border-[#494848] text-white p-2 md:p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
                      maxLength={32}
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-center mt-2">{error}</p>}

              <div className="w-full flex items-center justify-between mb-6">
                {!connected ? (
                  <button
                    type="button"
                    className="w-full py-2 rounded-4xl flex items-center justify-center gap-2 cursor-pointer text-nowrap transition-all duration-400 ease-in-out backdrop-blur-lg border border-[#6a94f0] hover:bg-white/15"
                    onClick={() => setConnected(true)}
                  >
                    Connect With <FontAwesomeIcon icon={faXTwitter} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full py-2 rounded-4xl flex items-center justify-center gap-2 text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10"
                    onClick={() => setConnected(false)}
                  >
                    Disconnect <FontAwesomeIcon icon={faXTwitter} />
                  </button>
                )}
              </div>

              <div className="w-full md:w-1/2 flex items-center justify-center mb-4 px-4 mx-auto">
                <div className="flex-grow border-t border-gray-500 mx-2"></div>
                <p className="text-gray-400">Coming Soon</p>
                <div className="flex-grow border-t border-gray-500 mx-2"></div>
              </div>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <FontAwesomeIcon
                  icon={faDiscord}
                  size="2x"
                  className="text-[#5a65ee]"
                />
                <FontAwesomeIcon
                  icon={faTelegram}
                  size="2x"
                  className="text-[#2da8e7]"
                />
              </div>

              <div className="text-center w-full">
                <button
                  type="submit"
                  className="w-full py-2 rounded-4xl text-lg text-black cursor-pointer bg-[#6a94f0] transition-all duration-400 ease-in-out backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:text-white"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}