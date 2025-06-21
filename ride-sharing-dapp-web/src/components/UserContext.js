import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Context with default values for better IDE support
export const UserContext = createContext({
  user: null,
  setUser: () => {},
  logout: () => {},
});

// 2. Custom hook for consuming the context
export function useUser() {
  return useContext(UserContext);
}

// 3. Provider
export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem("user");
    return localUser ? JSON.parse(localUser) : null;
  });

  // Keep localStorage synced with context
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Centralized logout for safety
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("registeredUser"); // Optional: Clear both
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}
