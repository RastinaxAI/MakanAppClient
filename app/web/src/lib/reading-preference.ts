/** Apply saved preferences without importing authenticated page components. */
export function applyReadingPreference() {
  try {
    document.documentElement.dataset.reading =
      localStorage.getItem('makan-reading') === 'large' ? 'large' : 'standard';
    document.documentElement.dataset.motion =
      localStorage.getItem('makan-motion') === 'reduce' ? 'reduce' : 'system';
  } catch {}
}
