import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ExternalLink } from "lucide-react";
import { shortenAddress } from "@/utils/stellar";

interface WalletConnectProps {
  publicKey: string | null;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnect({
  publicKey,
  isConnecting,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight">
              Freighter Wallet
            </h2>
            <p className="text-sm text-muted-foreground leading-tight">
              {publicKey ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>

        {publicKey ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm bg-secondary px-3 py-1.5 rounded-md">
              {shortenAddress(publicKey)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              data-testid="button-disconnect"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            data-testid="button-connect"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">{error}</p>
          {error.toLowerCase().includes("freighter") && (
            <a
              href="https://freighter.app/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-destructive underline underline-offset-2"
            >
              Install Freighter
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
