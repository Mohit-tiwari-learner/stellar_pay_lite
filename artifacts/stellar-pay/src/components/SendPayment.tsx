import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import {
  buildPaymentXdr,
  submitSignedXdr,
  isValidStellarAddress,
  NETWORK_PASSPHRASE,
} from "@/utils/stellar";
import { signTransaction } from "@stellar/freighter-api";

interface SendPaymentProps {
  publicKey: string | null;
  onSuccess?: () => void;
}

type Result =
  | { kind: "success"; hash: string }
  | { kind: "error"; message: string };

export function SendPayment({ publicKey, onSuccess }: SendPaymentProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  if (!publicKey) return null;

  const reset = () => {
    setDestination("");
    setAmount("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!isValidStellarAddress(destination)) {
      setResult({
        kind: "error",
        message: "Invalid Stellar address. It should start with G and be 56 characters.",
      });
      return;
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setResult({ kind: "error", message: "Enter a valid positive amount." });
      return;
    }

    if (destination === publicKey) {
      setResult({
        kind: "error",
        message: "Destination cannot be your own address.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const xdr = await buildPaymentXdr({
        source: publicKey,
        destination,
        amount: amountNum.toFixed(7),
      });

      const signResult = await signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });

      const signedXdr =
        typeof signResult === "string"
          ? signResult
          : (signResult as { signedTxXdr?: string; signedXDR?: string })
              .signedTxXdr ||
            (signResult as { signedTxXdr?: string; signedXDR?: string })
              .signedXDR ||
            "";

      if (!signedXdr) {
        throw new Error("Wallet did not return a signed transaction.");
      }

      const submitted = await submitSignedXdr(signedXdr);
      setResult({ kind: "success", hash: submitted.hash });
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as {
        message?: string;
        response?: { data?: { extras?: { result_codes?: unknown } } };
      };
      const codes = e?.response?.data?.extras?.result_codes;
      const codesText = codes ? ` (${JSON.stringify(codes)})` : "";
      const msg =
        e?.message && e.message.length < 200
          ? e.message
          : "Transaction failed.";
      setResult({ kind: "error", message: `${msg}${codesText}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">Send XLM</h2>
          <p className="text-sm text-muted-foreground leading-tight">
            Transfer testnet Lumens to any Stellar address
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="destination">Destination address</Label>
          <Input
            id="destination"
            placeholder="G..."
            value={destination}
            onChange={(e) => setDestination(e.target.value.trim())}
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-sm"
            data-testid="input-destination"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (XLM)</Label>
          <Input
            id="amount"
            type="number"
            step="0.0000001"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-testid="input-amount"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || !destination || !amount}
          data-testid="button-send"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Payment
            </>
          )}
        </Button>
      </form>

      {result && (
        <div className="mt-5">
          {result.kind === "success" ? (
            <div
              className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm"
              data-testid="result-success"
            >
              <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Transaction submitted
              </div>
              <p className="mt-2 text-xs text-muted-foreground break-all">
                Hash:{" "}
                <span className="font-mono text-foreground">
                  {result.hash}
                </span>
              </p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 underline underline-offset-2 text-xs"
              >
                View on Stellar Expert
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              data-testid="result-error"
            >
              <div className="flex items-center gap-2 font-semibold">
                <XCircle className="h-4 w-4" />
                Transaction failed
              </div>
              <p className="mt-2 text-xs break-words">{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
