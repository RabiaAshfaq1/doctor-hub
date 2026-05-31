/** Pakistani Rupee (PKR) formatting */
export const CURRENCY_CODE = 'PKR';
export const CURRENCY_LABEL = 'Rs';

export function formatCurrency(amount, options = {}) {
  const { decimals = 0 } = options;
  const value = parseFloat(amount) || 0;
  return `${CURRENCY_LABEL} ${value.toLocaleString('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
