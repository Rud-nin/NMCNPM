export function formatDate(dateTimeString) {
  const dateTime = new Date(dateTimeString);

  const day = String(dateTime.getDate()).padStart(2, "0");
  const month = String((dateTime.getMonth() + 1)).padStart(2, "0");
  const year = String(dateTime.getFullYear());

  return `${day}-${month}-${year}`;
};