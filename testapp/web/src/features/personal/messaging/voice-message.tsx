'use client';
import { useEffect, useRef, useState } from 'react';
import * as copy from '@/content/fa';
import { Pause, Play } from './messenger-icons';
import s from './media.module.css';

/** Bins contain actual decoded or microphone samples, never a random decorative recording. */
export function samplePeaks(samples: Float32Array, count = 36) {
  if (!samples.length || count < 1) return [];
  return Array.from({ length: count }, (_, bin) => {
    const start = Math.floor((bin * samples.length) / count);
    const end = Math.max(start + 1, Math.floor(((bin + 1) * samples.length) / count));
    let peak = 0;
    for (let i = start; i < end && i < samples.length; i++)
      peak = Math.max(peak, Math.abs(samples[i]));
    return Math.min(1, peak);
  });
}
export function VoiceWaveform({ samples, progress = 0 }: { samples: number[]; progress?: number }) {
  return (
    <svg className={s.waveform} viewBox="0 0 144 32" preserveAspectRatio="none" aria-hidden="true">
      {samples.length ? (
        samples.map((value, i) => (
          <line
            key={i}
            x1={((i + 0.5) * 144) / samples.length}
            x2={((i + 0.5) * 144) / samples.length}
            y1={16 - Math.max(1, value * 14)}
            y2={16 + Math.max(1, value * 14)}
            stroke="currentColor"
            strokeWidth="2"
            opacity={i / samples.length <= progress ? 1 : 0.4}
          />
        ))
      ) : (
        <line x1="0" y1="16" x2="144" y2="16" stroke="currentColor" strokeWidth="1" opacity=".4" />
      )}
    </svg>
  );
}
function time(seconds: number) {
  return Number.isFinite(seconds)
    ? Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0')
    : '0:00';
}
export function VoicePlayer({ url, label }: { url: string; label: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    void (async () => {
      try {
        const data = await (await fetch(url, { signal: controller.signal })).arrayBuffer();
        const decoder = new OfflineAudioContext(1, 1, 44100);
        const decoded = await decoder.decodeAudioData(data);
        if (alive) {
          setSamples(samplePeaks(decoded.getChannelData(0)));
          setDuration(decoded.duration);
        }
      } catch {
        /* Native audio can still play when the waveform decoder is unavailable. */
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [url]);
  return (
    <div className={s.voicePlayer} data-voice-player>
      <audio
        ref={audio}
        src={url}
        preload="metadata"
        aria-label={label}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value)) setDuration(value);
        }}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value)) setDuration(value);
        }}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError(true);
        }}
      />
      <button
        type="button"
        aria-label={playing ? copy.messengerPdf.voicePause : copy.messengerPdf.voicePlay}
        onClick={() => {
          if (!audio.current) return;
          if (playing) audio.current.pause();
          else void audio.current.play().catch(() => setError(true));
        }}
      >
        {playing ? <Pause /> : <Play />}
      </button>
      <div className={s.voiceTrack}>
        <VoiceWaveform samples={samples} progress={duration ? position / duration : 0} />
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={Math.min(position, duration || 1)}
          step="0.01"
          aria-label={copy.messengerPdf.voiceProgress}
          disabled={!duration}
          onChange={(event) => {
            if (audio.current) {
              audio.current.currentTime = Number(event.target.value);
              setPosition(Number(event.target.value));
            }
          }}
        />
      </div>
      <time dir="ltr">{time(playing ? position : duration)}</time>
      {error && (
        <span role="alert" className={s.itemError}>
          {copy.text_5f11ce92fa61}
        </span>
      )}
    </div>
  );
}

export function LiveVoiceWaveform({ stream }: { stream: MediaStream | null }) {
  const [samples, setSamples] = useState<number[]>([]);
  useEffect(() => {
    if (!stream || !(stream instanceof MediaStream)) return;
    let context: AudioContext | undefined,
      frame = 0;
    try {
      context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      const tick = () => {
        analyser.getFloatTimeDomainData(data);
        setSamples(samplePeaks(data));
        frame = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* Recording remains possible when a browser does not expose an analyser. */
    }
    return () => {
      cancelAnimationFrame(frame);
      void context?.close();
    };
  }, [stream]);
  return <VoiceWaveform samples={samples} />;
}
