// src/utils/web3.js
import { ethers } from "ethers";
import {
  RIDE_SHARING_ADDRESS,
  RIDE_SHARING_ABI,
} from "../config/rideSharingContract";

// ✅ Your Geth private chain (Thesis_geth) chainId
export const EXPECTED_CHAIN_ID = 181818;

let provider = null;

// ---------- Core helpers ----------

export async function getProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "MetaMask not detected. Please install the MetaMask extension."
    );
  }

  // cache provider instance
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  return provider;
}

/**
 * Explicitly request account access from MetaMask.
 * Use this on your "Connect Wallet" button.
 */
export async function connectWallet() {
  const provider = await getProvider();

  // This WILL trigger a MetaMask popup
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from MetaMask.");
  }

  // Make sure user is on correct network
  await ensureCorrectNetwork();

  // Return the first account for convenience
  return accounts[0];
}

/**
 * Get signer WITHOUT forcing a popup.
 * Assumes the user already connected their wallet.
 */
export async function getSigner() {
  const provider = await getProvider();

  // Does NOT trigger MetaMask popup
  const accounts = await provider.send("eth_accounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No connected accounts. Please connect your wallet first.");
  }

  const signer = await provider.getSigner(accounts[0]);
  return signer;
}

/**
 * Ensure the user is on the correct chain.
 * Throws an error if chainId does not match EXPECTED_CHAIN_ID.
 */
export async function ensureCorrectNetwork() {
  const provider = await getProvider();
  const network = await provider.getNetwork();

  // network.chainId is BigInt in ethers v6
  const currentChainId = Number(network.chainId);

  if (EXPECTED_CHAIN_ID && currentChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(
      `Wrong network detected (chainId: ${currentChainId}). Please switch MetaMask to your Geth Private Network (chainId ${EXPECTED_CHAIN_ID}).`
    );
  }

  return network;
}

// ---------- Contract factory ----------

/**
 * Get the RideSharing contract instance.
 * - withSigner = true  → uses signer (for write txs like requestRide, payForRide)
 * - withSigner = false → uses provider only (for read-only calls like getRideDetails)
 */
export async function getRideSharingContract(withSigner = true) {
  const provider = await getProvider();
  await ensureCorrectNetwork();

  const signerOrProvider = withSigner ? await getSigner() : provider;

  if (!RIDE_SHARING_ADDRESS) {
    throw new Error("Ride sharing contract address is not configured.");
  }

  return new ethers.Contract(
    RIDE_SHARING_ADDRESS,
    RIDE_SHARING_ABI,
    signerOrProvider
  );
}

// ---------- Optional helpers ----------

/**
 * Get currently connected account (if any, no popup).
 */
export async function getCurrentAccount() {
  const provider = await getProvider();
  const accounts = await provider.send("eth_accounts", []);
  return accounts?.[0] ?? null;
}

/**
 * Convenience helper: ensure wallet is connected AND on correct network.
 * You can call this once on app load or before sensitive flows.
 */
export async function ensureWalletReady() {
  const account = await connectWallet(); // triggers popup if not connected
  await ensureCorrectNetwork();
  return account;
}
