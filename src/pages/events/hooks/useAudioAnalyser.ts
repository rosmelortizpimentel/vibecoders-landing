import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioAnalyser(audioUrl: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(32));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  const setup = useCallback(() => {
    if (!audioUrl || audioRef.current) return;
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => setIsPlaying(false));
  }, [audioUrl]);

  useEffect(() => {
    setup();
    return () => {
      cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
      ctxRef.current?.close();
    };
  }, [setup]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      tick();
    }
  }, [isPlaying]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    const analyser = analyserRef.current;
    if (!audio || !analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / data.length / 255;

    setVolume(avg);
    setFrequencies(data);
    setProgress(audio.currentTime);

    if (!audio.paused) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  return { isPlaying, progress, duration, volume, frequencies, togglePlay, seek };
}
