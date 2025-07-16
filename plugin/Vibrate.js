const vibrate = function(pattern = 50 || [50]) {
    const isNumber = typeof pattern === 'number';
    const isArrayNumber = Array.isArray(pattern) && pattern.every(n => typeof n === 'number');

    // Deteksi tipe kesalahan
    if (!isNumber && !isArrayNumber) {
      let typeInfo = typeof pattern;

      // Jika array tapi ada elemen bukan number
      if (Array.isArray(pattern)) {
        const invalids = pattern.filter(n => typeof n !== 'number');
        typeInfo = `Array dengan elemen tidak valid: [${invalids.map(v => `"${v}" (${typeof v})`).join(', ')}]`;
      }

      // Bangun pesan error spesifik
      const message = `[TypeError]: Parameter "pattern" tidak valid.\n` +
                      `Diterima: ${JSON.stringify(pattern)}\n` +
                      `Tipe: ${typeInfo}\n` +
                      `Yang diizinkan: Number atau Array of Number`;

      throw new TypeError(message);
    }

    // Eksekusi jika valid
    if (navigator.vibrate) {
    
      return navigator.vibrate(pattern);
    } else {
      console.warn("Vibration API tidak didukung di browser ini.");
      return false;
    }
  }
  
export default vibrate


 