"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSound } from './useSound';

export interface StreamLog {
    id: string;
    timestamp: number;
    type: 'STATE_UPDATE' | 'settle' | 'init';
    amount: string;
    signature: string;
    from?: string;
    to?: string;
}

export function useStreamSession() {
    const [balance, setBalance] = useState(1.0000); // Start with demo money
    const [logs, setLogs] = useState<StreamLog[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [totalPaid, setTotalPaid] = useState(0.0000);
    const [ratePerSecond, setRatePerSecond] = useState(0.0001);
    const [tickMs, setTickMs] = useState(1000);
    const [minBalance, setMinBalance] = useState(2.0);
    const [autopilotEnabled, setAutopilotEnabled] = useState(false);
    const [refillStatus, setRefillStatus] = useState<'idle' | 'prompting' | 'bridging' | 'credited' | 'failed'>('idle');
    const [hasSeasonPass, setHasSeasonPass] = useState(false);
    const [watchedSegments, setWatchedSegments] = useState<[number, number][]>([]); // Track watched time ranges
    const [selectedQuality, setSelectedQuality] = useState<'480p' | '720p' | '1080p' | '4k'>('720p');
    const { playSound } = useSound();
    const paymentCountRef = useRef(0); // Track payment count for sound throttling
    const lastChargedSecondRef = useRef(-1); // Track last charged second to avoid double-charging

    // Quality pricing multipliers
    const qualityMultipliers = {
        '480p': 0.5,
        '720p': 1.0,
        '1080p': 2.0,
        '4k': 4.0
    };

    // Buffer logs to avoid too many re-renders if we sped it up, 
    // but for 1s interval direct state update is fine.

    const addLog = useCallback((type: StreamLog['type'], amount: string, signature: string, meta?: Pick<StreamLog, 'from' | 'to'>) => {
        const newLog: StreamLog = {
            id: uuidv4(),
            timestamp: Date.now(),
            type,
            amount,
            signature,
            ...meta
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
    }, []);

    const startSession = useCallback(() => {
        if (balance <= 0) {
            setBalance(5.0000); // Add demo money if balance is 0
        }
        setIsPlaying(true);
        paymentCountRef.current = 0; // Reset payment counter
        addLog('init', balance > 0 ? balance.toFixed(4) : '5.0000', '0xINIT_SESSION_' + uuidv4().slice(0, 8));
        playSound('start');
    }, [addLog, playSound, balance]);

    const stopSession = useCallback(() => {
        setIsPlaying(false);
        playSound('stop');
    }, [playSound]);

    // Check if a specific second has been watched (paid for)
    const isSecondWatched = useCallback((second: number) => {
        return watchedSegments.some(([start, end]) => second >= start && second <= end);
    }, [watchedSegments]);

    // Add a second to watched segments (merge adjacent ranges)
    const addWatchedSecond = useCallback((second: number) => {
        setWatchedSegments(prev => {
            // Check if already watched
            if (prev.some(([start, end]) => second >= start && second <= end)) {
                return prev;
            }

            // Find adjacent or overlapping segments to merge
            const newSegments: [number, number][] = [];
            let merged = false;
            let newSegment: [number, number] = [second, second];

            for (const [start, end] of prev) {
                if (second === end + 1) {
                    // Extends existing segment forward
                    newSegment = [start, second];
                    merged = true;
                } else if (second === start - 1) {
                    // Extends existing segment backward
                    newSegment = [second, end];
                    merged = true;
                } else if (second >= start && second <= end) {
                    // Already contained (shouldn't happen due to check above)
                    return prev;
                } else {
                    newSegments.push([start, end]);
                }
            }

            newSegments.push(newSegment);
            return newSegments.sort((a, b) => a[0] - b[0]);
        });
    }, []);

    // Handle video tick - called from VideoPlayer on time update
    const onVideoTick = useCallback((currentTime: number) => {
        if (!isPlaying || hasSeasonPass) return;

        const currentSecond = Math.floor(currentTime);

        // Avoid double-charging the same second
        if (currentSecond === lastChargedSecondRef.current) return;

        // Only charge if this second hasn't been watched before
        if (!isSecondWatched(currentSecond)) {
            // Apply quality multiplier to base rate
            const effectiveRate = ratePerSecond * qualityMultipliers[selectedQuality];
            const debit = effectiveRate;

            setBalance(prev => {
                const newBal = Math.max(0, prev - debit);
                if (newBal === 0) {
                    setIsPlaying(false); // Auto-stop when balance runs out
                    return 0;
                }
                return newBal;
            });

            setTotalPaid(prev => prev + debit);
            addWatchedSecond(currentSecond);
            lastChargedSecondRef.current = currentSecond;

            // Simulate a "Signature" from the Yellow Network State Channel
            const mockSig = "0x" + Math.random().toString(16).slice(2, 10) + "...";
            addLog('STATE_UPDATE', debit.toFixed(6), mockSig);

            // Play payment confirmation sound every 5 payments
            paymentCountRef.current += 1;
            if (paymentCountRef.current % 5 === 0) {
                playSound('payment');
            }
        }
    }, [isPlaying, hasSeasonPass, isSecondWatched, addWatchedSecond, ratePerSecond, selectedQuality, qualityMultipliers, addLog, playSound]);

    const topUp = useCallback((amount: number) => {
        setBalance(prev => Math.max(0, prev + amount));
        addLog('init', amount.toFixed(4), '0xTOPUP_' + uuidv4().slice(0, 8));
        playSound('topup');
    }, [addLog, playSound]);

    const resetBalance = useCallback(() => {
        setBalance(0);
        setIsPlaying(false);
        addLog('init', '0.0000', 'SESSION_RESET_' + uuidv4().slice(0, 8));
    }, [addLog]);

    const validateSeasonPass = useCallback((buyerEnsName?: string, seasonPassDomain?: string) => {
        if (!buyerEnsName || !seasonPassDomain) {
            setHasSeasonPass(false);
            return;
        }

        // Check if buyer ENS name matches season pass pattern
        const hasPass = buyerEnsName.endsWith(seasonPassDomain) || buyerEnsName === seasonPassDomain;
        setHasSeasonPass(hasPass);

        if (hasPass) {
            addLog('init', '0.0000', 'SEASON_PASS::VALIDATED', {
                from: 'SYSTEM',
                to: buyerEnsName
            });
        }
    }, [addLog]);

    // Calculate total watched seconds
    const getTotalWatchedSeconds = useCallback(() => {
        return watchedSegments.reduce((total, [start, end]) => {
            return total + (end - start + 1);
        }, 0);
    }, [watchedSegments]);

    // Get effective rate with quality multiplier
    const getEffectiveRate = useCallback(() => {
        return ratePerSecond * qualityMultipliers[selectedQuality];
    }, [ratePerSecond, selectedQuality, qualityMultipliers]);

    return {
        balance,
        logs,
        isPlaying,
        totalPaid,
        ratePerSecond,
        tickMs,
        minBalance,
        autopilotEnabled,
        refillStatus,
        hasSeasonPass,
        watchedSegments,
        selectedQuality,
        setRatePerSecond,
        setTickMs,
        setMinBalance,
        setAutopilotEnabled,
        setRefillStatus,
        setSelectedQuality,
        validateSeasonPass,
        startSession,
        stopSession,
        topUp,
        resetBalance,
        onVideoTick, // callback for video time updates
        isSecondWatched, // check if second is already paid for
        getTotalWatchedSeconds, // get total seconds watched
        getEffectiveRate // get rate with quality multiplier
    };
}
