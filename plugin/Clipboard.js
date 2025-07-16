// Pastikan namespace aman
window.IcodexEditor = window.IcodexEditor || {};
IcodexEditor.plugins = IcodexEditor.plugins || {};

/**
 * Plugin clipboard: mendukung copy objek dan string ke clipboard
 */
IcodexEditor.plugins.clipboard = {
  /**
   * Menyalin objek atau string ke clipboard
   * @param {Object|string} data
   */
  copy(data) {
    const text = typeof data === 'string'
      ? data
      : JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('[Clipboard] Tersalin ke clipboard:', text);
      })
      .catch((err) => {
        console.error('[Clipboard] Gagal menyalin:', err);
      });
  },

  /**
   * Membaca teks dari clipboard dan mencoba parsing JSON
   * @returns {Promise<Object|string|null>}
   */
  async paste() {
    try {
      const text = await navigator.clipboard.readText();

      try {
        const parsed = JSON.parse(text);
        console.log('[Clipboard] Teks di-parse sebagai objek:', parsed);
        return parsed;
      } catch {
        console.log('[Clipboard] Teks biasa ditempel:', text);
        return text;
      }
    } catch (err) {
      console.error('[Clipboard] Gagal membaca clipboard:', err);
      return null;
    }
  }
};
