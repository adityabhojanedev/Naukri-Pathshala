'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string | Date;
    onComplete?: () => void;
}

export default function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isComplete: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: false });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                if (!timeLeft.isComplete) {
                    if (onComplete) onComplete();
                    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
                }
                return timeLeft;
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isComplete: false
            };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newState = calculateTimeLeft();
            setTimeLeft(newState);
            if (newState.isComplete) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    if (timeLeft.isComplete) {
        return (
            <span className="font-mono text-medium font-bold text-red-600 animate-blink">
                00:00:00
            </span>
        );
    }

    // Determine color based on urgency (e.g., < 1 hour = red/orange)
    const isUrgent = timeLeft.days === 0 && timeLeft.hours < 1;
    const colorClass = isUrgent ? 'text-orange-600' : 'text-blue-600 dark:text-blue-400';

    return (
        <span className={`font-mono font-bold ${colorClass}`}>
            {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
            {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
    );
}
