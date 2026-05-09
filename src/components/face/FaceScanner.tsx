'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { preloadFaceModels } from '@/lib/face/preload';
import { Button } from '@/components/ui/button';

/** Smaller = faster first inference; must be multiple of 32 (tiny_yolov2). */
const DETECTOR_INPUT = 320;

type FaceScannerProps = {
  /** Number of captures required (1 = login, 2–5 = enroll). */
  sampleTarget: number;
  onComplete: (descriptors: number[][]) => void;
  disabled?: boolean;
  /** Overrides the progress line under the video (default: “Captured: x / y”). */
  progressHint?: string;
};

export function FaceScanner({
  sampleTarget,
  onComplete,
  disabled,
  progressHint,
}: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const warmupRanRef = useRef(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [collected, setCollected] = useState<number[][]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    preloadFaceModels()
      .then(() => {
        if (!cancelled) setModelsReady(true);
      })
      .catch(() => {
        if (!cancelled) setModelError('Could not load face models. Check your connection.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!modelsReady || disabled) return;
    const video = videoRef.current;
    if (!video) return;

    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        video.srcObject = stream;
        await video.play();
        setCameraError(null);
      } catch {
        setCameraError('Camera permission is required for face capture.');
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    };
  }, [modelsReady, disabled]);

  /** Compile TF.js kernels before user taps Capture (removes ~multi‑second first-hit stall). */
  useEffect(() => {
    if (!modelsReady || disabled || warmupRanRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    const runWarmup = async () => {
      if (warmupRanRef.current || !video.videoWidth) return;
      warmupRanRef.current = true;
      try {
        await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: DETECTOR_INPUT,
              scoreThreshold: 0.5,
            }),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();
      } catch {
        /* ignore — user may not be in frame yet */
      }
    };

    const schedule = () => {
      requestAnimationFrame(() => requestAnimationFrame(runWarmup));
    };

    video.addEventListener('loadeddata', schedule);
    if (video.readyState >= 2) schedule();

    return () => video.removeEventListener('loadeddata', schedule);
  }, [modelsReady, disabled]);

  const captureOnce = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !modelsReady || busy || disabled) return;
    setBusy(true);
    setHint(null);
    try {
      const det = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: DETECTOR_INPUT,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!det) {
        setHint('No face detected. Face the camera and try again.');
        return;
      }
      const arr = Array.from(det.descriptor) as number[];
      setCollected((prev) => [...prev, arr]);
    } finally {
      setBusy(false);
    }
  }, [modelsReady, busy, disabled]);

  useEffect(() => {
    if (collected.length === sampleTarget && sampleTarget > 0) {
      onCompleteRef.current(collected);
      setCollected([]);
    }
  }, [collected, sampleTarget]);

  if (modelError) {
    return <p className="text-sm text-red-600">{modelError}</p>;
  }

  return (
    <div className="space-y-3">
      {!modelsReady && <p className="text-sm text-gray-600">Loading face models…</p>}
      <div className="relative overflow-hidden rounded-xl border-2 border-orange-200 bg-black/80">
        <video
          ref={videoRef}
          className="mx-auto max-h-[280px] w-full object-cover [transform:scaleX(-1)]"
          autoPlay
          muted
          playsInline
        />
      </div>
      {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}
      {hint && <p className="text-sm text-amber-800">{hint}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          {progressHint ?? `Captured: ${collected.length} / ${sampleTarget}`}
        </p>
        <Button
          type="button"
          className="bg-orange-600 hover:bg-orange-700"
          disabled={!modelsReady || !!cameraError || busy || disabled}
          onClick={() => {
            void captureOnce();
          }}
        >
          {busy ? 'Capturing…' : 'Capture'}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Uses on-device models (face-api.js). For demo only — no liveness check; photos may fool this.
      </p>
    </div>
  );
}
