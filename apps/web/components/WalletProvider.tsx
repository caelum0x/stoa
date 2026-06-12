"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPublicClient, http, formatEther, toHex, type Address } from "viem";
import { PHAROS_ATLANTIC } from "@/lib/wallet";

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

interface WalletState {
  address: Address | null;
  chainId: number | null;
  balance: string | null;
  connecting: boolean;
  error: string | null;
  isPharos: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToPharos: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

function getEth(): Eip1193 | null {
  return (globalThis as { ethereum?: Eip1193 }).ethereum ?? null;
}

const publicClient = createPublicClient({
  chain: PHAROS_ATLANTIC,
  transport: http(PHAROS_ATLANTIC.rpcUrls.default.http[0]),
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const wei = await publicClient.getBalance({ address });
      setBalance(formatEther(wei));
    } catch {
      setBalance(null);
    }
  }, [address]);

  const readChain = useCallback(async (eth: Eip1193) => {
    try {
      const id = (await eth.request({ method: "eth_chainId" })) as string;
      setChainId(Number(id));
    } catch {
      setChainId(null);
    }
  }, []);

  const connect = useCallback(async () => {
    const eth = getEth();
    if (!eth) {
      setError("No injected wallet found. Install MetaMask or a compatible wallet.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as Address[];
      setAddress(accounts[0] ?? null);
      await readChain(eth);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setConnecting(false);
    }
  }, [readChain]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
  }, []);

  const switchToPharos = useCallback(async () => {
    const eth = getEth();
    if (!eth) return;
    try {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: toHex(PHAROS_ATLANTIC.id),
            chainName: PHAROS_ATLANTIC.name,
            nativeCurrency: PHAROS_ATLANTIC.nativeCurrency,
            rpcUrls: [...PHAROS_ATLANTIC.rpcUrls.default.http],
          },
        ],
      });
      await readChain(eth);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [readChain]);

  // React to wallet account/chain changes + restore an existing connection.
  useEffect(() => {
    const eth = getEth();
    if (!eth) return;
    eth.request({ method: "eth_accounts" }).then((accs) => {
      const a = (accs as Address[])[0];
      if (a) {
        setAddress(a);
        readChain(eth);
      }
    });
    const onAccounts = (...args: unknown[]) => setAddress(((args[0] as Address[]) ?? [])[0] ?? null);
    const onChain = (...args: unknown[]) => setChainId(Number(args[0] as string));
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [readChain]);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  const value = useMemo<WalletState>(
    () => ({
      address,
      chainId,
      balance,
      connecting,
      error,
      isPharos: chainId === PHAROS_ATLANTIC.id,
      connect,
      disconnect,
      switchToPharos,
      refreshBalance,
    }),
    [address, chainId, balance, connecting, error, connect, disconnect, switchToPharos, refreshBalance],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
