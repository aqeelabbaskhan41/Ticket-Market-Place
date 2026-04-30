/**
 * Formats a date in British style: 1/Jan/2026
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'N/A';
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Formats a date with weekday in British style: Monday, 1/Jan/2026
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateLong(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'N/A';
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
    return `${weekday}, ${formatDate(dateInput)}`;
  } catch {
    return 'N/A';
  }
}
