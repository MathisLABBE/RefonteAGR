const DEFAULTS = { enabled: true, contrast: false };

const enabled = document.getElementById('enabled');
const contrast = document.getElementById('contrast');

function render(s) {
  enabled.checked = s.enabled;
  contrast.checked = s.contrast;
  document.body.classList.toggle('off', !s.enabled);
}

chrome.storage.sync.get(DEFAULTS, render);

enabled.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: enabled.checked });
  document.body.classList.toggle('off', !enabled.checked);
});
contrast.addEventListener('change', () => chrome.storage.sync.set({ contrast: contrast.checked }));
