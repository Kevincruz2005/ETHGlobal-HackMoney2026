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
    const { playSound } = useSound();
    const paymentCountRef = useRef(0); // Track payment count for sound throttling

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

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && (hasSeasonPass || balance > 0)) {
            interval = setInterval(() => {
                // Season pass holders watch for free
                if (hasSeasonPass) {
                    addLog('STATE_UPDATE', '0.000000', 'SEASON_PASS::FREE_VIEW', {
                        from: 'SEASON_PASS',
                        to: 'CREATOR'
                    });
                    return;
                }

                const debit = ratePerSecond * (tickMs / 1000);
                setBalance(prev => {
                    const newBal = Math.max(0, prev - debit);
                    if (newBal === 0) {
                        setIsPlaying(false); // Auto-stop
                        return 0;
                    }
                    return newBal;
                });

                setTotalPaid(prev => prev + debit);

                // Simulate a "Signature" from the Yellow Network State Channel
                const mockSig = "0x" + Math.random().toString(16).slice(2, 10) + "...";
                addLog('STATE_UPDATE', debit.toFixed(6), mockSig);
                
                // Play payment confirmation sound every 5 seconds (5th payment)
                // to provide feedback without being annoying
                paymentCountRef.current += 1;
                if (paymentCountRef.current % 5 === 0) {
                    playSound('payment');
                }

            }, tickMs);
        }

        return () => clearInterval(interval);
    }, [addLog, balance, isPlaying, playSound, ratePerSecond, tickMs, hasSeasonPass]);

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
        setRatePerSecond,
        setTickMs,
        setMinBalance,
        setAutopilotEnabled,
        setRefillStatus,
        validateSeasonPass,
        startSession,
        stopSession,
        topUp,
        resetBalance
    };
}
