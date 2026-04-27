import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Coins } from "lucide-react";
import { getXlmBalance } from "@/utils/stellar";

interface BalanceProps {
  publicKey: string | null;
  refreshKey?: number;
}

export function Balance({ publicKey, refreshKey = 0 }: BalanceProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getXlmBalance(publicKey);
      setBalance(result);
    } catch (err: unknown) {
      const e = err as { name?: string; response?: { status?: number } };
      if (e?.response?.status === 404 || e?.name === "NotFoundError") {
        setError(
          "Account not found on testnet. Fund it from the Stellar Friendbot to activate it.",
        );
        setBalance(null);
      } else {
        setError("Failed to load balance. Please try again.");
        setBalance(null);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
      setError(null);
    }
  }, [publicKey, refreshKey, fetchBalance]);

  if (!publicKey) return null;

  const formatted = balance
    ? Number(balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7,
      })
    : "—";

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center">
            <Coins className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">XLM Balance</p>
            <p className="text-xs text-muted-foreground">Stellar Testnet</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchBalance}
          disabled={loading}
          data-testid="button-refresh-balance"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="mt-4">
        {loading && balance === null ? (
          <div className="h-10 w-40 rounded-md bg-secondary animate-pulse" />
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">{error}</p>
            {error.includes("Friendbot") && (
              <a
                href={`https://friendbot.stellar.org/?addr=${publicKey}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-1 underline underline-offset-2"
              >
                Open Friendbot
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-bold tracking-tight"
              data-testid="text-balance"
            >
              {formatted}
            </span>
            <span className="text-base font-semibold text-muted-foreground">
              XLM
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
