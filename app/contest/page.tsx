'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ContestCard from '@/components/ContestCard';
import { motion } from 'framer-motion';

interface Contest {
    _id: string;
    title: string;
    description: string;
    supportedLanguages: string[];
    startTime: string;
    duration: number;
    difficulty: string;
    category: string;
    status: string;
    slots: number;
    hasJoined?: boolean;
}

export default function ContestsListPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch('/api/contests', { headers })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setContests(data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            <Navbar />

            <main className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="pt-32 pb-12 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-6"
                    >
                        Explore & Join Contests
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Discover all upcoming and active challenges. Filter by category, difficulty, or date to find your perfect match.
                    </motion.p>
                </div>

                {/* Contests Grid */}
                <div className="pb-24">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[280px] bg-gray-100 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800" />
                            ))}
                        </div>
                    ) : contests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {contests.map((contest) => (
                                <ContestCard key={contest._id} contest={contest} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                            No active contests found. Check back later!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
