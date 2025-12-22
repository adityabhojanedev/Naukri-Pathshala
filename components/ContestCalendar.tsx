'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface ContestCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    highlightDates?: string[]; // ISO date strings
}

export default function ContestCalendar({ selectedDate, onDateSelect, highlightDates = [] }: ContestCalendarProps) {
    const [viewDate, setViewDate] = useState(selectedDate);

    useEffect(() => {
        setViewDate(selectedDate);
    }, [selectedDate]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onDateSelect(newDate);
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const hasEvent = highlightDates.some(d => new Date(d).toDateString() === date.toDateString());

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                        h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                        ${isSelected
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                        }
                        ${isToday && !isSelected ? 'border border-blue-500/50 text-blue-600 dark:text-blue-400' : ''}
                    `}
                >
                    {day}
                    {hasEvent && !isSelected && (
                        <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                    {hasEvent && isSelected && (
                        <div className="absolute bottom-1 w-1 h-1 bg-blue-200 rounded-full" />
                    )}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-500" />
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-center">
                <button
                    onClick={() => onDateSelect(new Date())}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Jump to Today
                </button>
            </div>
        </div>
    );
}
