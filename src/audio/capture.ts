/**
 * Captura del audio de la llamada.
 *
 * - "system": audio del sistema o de una pestaña (getDisplayMedia). Sirve
 *   cuando la llamada entra por un softphone en el navegador o en el PC. Así
 *   se captura solo lo que dicen el proveedor y el paciente, no la voz del
 *   intérprete.
 * - "device": un dispositivo de entrada concreto, p. ej. un cable de audio
 *   virtual (VB-Cable, BlackHole) que recibe la salida del softphone.
 */
export const TARGET_SAMPLE_RATE = 16000;

export type CaptureSource = { kind: 'system' } | { kind: 'device'; deviceId: string };

export interface CaptureHandle {
  stop(): void;
}

export async function listInputDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'audioinput');
}

export async function startCapture(
  source: CaptureSource,
  onAudio: (chunk: Float32Array) => void,
  onEnded: () => void,
): Promise<CaptureHandle> {
  const stream = await openStream(source);
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error(
      'No se recibió audio. Al compartir, elija la pestaña o pantalla de la llamada y active "Compartir audio".',
    );
  }
  // Solo nos interesa el audio; el vídeo de la pantalla se descarta al instante.
  stream.getVideoTracks().forEach((t) => t.stop());
  audioTracks.forEach((t) => t.addEventListener('ended', onEnded));

  // Chrome/Edge remuestrean automáticamente a 16 kHz, la frecuencia de Whisper.
  const context = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
  await context.audioWorklet.addModule(`${import.meta.env.BASE_URL}recorder-worklet.js`);
  const sourceNode = context.createMediaStreamSource(new MediaStream(audioTracks));
  const worklet = new AudioWorkletNode(context, 'recorder-processor');
  worklet.port.onmessage = (e: MessageEvent<Float32Array>) => onAudio(e.data);
  sourceNode.connect(worklet);
  // No conectamos a context.destination: la app no reproduce el audio.

  return {
    stop() {
      worklet.port.onmessage = null;
      sourceNode.disconnect();
      worklet.disconnect();
      audioTracks.forEach((t) => t.stop());
      void context.close();
    },
  };
}

async function openStream(source: CaptureSource): Promise<MediaStream> {
  const raw: MediaTrackConstraints = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
  if (source.kind === 'device') {
    return navigator.mediaDevices.getUserMedia({
      audio: { ...raw, deviceId: { exact: source.deviceId } },
    });
  }
  return navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: raw,
    // Opciones de Chrome para ofrecer audio del sistema y no capturar la propia app.
    systemAudio: 'include',
    selfBrowserSurface: 'exclude',
  } as DisplayMediaStreamOptions);
}
