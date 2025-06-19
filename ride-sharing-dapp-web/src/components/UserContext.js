import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Create the context
export const UserContext = createContext();

// 2. Export a custom hook for easy access in any component
export function useUser() {
  return useContext(UserContext);
}

// 3. Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem("user");
    return localUser ? JSON.parse(localUser) : null;
  });

  // Sync localStorage whenever user changes
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
