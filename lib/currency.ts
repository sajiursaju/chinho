/**
 * Utility function to format numbers into standard currency format.
 * Adjust currency code and locale as needed (e.g., BDT / en-BD or USD / en-US).
 */
export function formatPrice(
  amount: number | string,
  currency: string = "BDT",
  locale: string = "bn-BD"
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return "0.00";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}