export function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);

  const hh = String(dateTime.getHours()).padStart(2, "0");
  const mm = String(dateTime.getMinutes()).padStart(2, "0");
  const ss = String(dateTime.getSeconds()).padStart(2, "0");

  const day = String(dateTime.getDate()).padStart(2, "0");
  const month = String((dateTime.getMonth() + 1)).padStart(2, "0");
  const year = String(dateTime.getFullYear());

  return `${hh}:${mm}:${ss} ${day}/${month}/${year}`;
};