// One place to control how prices look across the whole site.
export const CURRENCY_SYMBOL = "৳";

export function formatPrice(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0);

  return `${CURRENCY_SYMBOL}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}