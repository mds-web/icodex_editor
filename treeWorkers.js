self.onmessage = (event) => {
  const data = event.data;
  if (!Array.isArray(data)) {
    self.postMessage({ 
      type: "log", 
      message: "Data bukan array, worker dibatalkan.", 
      data 
    });
    return;
  }

  self.postMessage({ 
    type: "log", 
    message: "Menerima data", 
    data 
  });

  const structured = data.map(item => ({
    ...item,
    processed: true
  }));
console.log(structured)
  self.postMessage({ type: "result", data: structured });
};
