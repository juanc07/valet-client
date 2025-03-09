import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../interfaces/user";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  viewMode: "myAgents" | "othersAgents";
  setViewMode: (mode: "myAgents" | "othersAgents") => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  viewMode: "myAgents",
  setViewMode: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [viewMode, setViewMode] = useState<"myAgents" | "othersAgents">("myAgents");

  // Log state changes for debugging
  console.log("UserContext - currentUser:", currentUser);
  console.log("UserContext - viewMode:", viewMode);

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

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetCurrentUser, viewMode, setViewMode: handleSetViewMode }}>
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