export function formatMemberScience(datestring) {
  const date = new Date(datestring);
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

export function formatPublishedDate(datestring) {
  const date = new Date(datestring);
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}