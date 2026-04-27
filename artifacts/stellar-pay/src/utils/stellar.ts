import {
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new Horizon.Server(HORIZON_URL);

export async function getXlmBalance(publicKey: string): Promise<string> {
  const account = await server.loadAccount(publicKey);
  const native = account.balances.find(
    (b: { asset_type: string; balance: string }) => b.asset_type === "native",
  );
  return native ? native.balance : "0";
}

export async function buildPaymentXdr(params: {
  source: string;
  destination: string;
  amount: string;
  memo?: string;
}): Promise<string> {
  const account = await server.loadAccount(params.source);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination: params.destination,
      asset: Asset.native(),
      amount: params.amount,
    }),
  );

  const transaction = builder.setTimeout(180).build();
  return transaction.toXDR();
}

export async function submitSignedXdr(signedXdr: string) {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  return await server.submitTransaction(tx);
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}
