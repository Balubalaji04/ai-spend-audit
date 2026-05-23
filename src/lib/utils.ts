/**
 * Formats a dollar amount for display.
 * Under $1,000: "$340" — at or above: "$1,240" (with commas).
 * Shows cents only when the amount is not a whole number.
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) {
    return `$${rounded.toLocaleString("en-US")}`;
  }
  return `$${rounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** e.g. "$4,080/year" */
export function formatCurrencyAnnual(amount: number): string {
  return `${formatCurrency(amount)}/year`;
}
