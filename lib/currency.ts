/**
 * Single source of truth for currency formatting in chinho.
 * Used on BOTH client side and admin panel — never hardcode ৳ or $ anywhere else.
 */
export function formatPrice(
  amount: number | string,
  currency: string = "BDT",
  locale: string = "en-BD"   // ← changed from bn-BD to en-BD
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return "৳0.00";   // ← better fallback than "0.00" (no currency symbol before)
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}