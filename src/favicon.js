/**
 * Pushes a 32x32 canvas frame into the browser tab's favicon, and exposes the
 * same PNG data URL so the mobile "tab preview" can show the identical image.
 *
 * One <link rel="icon"> is created once and its href is swapped. This is the
 * technique that makes a live game appear in the tab in Chrome, Edge & Safari.
 * (Mobile browsers hide tab icons - hence the on-page preview.)
 */

let link = null;

/** @returns {HTMLLinkElement} the single favicon link element. */
function faviconLink() {
  if (link) return link;
  link = /** @type {HTMLLinkElement} */ (
    document.querySelector('link[rel~="icon"]') || document.createElement('link')
  );
  link.rel = 'icon';
  link.type = 'image/png';
  link.setAttribute('sizes', '32x32');
  if (!link.isConnected) document.head.appendChild(link);
  return link;
}

/**
 * Encode the canvas once and apply it to the tab icon.
 * @param {HTMLCanvasElement} canvas The FIELD-sized game canvas.
 * @returns {string} the PNG data URL (reused by the mobile preview).
 */
export function setFavicon(canvas) {
  const url = canvas.toDataURL('image/png');
  faviconLink().href = url;
  return url;
}
