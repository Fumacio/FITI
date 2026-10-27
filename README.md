# FITI — apoyo en pantalla para intérpretes médicos EN ⇄ ES

Durante una llamada, FITI escucha el audio de la llamada (proveedor y paciente),
transcribe cada intervención y muestra al lado su traducción automática:

| Hablante       | Original                                    | Traducción                                       |
| -------------- | ------------------------------------------- | ------------------------------------------------ |
| Proveedor (EN) | How long have you had the chest pain?       | ¿Cuánto tiempo hace que tiene dolor en el pecho? |
| Paciente (ES)  | Desde ayer en la noche, y me falta el aire. | Since last night, and I am short of breath.      |

Es una **herramienta de apoyo**: el intérprete sigue interpretando; la app solo
le ayuda con números, dosis, términos y frases que se pierden.

## ⚠️ Antes de usarla en llamadas reales

La mayoría de las agencias de interpretación médica **prohíben por contrato**
grabar, transcribir o usar herramientas de IA durante las llamadas, aunque el
procesamiento sea local. Esta app está diseñada para cumplir las normas
habituales (HIPAA, códigos NCIHC/IMIA), pero **eso no sustituye la autorización
de su empresa**. Pida permiso por escrito y comparta con su departamento de
cumplimiento la sección "Cómo protege la privacidad".

## Cómo protege la privacidad

| Medida | Dónde |
| --- | --- |
| Transcripción (Whisper) y traducción (MarianMT) **se ejecutan en el navegador**; el audio y el texto nunca salen del equipo | `src/worker.ts` |
| Bloqueo de red en tiempo de ejecución: solo se permiten los orígenes de la política (descarga de modelos) | `src/core/networkGuard.ts` |
| Nada se guarda: sin grabación, sin `localStorage`/IndexedDB, sin historial; el texto solo vive en memoria | `src/main.ts` |
| Borrado al terminar la llamada, tras X minutos de inactividad, al cerrar la pestaña y con <kbd>Esc</kbd> | `src/main.ts` |
| Máximo de intervenciones visibles; las antiguas se descartan | `privacy.maxEntriesOnScreen` |
| Sin copiar/arrastrar/imprimir; desenfoque si la ventana pierde el foco (p. ej. al compartir pantalla) | `src/styles.css`, `src/main.ts` |
| Enmascarado opcional de SSN, teléfonos y números largos (conserva 4 dígitos) | `src/core/redact.ts` |
| Confirmación obligatoria de la política antes de cada llamada (no se recuerda) | `acknowledgments` |
| Solo se captura el audio de la llamada, no la voz del intérprete | `src/audio/capture.ts` |
| Cabeceras CSP/no-store para producción | `vite.config.ts` |

## Glosario médico y protocolo de la empresa

- **Glosario EN ⇄ ES integrado** (~680 términos y siglas de uso médico: sistemas
  del cuerpo, síntomas, procedimientos, vacunas, personal, términos
  administrativos y siglas como NPO, PRN, CBC, COPD…). Los términos que aparecen
  en cada intervención se muestran debajo como etiquetas
  (`NPO → nada por vía oral`), y la pestaña **Glosario** permite buscar por sigla,
  inglés o español. Datos en `src/glossary/terms.ts`.
- **Glosario personal**: añada sus propios términos en `public/glossary.local.json`:
  `[{ "abbr": "ABG", "en": "arterial blood gas", "es": ["gasometría arterial"] }]`.
- **Protocolo**: la pestaña **Protocolo** muestra los recordatorios y guiones de
  la empresa (apertura, cierre, espera, intervenciones, mediación, dial-out,
  llamadas caídas, descalificación) en inglés y español, con su nombre e ID
  rellenados. Se cargan de `public/protocol.local.json`; si no existe, de
  `public/protocol.example.json` (genérico).
- **Temporizador de espera**: el botón *Espera* cuenta el tiempo, avisa de
  refrescar la línea en ambos idiomas cada 10 min y avisa al llegar al máximo
  (15 min), según el protocolo. *Reiniciar* cuando el proveedor vuelve y extiende.

> Los archivos `public/*.local.json` están en `.gitignore`: los guiones de la
> empresa suelen ser confidenciales y este repositorio es público.

## Configurar la política de la empresa

Edite `public/policy.json` (no hace falta recompilar). Todas las opciones y sus
valores por defecto están documentados en `src/core/policy.ts`. Las claves
desconocidas o con tipo incorrecto se ignoran.

Para un entorno **totalmente sin conexión**, ponga `"models": { "source": "local" }`,
copie los modelos a `public/models/` y los binarios de ONNX Runtime en la ruta
indicada en `models.wasmPath`. Así la app no hace ninguna conexión externa.

## Uso

```bash
npm install
npm run dev                        # desarrollo: http://localhost:5173
npm run build && npm run preview   # producción, con cabeceras de seguridad
npm test
```

Use **Chrome o Edge** de escritorio (WebGPU acelera mucho la transcripción).
La primera vez se descargan los modelos (~200 MB con `whisper-base`); después
quedan en la caché del navegador.

### Cómo llega el audio de la llamada

- **Softphone en el navegador o en el PC (Windows):** elija *Audio del sistema /
  pestaña de la llamada*, comparta la pestaña o la pantalla completa y marque
  **Compartir audio**.
- **macOS o app de escritorio:** instale un cable de audio virtual (BlackHole,
  VB-Cable), envíe ahí la salida del softphone y elíjalo en la lista de entradas.
- **Teléfono físico:** no hay forma fiable de capturar el audio sin un adaptador
  de hardware; no se recomienda.

### Durante la llamada

- La etiqueta de hablante se asigna por idioma (inglés → proveedor, español →
  paciente).
- La última intervención se resalta; la traducción es orientativa.
- <kbd>Esc</kbd> borra la pantalla al instante.

## Limitaciones conocidas

- Latencia: el texto aparece cuando el hablante hace una pausa (~1–3 s con GPU).
- `whisper-base` es rápido pero comete errores con nombres de medicamentos;
  `onnx-community/whisper-small` es más preciso si el equipo tiene GPU.
- La traducción MarianMT es literal; no conoce el contexto de la conversación.
- Solo navegadores Chromium; Firefox y Safari no permiten capturar el audio del
  sistema.
