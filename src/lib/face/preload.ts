import * as faceapi from 'face-api.js';
import { FACE_API_MODEL_URL } from '@/lib/face/model-url';

/** Single shared load — register/login can call early so first Capture feels instant. */
let modelsPromise: Promise<void> | null = null;

export function preloadFaceModels(): Promise<void> {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_MODEL_URL),
    ]).then(() => undefined);
  }
  return modelsPromise;
}
