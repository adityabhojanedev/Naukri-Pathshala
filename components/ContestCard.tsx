'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, ArrowRight, Zap, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface Contest {
    _id: string;
    title: string;
    description: string;
    supportedLanguages: string[];
    startTime: string;
    endTime: string; // Added for dynamic status
    duration: number;
    difficulty: string;
    category: string;
    status: string;
    slots: number;
    hasJoined?: boolean;
}

export default function ContestCard({ contest }: { contest: Contest }) {
    const router = useRouter();
    const [joining, setJoining] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'success' | 'info';
        confirmText: string;
        cancelText: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => { }
    });

    const executeJoin = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setJoining(true);
        try {
            const res = await fetch(`/api/contest/${contest._id}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.status === 403 && data.error === 'User is not verified') {
                // Show Verification Required Modal with animation
                setModalConfig({
                    isOpen: true,
                    title: 'Verification Required',
                    message: 'You need to be a verified user to join contests. Please complete your profile verification to proceed.',
                    type: 'warning',
                    confirmText: 'Got it',
                    cancelText: '',
                    onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                });
                return;
            }

            if (res.status === 400 && data.error === 'Contest is full') {
                setModalConfig({
                    isOpen: true,
                    title: 'Contest Full',
                    message: 'This contest has reached its maximum capacity. Please check back later or join another contest.',
                    type: 'info',
                    confirmText: 'Browse Others',
                    cancelText: '',
                    onConfirm: () => {
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                        router.refresh(); // Optional: refresh to update slots if needed
                    }
                });
                return;
            }

            if (data.success) {
                router.push('/profile');
            } else {
                alert(data.error || 'Failed to join contest');
            }
        } catch (error) {
            console.error('Join error:', error);
            alert('Something went wrong');
        } finally {
            setJoining(false);
        }
    };

    const handleJoinClick = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Always show confirmation first
        setModalConfig({
            isOpen: true,
            title: 'Confirm Participation',
            message: 'Are you sure you want to join this contest? Failure to attend after joining may result in a penalty on your profile.',
            type: 'info',
            confirmText: 'Yes, Join',
            cancelText: 'Cancel',
            onConfirm: executeJoin
        });
    };

    // Removed old isLive calculation


    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    const isLive = start <= now && end > now;
    const isCompleted = end <= now;
    const isUpcoming = start > now;

    // Derived status for display
    const displayStatus = isLive ? 'Live' : (isCompleted ? 'Completed' : 'Upcoming');

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
                {/* Gradient Line */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${isLive
                    ? 'from-red-500 to-orange-500'
                    : isCompleted
                        ? 'from-gray-400 to-gray-500'
                        : 'from-blue-500 to-indigo-500'
                    }`} />

                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${isLive
                                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800 animate-pulse'
                                : isCompleted
                                    ? 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 border border-gray-200 dark:border-zinc-700'
                                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                                }`}>
                                {isLive && <><Zap size={12} fill="currentColor" /> Live Now</>}
                                {isCompleted && 'Completed'}
                                {isUpcoming && 'Upcoming'}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {contest.title}
                            </h3>
                        </div>
                        <div className="text-center bg-gray-50 dark:bg-zinc-800 rounded-lg p-2 border border-gray-100 dark:border-zinc-700 min-w-[60px]">
                            <span className="block text-xs text-gray-400 font-medium uppercase">Slots</span>
                            <span className="block text-lg font-bold text-gray-900 dark:text-white">{contest.slots}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {contest.description}
                    </p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-y-2 md:gap-y-3 gap-x-4 mb-4 md:mb-6 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="md:w-4 md:h-4 text-gray-400" />
                            <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="md:w-4 md:h-4 text-gray-400" />
                            <span>{contest.duration} mins</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy size={14} className="md:w-4 md:h-4 text-yellow-500" />
                            <span>{contest.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 border-gray-300 dark:border-zinc-600 flex items-center justify-center text-[8px] md:text-[10px] font-bold">C</span>
                            <span>{contest.category}</span>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Languages:</span>
                        <div className="flex gap-1.5">
                            {contest.supportedLanguages?.map(lang => (
                                <span key={lang} className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase rounded-md border border-gray-200 dark:border-zinc-700">
                                    {lang}
                                </span>
                            )) || <span className="text-xs text-gray-400">EN</span>}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleJoinClick}
                        disabled={joining || contest.hasJoined}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300
                        ${contest.hasJoined
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                                : 'bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none'
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {contest.hasJoined ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Joined
                            </>
                        ) : (
                            isCompleted ? 'View Results' : (joining ? 'Joining...' : (isLive ? 'Join Contest' : 'Register Now'))
                        )}
                        {!contest.hasJoined && !joining && <ArrowRight size={18} />}
                    </button>
                </div>
            </motion.div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />
        </>
    );
}
