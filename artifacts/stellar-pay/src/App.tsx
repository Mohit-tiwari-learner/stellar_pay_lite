import { useEffect, useState, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import {
  isConnected as freighterIsConnected,
  isAllowed,
  setAllowed,
  getAddress,
  requestAccess,
} from "@stellar/freighter-api";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { WalletConnect } from "@/components/WalletConnect";
import { Balance } from "@/components/Balance";
import { SendPayment } from "@/components/SendPayment";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "stellar-pay:publicKey";

function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return;

    (async () => {
      try {
        const installed = await freighterIsConnected();
        const installedOk =
          typeof installed === "object"
            ? (installed as { isConnected?: boolean }).isConnected
            : Boolean(installed);
        if (!installedOk) return;

        const allowed = await isAllowed();
        const allowedOk =
          typeof allowed === "object"
            ? (allowed as { isAllowed?: boolean }).isAllowed
            : Boolean(allowed);
        if (!allowedOk) return;

        const addr = await getAddress();
        const address =
          typeof addr === "string"
            ? addr
            : (addr as { address?: string }).address;
        if (address) setPublicKey(address);
      } catch {
        /* ignore restore errors */
      }
    })();
  }, []);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const installed = await freighterIsConnected();
      const installedOk =
        typeof installed === "object"
          ? (installed as { isConnected?: boolean }).isConnected
          : Boolean(installed);
      if (!installedOk) {
        setError(
          "Freighter wallet is not installed. Please install the Freighter browser extension and refresh the page.",
        );
        return;
      }

      await setAllowed();
      const access = await requestAccess();
      const address =
        typeof access === "string"
          ? access
          : (access as { address?: string; error?: string }).address;
      const accessError = (access as { error?: string }).error;

      if (accessError) {
        setError(accessError);
        return;
      }

      if (!address) {
        setError("Could not retrieve a public key from Freighter.");
        return;
      }

      setPublicKey(address);
      localStorage.setItem(STORAGE_KEY, address);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Failed to connect to Freighter wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleTxSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Stellar Testnet
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Stellar Pay
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Connect your Freighter wallet, view your XLM balance, and send
            testnet payments.
          </p>
        </header>

        <main className="space-y-5">
          <WalletConnect
            publicKey={publicKey}
            isConnecting={isConnecting}
            error={error}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          {publicKey && (
            <>
              <Balance publicKey={publicKey} refreshKey={refreshKey} />
              <SendPayment
                publicKey={publicKey}
                onSuccess={handleTxSuccess}
              />
            </>
          )}

          {!publicKey && (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to get started. Don't have one?{" "}
                <a
                  href="https://freighter.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Install Freighter
                </a>
                .
              </p>
            </div>
          )}
        </main>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Built with React, Tailwind, Stellar SDK and Freighter.
        </footer>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
