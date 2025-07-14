self.onmessage = async (event) => {
  const { file, path } = event.data;

  try {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = new Uint8Array(reader.result);
      self.postMessage({
        type: 'file-read',
        result: {
          name: file.name,
          type: file.type,
          path,
          content: buffer
        }
      });
    };

    reader.onerror = (e) => {
      self.postMessage({ type: 'error', error: e.message });
    };

    reader.readAsArrayBuffer(file);
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};
