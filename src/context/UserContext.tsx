import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../interfaces/user";
import { getServerStatus } from "../api/userApi";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  viewMode: "myAgents" | "othersAgents";
  setViewMode: (mode: "myAgents" | "othersAgents") => void;
  isWalletConnected: boolean;
  setIsWalletConnected: (connected: boolean) => void;
  serverLive: boolean | null;
  setServerLive: (live: boolean | null) => void;
  checkServerStatus: () => Promise<void>; // Expose manual check function
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  viewMode: "myAgents",
  setViewMode: () => {},
  isWalletConnected: false,
  setIsWalletConnected: () => {},
  serverLive: null,
  setServerLive: () => {},
  checkServerStatus: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [viewMode, setViewMode] = useState<"myAgents" | "othersAgents">("myAgents");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(() => {
    const savedWalletState = sessionStorage.getItem("isWalletConnected");
    return savedWalletState ? JSON.parse(savedWalletState) : false;
  });
  const [serverLive, setServerLive] = useState<boolean | null>(null);

  const [prevWalletConnected, setPrevWalletConnected] = useState<boolean>(isWalletConnected);

  console.log("UserContext - currentUser:", currentUser);
  console.log("UserContext - viewMode:", viewMode);
  console.log("UserContext - isWalletConnected:", isWalletConnected);
  console.log("UserContext - serverLive:", serverLive);

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      sessionStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("currentUser");
    }
  };

  const handleSetViewMode = (mode: "myAgents" | "othersAgents") => {
    console.log("Setting viewMode to:", mode);
    setViewMode(mode);
  };

  const handleSetIsWalletConnected = (connected: boolean) => {
    setIsWalletConnected(connected);
    sessionStorage.setItem("isWalletConnected", JSON.stringify(connected));
  };

  const handleSetServerLive = (live: boolean | null) => {
    setServerLive(live);
  };

  const checkServerStatus = async () => {
    try {
      const status = await getServerStatus();
      setServerLive(status.isLive);
      console.log("Server status checked:", status.isLive);
    } catch (error) {
      console.error("Failed to check server status:", error);
      setServerLive(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkServerStatus();

    // Polling every 5 minutes as backup
    const interval = setInterval(() => {
      checkServerStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prevWalletConnected !== isWalletConnected) {
      if (isWalletConnected) {
        console.log("Wallet state transitioned: Not Connected -> Connected");
      } else {
        console.log("Wallet state transitioned: Connected -> Not Connected");
      }
      setPrevWalletConnected(isWalletConnected);
    }
  }, [isWalletConnected, prevWalletConnected]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        viewMode,
        setViewMode: handleSetViewMode,
        isWalletConnected,
        setIsWalletConnected: handleSetIsWalletConnected,
        serverLive,
        setServerLive: handleSetServerLive,
        checkServerStatus, // Provide the function to consumers
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};