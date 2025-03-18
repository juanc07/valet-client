import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../interfaces/user";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  viewMode: "myAgents" | "othersAgents";
  setViewMode: (mode: "myAgents" | "othersAgents") => void;
  isWalletConnected: boolean;
  setIsWalletConnected: (connected: boolean) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  viewMode: "myAgents",
  setViewMode: () => {},
  isWalletConnected: false,
  setIsWalletConnected: () => {},
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

  // Track previous wallet state to detect transitions
  const [prevWalletConnected, setPrevWalletConnected] = useState<boolean>(isWalletConnected);

  // Log state changes for debugging
  console.log("UserContext - currentUser:", currentUser);
  console.log("UserContext - viewMode:", viewMode);
  console.log("UserContext - isWalletConnected:", isWalletConnected);

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

  // Detect wallet state transitions
  useEffect(() => {
    if (prevWalletConnected !== isWalletConnected) {
      if (isWalletConnected) {
        console.log("Wallet state transitioned: Not Connected -> Connected");
      } else {
        console.log("Wallet state transitioned: Connected -> Not Connected");
      }
      setPrevWalletConnected(isWalletConnected); // Update previous state
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