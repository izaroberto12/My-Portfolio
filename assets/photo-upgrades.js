/* Progressive artwork upgrades: show new photographs only after their assets
   exist on the published branch. Until then keep existing real imagery visible. */
(() => {
  "use strict";
  const preload = (path, onReady) => {
    if (!path) return;
    const request = new Image();
    request.decoding = "async";
    request.onload = () => onReady(path);
    request.onerror = () => {}; // No broken-image placeholders before upload.
    request.src = path;
  };
  document.querySelectorAll("img[data-upgrade-src]").forEach((img) => {
    const next = img.dataset.upgradeSrc;
    preload(next, () => {
      img.src = next;
      if (img.dataset.upgradeAlt) img.alt = img.dataset.upgradeAlt;
    });
  });
  document.querySelectorAll("img[data-photo-src]").forEach((img) => {
    const next = img.dataset.photoSrc;
    preload(next, () => {
      img.src = next;
      const panel = img.closest("[data-photo-panel]");
      if (panel) panel.hidden = false;
      const gallery = img.closest("[data-photo-gallery]");
      if (gallery) gallery.hidden = false;
    });
  });
})();
