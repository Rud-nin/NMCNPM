export function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);


  const hh = String(dateTime.getUTCHours()).padStart(2, "0");
  const mm = String(dateTime.getUTCMinutes()).padStart(2, "0");
  const ss = String(dateTime.getUTCSeconds()).padStart(2, "0");
  
  const day = String(dateTime.getUTCDate()).padStart(2, "0");
  const month = String(dateTime.getUTCMonth() + 1).padStart(2, "0");
  const year = String(dateTime.getUTCFullYear());

  return `${hh}:${mm}:${ss} ${day}/${month}/${year}`;
};