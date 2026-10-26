// AudioWorklet: reenvía el audio mono al hilo principal en bloques de ~100 ms.
// El audio solo vive en memoria; no se graba ni se envía a ningún servidor.
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(1600);
    this.length = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channels = input.length;
    const frames = input[0].length;
    for (let i = 0; i < frames; i++) {
      let sample = 0;
      for (let c = 0; c < channels; c++) sample += input[c][i];
      this.buffer[this.length++] = sample / channels;
      if (this.length === this.buffer.length) {
        this.port.postMessage(this.buffer);
        this.buffer = new Float32Array(1600);
        this.length = 0;
      }
    }
    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
