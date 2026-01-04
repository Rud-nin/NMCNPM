export function formatDate(dateTimeString) {
  const dateTime = new Date(dateTimeString);

  const day = String(dateTime.getUTCDate()).padStart(2, "0");
  const month = String(dateTime.getUTCMonth() + 1).padStart(2, "0");
  const year = String(dateTime.getUTCFullYear());

  return `${day}/${month}/${year}`;
};