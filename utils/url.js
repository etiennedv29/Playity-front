function getGameNameFromUrl() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments[0];
}

module.exports = { getGameNameFromUrl };
