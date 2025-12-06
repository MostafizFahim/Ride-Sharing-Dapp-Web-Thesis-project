import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getProvider,
  connectWallet as web3ConnectWallet,
  getCurrentAccount,
  EXPECTED_CHAIN_ID,
} from "../utils/web3";

// -------------------------
// CONTEXT DEFAULTS
// -------------------------
export const UserContext = createContext({
  // App user system
  user: null,
  setUser: () => {},
  logout: () => {},

  // Blockchain wallet system
  account: null,
  chainId: null,
  connectWallet: () => {},
});

// Custom hook to use context
export function useUser() {
  return useContext(UserContext);
}

// -------------------------
// PROVIDER COMPONENT
// -------------------------
export function UserProvider({ children }) {
  // -------------------------
  // (1) NORMAL APP USER SYSTEM (your login system)
  // -------------------------
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const localUser = localStorage.getItem("user");
    return localUser ? JSON.parse(localUser) : null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("registeredUser");
    }
  };

  // -------------------------
  // (2) BLOCKCHAIN WALLET SYSTEM
  // -------------------------
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Connect wallet function (uses web3.js helper)
  const connectWallet = async () => {
    try {
      const provider = await getProvider();

      // This triggers the MetaMask connect popup
      const connectedAccount = await web3ConnectWallet();
      const network = await provider.getNetwork();

      const numericChainId = Number(network.chainId);
      setAccount(connectedAccount);
      setChainId(numericChainId);

      // Check chain ID against your expected private chain
      if (EXPECTED_CHAIN_ID && numericChainId !== EXPECTED_CHAIN_ID) {
        alert(
          `⚠ Please switch MetaMask to your Geth Private Network (chainId ${EXPECTED_CHAIN_ID}).`
        );
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Failed to connect wallet: " + (err?.message || "Unknown error"));
    }
  };

  // On mount: attempt to restore wallet state if already connected
  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined") return;
        if (!window.ethereum) return;

        const provider = await getProvider();
        const existingAccount = await getCurrentAccount();

        if (existingAccount) {
          const network = await provider.getNetwork();
          setAccount(existingAccount);
          setChainId(Number(network.chainId));
        }
      } catch (err) {
        console.warn("Failed to restore wallet state:", err);
      }
    })();
  }, []);

  // Listen for wallet/account & chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      const newAccount = accounts && accounts.length > 0 ? accounts[0] : null;
      setAccount(newAccount);
    };

    const handleChainChanged = (chainIdHex) => {
      // EIP-1193: chainId comes as hex string (e.g., "0x2b5e")
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);

      if (EXPECTED_CHAIN_ID && newChainId !== EXPECTED_CHAIN_ID) {
        alert(
          `⚠ Network changed. Please switch to chainId ${EXPECTED_CHAIN_ID} for this app.`
        );
      }
      // If you prefer hard reload for safety:
      // window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (!window.ethereum) return;
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // -------------------------
  // FINAL CONTEXT VALUE
  // -------------------------
  return (
    <UserContext.Provider
      value={{
        // App user system
        user,
        setUser,
        logout,

        // Blockchain wallet system
        account,
        chainId,
        connectWallet,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
