const SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AUD: "A$", CAD: "C$" };

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? `${currency} `;
}

export function formatCurrency(amount: number, currency: string = "GBP"): string {
  const symbol = currencySymbol(currency);
  const sign = amount < 0 ? "-" : "";
  const formatted = Math.abs(amount).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${symbol}${formatted}`;
}
