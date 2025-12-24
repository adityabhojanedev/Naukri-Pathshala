'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ContestCard from '@/components/ContestCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Filter, X, Grid, ListFilter } from 'lucide-react';

interface Contest {
    _id: string;
    title: string;
    description: string;
    supportedLanguages: string[];
    startTime: string;
    endTime: string;
    duration: number;
    difficulty: string;
    category: string;
    status: string;
    slots: number;
    strictMode?: boolean;
    hasJoined?: boolean;
}

export default function ContestsListPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedType, setSelectedType] = useState<'All' | 'Full' | 'Mini'>('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchContests = async () => {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            try {
                const res = await fetch('/api/contests', { headers });
                const data = await res.json();
                if (data.success) {
                    setContests(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    // Derived Data
    const categories = useMemo(() => {
        const cats = new Set(contests.map(c => c.category));
        return ['All', ...Array.from(cats)];
    }, [contests]);

    const filteredContests = useMemo(() => {
        return contests.filter(contest => {
            // Search
            const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contest.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Category
            const matchesCategory = selectedCategory === 'All' || contest.category === selectedCategory;

            // Type (Full/Mini/All) - Assuming strictMode distinguishes Full vs Mini
            const matchesType = selectedType === 'All' ||
                (selectedType === 'Full' && contest.strictMode) ||
                (selectedType === 'Mini' && !contest.strictMode);

            // Date
            let matchesDate = true;
            if (selectedDate) {
                const contestDate = new Date(contest.startTime).toISOString().split('T')[0];
                matchesDate = contestDate === selectedDate;
            }

            return matchesSearch && matchesCategory && matchesType && matchesDate;
        });
    }, [contests, searchQuery, selectedCategory, selectedType, selectedDate]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 md:px-6">
                {/* Header & Search Section */}
                <div className="pt-28 pb-8">
                    <div className="text-center mb-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                        >
                            Explore Contests
                        </motion.h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            Join high-quality mock tests and practice challenges to boost your preparation.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 sticky top-24 z-30 max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by title or keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 transition-all font-medium"
                                />
                            </div>

                            {/* Filters Toggle (Mobile) & Actions */}
                            <div className="flex gap-2">
                                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                                    {['All', 'Full', 'Mini'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type as any)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedType === type
                                                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            {type === 'Full' ? 'Full Mocks' : type === 'Mini' ? 'Mini Tests' : 'All'}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-3 rounded-xl border flex items-center justify-center transition-all ${showFilters
                                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400'
                                        }`}
                                    title="More Filters"
                                >
                                    <ListFilter size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Extended Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 mt-2 border-t border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row gap-6">
                                        {/* Category Filter */}
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block">Category</label>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${selectedCategory === cat
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                                                            }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Date Filter */}
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block">By Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                                {selectedDate && (
                                                    <button
                                                        onClick={() => setSelectedDate('')}
                                                        className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Contests Grid */}
                <div className="pb-24 max-w-6xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[280px] bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800" />
                            ))}
                        </div>
                    ) : filteredContests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {filteredContests.map((contest) => (
                                <ContestCard key={contest._id} contest={{ ...contest, hasJoined: !!contest.hasJoined }} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No contests found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedType('All'); setSelectedDate('') }}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
