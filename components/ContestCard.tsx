'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, ArrowRight, Zap, Shield, CheckCircle, Lock, BookOpen, Users, List, Play, AlertTriangle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import CountdownTimer from '@/components/ui/CountdownTimer';

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
    hasJoined?: boolean;
    strictMode?: boolean;
    questions?: any[];
    marksPerQuestion?: number;
    negativeMarking?: number;
    submitWindow?: number;
}

export default function ContestCard({ contest }: { contest: Contest }) {
    const router = useRouter();
    const [joining, setJoining] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string | React.ReactNode;
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

    const handleJoinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const isFullTest = contest.duration > 60;

        // Extract Unique Subjects for Syllabus
        const subjects = Array.from(new Set(contest.questions?.map(q => q.subject || 'General') || []));
        const syllabusText = subjects.length > 0 ? subjects.join(', ') : 'Comprehensive Syllabus';

        const strictRules = (
            <div className="text-left bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl mt-2 text-sm border border-gray-100 dark:border-zinc-700">
                <p className="mb-3 font-bold text-gray-900 dark:text-gray-100">Exam Instructions & Rules:</p>

                <div className="space-y-3">
                    {/* Syllabus & Marks */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-gray-200 dark:border-zinc-700">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Total Syllabus</span>
                            <span className="font-semibold">{syllabusText}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-gray-200 dark:border-zinc-700">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Marking Scheme</span>
                            <span className="font-semibold text-green-600">+{contest.marksPerQuestion || 4}</span> / <span className="font-semibold text-red-500">-{contest.negativeMarking || 1}</span>
                        </div>
                    </div>

                    {/* Timing */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800 flex justify-between items-center text-xs">
                        <div>
                            <span className="text-blue-500 block text-[10px] uppercase font-bold">Start Time</span>
                            <span className="font-mono text-blue-700 dark:text-blue-300">{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-blue-500 block text-[10px] uppercase font-bold">End Time</span>
                            <span className="font-mono text-blue-700 dark:text-blue-300">{new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-zinc-700">
                        <li className="flex items-start gap-2">
                            <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                            <span><strong>Cannot switch tabs:</strong> Switching tabs or windows will trigger a warning. Multiple warnings may lead to disqualification.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Lock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <span><strong>Cannot leave exam:</strong> Once started, you must complete the test. Exiting early is not permitted.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Clock size={14} className="text-purple-500 shrink-0 mt-0.5" />
                            <span><strong>Restricted Submission:</strong> You can only submit the test in the last <strong>{contest.submitWindow || 10} minutes</strong> of the duration.</span>
                        </li>
                    </ul>
                </div>
            </div>
        );

        setModalConfig({
            isOpen: true,
            title: contest.hasJoined ? 'Already Joined' : (isFullTest ? 'Confirm Full Mock Entry' : 'Start Practice'),
            message: contest.hasJoined ? 'You have already joined this contest.' : strictRules,
            type: isFullTest ? 'warning' : 'info',
            confirmText: 'Yes, I Agree & Join',
            cancelText: 'Cancel',
            onConfirm: executeJoin
        });
    };

    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const isLive = start <= now && end > now;
    const isCompleted = end <= now;
    const isUpcoming = start > now;
    const isFullTest = contest.duration > 60;

    // --- FULL TEST DESIGN (Totally Different, Serious, Darker) ---
    if (isFullTest) {
        return (
            <>
                <motion.div
                    whileHover={{ y: -4 }}
                    onClick={handleJoinClick}
                    className="cursor-pointer group relative bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-700 flex flex-col h-full"
                >
                    {/* Corner Tag */}
                    <div className="absolute top-0 right-0 z-20">
                        <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1">
                            <Shield size={10} fill="currentColor" /> FULL MOCK
                        </div>
                    </div>

                    {/* Left Stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-6 relative z-10 flex flex-col h-full">
                        {/* Header ID/Status */}
                        <div className="flex justify-between mb-4 pl-2">
                            <span className="text-gray-500 dark:text-zinc-400 font-mono text-[10px] uppercase tracking-widest border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded">
                                ID: {contest._id.slice(-6)}
                            </span>
                            {isLive && <span className="text-red-500 font-bold text-xs animate-pulse flex items-center gap-1"><Zap size={12} fill="currentColor" /> LIVE</span>}
                            {isUpcoming && (
                                <span className="text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30">
                                    <Clock size={12} /> Test Starts In: <CountdownTimer targetDate={contest.startTime} onComplete={() => router.refresh()} />
                                </span>
                            )}
                        </div>

                        {/* Title Section */}
                        <div className="mb-4 pl-2">
                            <h3 className="text-xl md:text-2xl font-black leading-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                                {contest.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 h-8 mb-3">
                                {contest.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400">
                                    <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-gray-700 dark:text-white border border-gray-200 dark:border-zinc-700">{contest.category}</span>
                                    <span>•</span>
                                    <span className="text-amber-500 font-bold uppercase">{contest.difficulty}</span>
                                </div>
                                <div className="flex gap-1">
                                    {contest.supportedLanguages.map(lang => (
                                        <span key={lang} className="text-[9px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 uppercase">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden mb-6 mt-auto">
                            <div className="bg-white dark:bg-zinc-900/50 p-2.5 flex flex-col items-center">
                                <span className="text-[9px] text-zinc-500 uppercase font-bold mb-1"><Clock size={10} className="inline mr-1" />Dur</span>
                                <span className="text-gray-900 dark:text-white font-bold text-xs">{contest.duration}m</span>
                            </div>
                            <div className="bg-white dark:bg-zinc-900/50 p-2.5 flex flex-col items-center">
                                <span className="text-[9px] text-zinc-500 uppercase font-bold mb-1"><List size={10} className="inline mr-1" />Qns</span>
                                <span className="text-gray-900 dark:text-white font-bold text-xs">{contest.questions?.length || 'N/A'}</span>
                            </div>
                            <div className="bg-white dark:bg-zinc-900/50 p-2.5 flex flex-col items-center">
                                <span className="text-[9px] text-zinc-500 uppercase font-bold mb-1"><Users size={10} className="inline mr-1" />Slots</span>
                                <span className="text-gray-900 dark:text-white font-bold text-xs">{contest.slots}</span>
                            </div>

                            <div className="bg-white dark:bg-zinc-900/50 p-3 flex items-center justify-between col-span-3 border-t border-gray-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-zinc-600" />
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold">
                                        Date
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-900 dark:text-white font-bold text-xs">
                                        {new Date(contest.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} <span className="text-gray-400 mx-1">|</span> {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isUpcoming && (
                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px] bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 mt-1">
                                            Starts in <CountdownTimer targetDate={contest.startTime} onComplete={() => router.refresh()} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <button className={`w-full py-3 rounded-lg font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 uppercase shadow-lg
                            ${contest.hasJoined
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-900/30 cursor-default'
                                : 'bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200'}`}>
                            {contest.hasJoined ? (
                                <><CheckCircle size={14} /> ENROLLED</>
                            ) : (
                                <>{isCompleted ? 'VIEW RESULTS' : 'ENTER EXAM'} <ArrowRight size={14} /></>
                            )}
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

    // --- STANDARD / SMALL TEST DESIGN (Bento / Glass) ---
    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -6, scale: 1.01 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className={`group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col h-full cursor-pointer`}
                onClick={handleJoinClick}
            >
                {/* Glow Effect on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none from-blue-500/10 via-sky-500/10 to-emerald-500/5`} />

                {/* Tag for Small Test */}
                <div className="absolute top-0 right-0 z-20">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[9px] font-bold px-3 py-1 rounded-bl-xl">
                        MINI TEST
                    </div>
                </div>

                {/* Top Banner (Status & Difficulty) */}
                <div className="relative p-5 pb-0 flex justify-between items-start z-10">
                    <div className="flex flex-col gap-2 relative">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md
                            ${isLive ? 'bg-red-500 text-white animate-pulse' :
                                isUpcoming ? 'bg-blue-500 text-white' :
                                    'bg-gray-500 text-white'}`}>
                            {isLive && <Zap size={10} fill="currentColor" />}
                            {isUpcoming && <Clock size={10} />}
                            {isCompleted && <CheckCircle size={10} />}
                            {isLive ? 'Live Now' : (isUpcoming ? 'Upcoming' : 'Ended')}
                        </span>
                    </div>

                    <div className={`flex flex-col items-end mt-4`}>
                        <div className={`p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 mb-1 shadow-inner`}>
                            <Trophy size={18} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">{contest.difficulty}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-5 flex-1 z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {contest.title}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10">
                        {contest.description}
                    </p>

                    {/* Bento Grid Info */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                            <Clock size={14} className="text-blue-500 mb-1" />
                            <span className="font-bold text-gray-900 dark:text-gray-200 text-xs">
                                {contest.duration} <span className="text-[10px] font-normal text-gray-500 block">mins</span>
                            </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                            <List size={14} className="text-purple-500 mb-1" />
                            <span className="font-bold text-gray-900 dark:text-gray-200 text-xs">
                                {contest.questions?.length ?? '20+'} <span className="text-[10px] font-normal text-gray-500 block">Q's</span>
                            </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                            <Users size={14} className="text-orange-500 mb-1" />
                            <span className="font-bold text-gray-900 dark:text-gray-200 text-xs">
                                {contest.slots} <span className="text-[10px] font-normal text-gray-500 block">Slots</span>
                            </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between col-span-3">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    Date
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-gray-900 dark:text-gray-200 text-xs">
                                    {new Date(contest.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                {isUpcoming ? (
                                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[10px] mt-0.5">
                                        In <CountdownTimer targetDate={contest.startTime} onComplete={() => router.refresh()} />
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <div className="flex gap-1">
                            {contest.supportedLanguages.map(lang => (
                                <span key={lang} className="text-[10px] font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-500 px-2 py-1 rounded-md uppercase">
                                    {lang}
                                </span>
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{contest.category}</span>
                    </div>
                </div>

                {/* Big Action Button (Bottom) */}
                <button
                    disabled={joining || contest.hasJoined}
                    className={`w-full py-4 font-bold text-sm tracking-wide transition-all z-20 flex items-center justify-center gap-2
                    ${contest.hasJoined
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default border-t border-green-100 dark:border-green-800'
                            : `bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-lg shadow-blue-500/30`
                        }`}
                >
                    {contest.hasJoined ? (
                        <>
                            <CheckCircle size={16} /> YOU'VE JOINED
                        </>
                    ) : (
                        <>
                            {isCompleted ? 'VIEW LEADERBOARD' : (joining ? 'JOINING...' : 'REGISTER FOR EVENT')}
                            {!joining && !contest.hasJoined && <ArrowRight size={16} />}
                        </>
                    )}
                </button>

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
