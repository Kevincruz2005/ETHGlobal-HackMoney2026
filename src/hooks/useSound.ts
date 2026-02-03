"use client";

import { useCallback, useRef } from 'react';

type SoundType = 'payment' | 'topup' | 'start' | 'stop';

export function useSound() {
    const audioContextRef = useRef<AudioContext | null>(null);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
            const AudioCtx = window.AudioContext || w.webkitAudioContext;
            audioContextRef.current = new AudioCtx();
        }
        return audioContextRef.current;
    }, []);

    const playTone = useCallback((frequency: number, duration: number, type: 'sine' | 'square' = 'sine') => {
        try {
            const audioContext = getAudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // Fade in/out for smoother sound
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch {
            // Silently fail if audio context is not available (e.g., user hasn't interacted)
            // Audio may not be available until user interaction (browser autoplay policy)
        }
    }, [getAudioContext]);

    const playSound = useCallback((type: SoundType) => {
        switch (type) {
            case 'payment':
                // Short, high-pitched beep for payment confirmation
                playTone(800, 0.1, 'sine');
                break;
            case 'topup':
                // Success sound - ascending tones
                playTone(400, 0.15, 'sine');
                setTimeout(() => playTone(600, 0.15, 'sine'), 50);
                setTimeout(() => playTone(800, 0.2, 'sine'), 100);
                break;
            case 'start':
                // Low to high sweep for session start
                playTone(200, 0.2, 'sine');
                setTimeout(() => playTone(400, 0.2, 'sine'), 100);
                break;
            case 'stop':
                // High to low sweep for session stop
                playTone(400, 0.2, 'sine');
                setTimeout(() => playTone(200, 0.2, 'sine'), 100);
                break;
        }
    }, [playTone]);

    return { playSound };
}
