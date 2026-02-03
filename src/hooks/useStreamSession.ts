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
}

export function useStreamSession() {
    const [balance, setBalance] = useState(0.0000);
    const [logs, setLogs] = useState<StreamLog[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [totalPaid, setTotalPaid] = useState(0.0000);
    const { playSound } = useSound();
    const paymentCountRef = useRef(0); // Track payment count for sound throttling

    // Buffer logs to avoid too many re-renders if we sped it up, 
    // but for 1s interval direct state update is fine.

    const addLog = useCallback((type: StreamLog['type'], amount: string, signature: string) => {
        const newLog: StreamLog = {
            id: uuidv4(),
            timestamp: Date.now(),
            type,
            amount,
            signature
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
    }, []);

    const startSession = useCallback(() => {
        setBalance(5.0000); // Demo Money
        setIsPlaying(true);
        paymentCountRef.current = 0; // Reset payment counter
        addLog('init', '5.0000', '0xINIT_SESSION_' + uuidv4().slice(0, 8));
        playSound('start');
    }, [addLog, playSound]);

    const stopSession = useCallback(() => {
        setIsPlaying(false);
        playSound('stop');
    }, [playSound]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && balance > 0) {
            interval = setInterval(() => {
                setBalance(prev => {
                    const newBal = Math.max(0, prev - 0.0001);
                    if (newBal === 0) {
                        setIsPlaying(false); // Auto-stop
                        return 0;
                    }
                    return newBal;
                });

                setTotalPaid(prev => prev + 0.0001);

                // Simulate a "Signature" from the Yellow Network State Channel
                const mockSig = "0x" + Math.random().toString(16).slice(2, 10) + "...";
                addLog('STATE_UPDATE', '0.0001', mockSig);
                
                // Play payment confirmation sound every 5 seconds (5th payment)
                // to provide feedback without being annoying
                paymentCountRef.current += 1;
                if (paymentCountRef.current % 5 === 0) {
                    playSound('payment');
                }

            }, 1000); // 1 second intervals for "Matrix" feel
        }

        return () => clearInterval(interval);
    }, [addLog, balance, isPlaying, playSound]);

    const topUp = useCallback((amount: number) => {
        setBalance(prev => prev + amount);
        addLog('init', amount.toFixed(4), '0xTOPUP_' + uuidv4().slice(0, 8));
        playSound('topup');
    }, [addLog, playSound]);

    return {
        balance,
        logs,
        isPlaying,
        totalPaid,
        startSession,
        stopSession,
        topUp
    };
}
