"use client";

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

    // Buffer logs to avoid too many re-renders if we sped it up, 
    // but for 1s interval direct state update is fine.

    const startSession = () => {
        setBalance(5.0000); // Demo Money
        setIsPlaying(true);
        addLog('init', '5.0000', '0xINIT_SESSION_' + uuidv4().slice(0, 8));
    };

    const stopSession = () => {
        setIsPlaying(false);
    };

    const addLog = (type: StreamLog['type'], amount: string, signature: string) => {
        const newLog: StreamLog = {
            id: uuidv4(),
            timestamp: Date.now(),
            type,
            amount,
            signature
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
    };

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

            }, 1000); // 1 second intervals for "Matrix" feel
        } else if (balance <= 0 && isPlaying) {
            setIsPlaying(false);
        }

        return () => clearInterval(interval);
    }, [isPlaying, balance]);

    return {
        balance,
        logs,
        isPlaying,
        totalPaid,
        startSession,
        stopSession
    };
}
