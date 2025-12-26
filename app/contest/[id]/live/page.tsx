'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ChevronRight, Menu, X, Timer, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function ContestLivePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [contest, setContest] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'success' | 'info';
        confirmText: string;
        cancelText: string;
        autoClose?: boolean;
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

    const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);

    const [initialTime, setInitialTime] = useState(0);

    useEffect(() => {
        const initContest = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 1. Fetch Contest Data (Questions, etc.)
                const contestRes = await fetch(`/api/admin/contests/${params.id}`);
                const contestData = await contestRes.json();
                if (!contestData.success) throw new Error("Contest load failed");

                setContest(contestData.data);

                // STRICT MODE: Enforce Fullscreen
                if (contestData.data.strictMode) {
                    if (document.documentElement.requestFullscreen) {
                        try {
                            await document.documentElement.requestFullscreen();
                        } catch (err) {
                            console.log("Auto-fullscreen failed (expected if no user gesture), showing manual button.");
                        }
                    }
                }

                // 2. Start/Sync Contest Session (Time Tracking)
                const startRes = await fetch(`/api/contest/${params.id}/start`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const startData = await startRes.json();

                if (startData.success) {
                    // Check if time is already up
                    if (startData.timeLeft <= 0) {
                        setModalConfig({
                            isOpen: true,
                            title: 'Time Expired',
                            message: 'Your allotted time for this contest has ended. Submitting your result...',
                            type: 'warning',
                            confirmText: '',
                            cancelText: '',
                            onConfirm: () => { }
                        });
                        setQuestions(contestData.data.questions || []);
                        handleSubmit(true);
                        return; // Stop loading rest of UI
                    }

                    setTimeLeft(startData.timeLeft);
                    setInitialTime(startData.timeLeft); // Store initial time
                    setAvailableLanguages(startData.supportedLanguages || ['en']);

                    // If re-join with low time, maybe show a toast?
                    if (startData.isRejoin) {
                        // Optional: Notification
                    }
                } else {
                    throw new Error(startData.error || "Failed to start contest");
                }

                if (contestData.data.questions && contestData.data.questions.length > 0 && typeof contestData.data.questions[0] === 'string') {
                    // Keep fallback for dev/testing if needed
                    setQuestions(contestData.data.questions || []);
                } else {
                    setQuestions(contestData.data.questions || []);
                }

            } catch (error: any) {
                console.error(error);
                setModalConfig({
                    isOpen: true,
                    title: 'Error',
                    message: error.message || 'Failed to load quiz data',
                    type: 'danger',
                    confirmText: 'Go Back',
                    cancelText: '',
                    onConfirm: () => router.push('/profile')
                });
            } finally {
                setLoading(false);
            }
        };

        initContest();

        // 3. Warning Handlers
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                setWarningCount(prev => {
                    const newCount = prev + 1;

                    // Send Warning to Backend
                    const token = localStorage.getItem('token');
                    if (token) {
                        fetch(`/api/contest/${params.id}/warn`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ reason: `Tab Switch (Warning ${newCount})` })
                        }).catch(console.error);
                    }

                    setModalConfig({
                        isOpen: true,
                        title: 'Warning Issued!',
                        message: `You switched tabs! This is Warning ${newCount}. Detailed report will be sent to admin.`,
                        type: 'danger',
                        confirmText: 'I Understand',
                        cancelText: '',
                        onConfirm: () => setModalConfig(p => ({ ...p, isOpen: false }))
                    });

                    return newCount;
                });
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Browser warning when trying to close/reload
            e.preventDefault();
            e.returnValue = '';
            // We can also fire a 'warn' here if we want, but synchronous fetch is deprecated in unload.
            // navigator.sendBeacon is better, but authentication headers are tricky.
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);

            // Cleanup Strict Listeners
            if (contest?.strictMode) {
                document.removeEventListener('contextmenu', preventDefault);
                document.removeEventListener('copy', preventDefault);
                document.removeEventListener('cut', preventDefault);
                document.removeEventListener('paste', preventDefault);
            }
        };
    }, [params.id, router, contest?.strictMode]); // Added contest dependency for strict listeners

    const [isFullscreen, setIsFullscreen] = useState(false);

    // Strict Mode: Action Preventer & Fullscreen Listener
    const preventDefault = (e: Event) => e.preventDefault();
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    useEffect(() => {
        if (contest?.strictMode) {
            document.addEventListener('contextmenu', preventDefault);
            document.addEventListener('copy', preventDefault);
            document.addEventListener('cut', preventDefault);
            document.addEventListener('paste', preventDefault);

            // Check initial state
            setIsFullscreen(!!document.fullscreenElement);
            document.addEventListener('fullscreenchange', handleFullscreenChange);
        }
        return () => {
            document.removeEventListener('contextmenu', preventDefault);
            document.removeEventListener('copy', preventDefault);
            document.removeEventListener('cut', preventDefault);
            document.removeEventListener('paste', preventDefault);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [contest?.strictMode]);

    useEffect(() => {
        if (!loading && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !loading) {
            handleSubmit(true);
        }
    }, [loading, timeLeft]);

    const handleOptionSelect = (optionIndex: number) => {
        const question = questions[currentQuestionIndex];
        setAnswers(prev => ({ ...prev, [question._id]: optionIndex }));
    };

    const confirmSubmit = () => {
        // Strict Mode: Early Submit Check
        if (contest?.strictMode && timeLeft > (contest.submitWindow * 60)) {
            setModalConfig({
                isOpen: true,
                title: 'Too Early to Submit',
                message: `Strict Mode enabled: You can only submit in the last ${contest.submitWindow} minutes of the exam.`,
                type: 'warning',
                confirmText: 'Okay',
                cancelText: '',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        setModalConfig({
            isOpen: true,
            title: 'Submit Test?',
            message: `You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Are you sure you want to finish?`,
            type: 'info',
            confirmText: 'Yes, Submit',
            cancelText: 'Keep Playing',
            autoClose: false,
            onConfirm: () => handleSubmit()
        });
    }

    const handleSubmit = async (force = false) => {
        // Show "Validating" modal via state if we want visual feedback BEFORE api call returns
        // We do NOT setSubmitting(true) here because that triggers the full-screen loader
        // which would unmount this modal.
        setModalConfig({
            isOpen: true,
            title: 'Validating Submission...',
            message: 'Checking exam timings and rules...',
            type: 'info',
            confirmText: '',
            cancelText: '',
            autoClose: false,
            onConfirm: () => { }
        });


        const token = localStorage.getItem('token');

        // Calculate Time Taken
        const timeTaken = initialTime - timeLeft;

        try {
            const res = await fetch(`/api/contest/${params.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers, timeTaken })
            });

            const data = await res.json();
            if (data.success) {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                router.replace(`/contest/${params.id}/result`);
            } else {
                setSubmitting(false); // Stop loader
                if (force) {
                    router.replace(`/contest/${params.id}/result`);
                } else {
                    setModalConfig({
                        isOpen: true,
                        title: 'Submission Rejected',
                        message: data.error || 'Please try again.',
                        type: 'danger',
                        confirmText: 'Okay',
                        cancelText: 'Cancel', // Allow cancel to keep playing
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        } catch (error) {
            console.error(error);
            setSubmitting(false);
            if (!force) {
                setModalConfig({
                    isOpen: true,
                    title: 'Network Error',
                    message: 'Could not submit test. Check connection.',
                    type: 'danger',
                    confirmText: 'Retry',
                    cancelText: 'Cancel',
                    onConfirm: () => handleSubmit()
                });
            }
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading || submitting) return <div className="h-screen flex items-center justify-center flex-col gap-4 text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin w-10 h-10" />
        {submitting && <p className="font-medium animate-pulse">Submitting your answers...</p>}
    </div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col overflow-hidden font-sans">
            <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg hidden md:block text-gray-900 dark:text-gray-100">{contest?.title}</span>
                    <span className="md:hidden font-bold text-gray-900 dark:text-gray-100">Quiz</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                        {availableLanguages.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang as any)}
                                className={`px-3 py-1 rounded-md text-sm font-bold uppercase transition-all ${language === lang ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'}`}>
                        <Timer size={18} />
                        {formatTime(timeLeft)}
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-gray-700 dark:text-gray-300">
                        <Menu size={20} />
                    </button>
                    <div className="relative group hidden md:block">
                        <button
                            onClick={confirmSubmit}
                            disabled={contest?.strictMode && timeLeft > ((contest?.submitWindow || 10) * 60)}
                            className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-all active:scale-95
                                ${(contest?.strictMode && timeLeft > ((contest?.submitWindow || 10) * 60))
                                    ? 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'}`}
                        >
                            Submit Test
                        </button>
                        {(contest?.strictMode && timeLeft > ((contest?.submitWindow || 10) * 60)) && (
                            <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-black/80 text-white text-xs rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Enabled in last {contest?.submitWindow || 10} mins
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="hidden md:flex w-80 flex-col border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Question Overview</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-5 gap-3">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q._id] !== undefined;
                                const isCurrent = idx === currentQuestionIndex;
                                return (
                                    <button
                                        key={q._id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all
                                            ${isCurrent ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                                                isAnswered ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-500 space-y-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div> Answered</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-200"></div> Current</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div> Not Visited</div>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-6 flex justify-between items-start gap-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    Question {currentQuestionIndex + 1} <span className="text-gray-400 text-sm font-normal">/ {questions.length}</span>
                                </h2>
                                <p className="text-[10px] md:text-xs font-mono text-gray-400 mt-1 select-all">
                                    ID: {currentQuestion?._id}
                                </p>
                            </div>

                            {currentQuestion?.subject && (
                                <span className="shrink-0 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800 shadow-sm">
                                    {currentQuestion.subject}
                                </span>
                            )}
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 transition-colors">
                            <h2 className="text-lg md:text-xl font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                                {currentQuestion?.text?.[language] || currentQuestion?.text?.en || "Loading question..."}
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {currentQuestion?.options?.map((opt: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
                                        ${answers[currentQuestion._id] === idx
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-transparent bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 shadow-sm'}`}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors
                                        ${answers[currentQuestion._id] === idx
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 group-hover:bg-white dark:group-hover:bg-zinc-800'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <div className="flex-1">
                                        <div className="text-gray-900 dark:text-gray-100 font-medium">
                                            {opt[language] || opt.en}
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                        ${answers[currentQuestion._id] === idx ? 'border-blue-500' : 'border-gray-300 dark:border-zinc-600'}`}>
                                        {answers[currentQuestion._id] === idx && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between mt-8 sticky bottom-4 z-10">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 transition-colors text-gray-700 dark:text-gray-300"
                            >
                                <ChevronLeft size={20} /> Previous
                            </button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <div className="relative group">
                                    <button
                                        onClick={confirmSubmit}
                                        disabled={contest?.strictMode && timeLeft > ((contest?.submitWindow || 10) * 60)}
                                        className={`px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg
                                            ${(contest?.strictMode && timeLeft > ((contest?.submitWindow || 10) * 60))
                                                ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-500 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20'}`}
                                    >
                                        Submit Test
                                    </button>
                                    {/* Tooltip for Disabled State */}
                                    {(contest?.strictMode && timeLeft > ((contest?.submitWindow || 10) * 60)) && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-black/80 text-white text-xs rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            Submission allowed in last {contest?.submitWindow || 10} minutes.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-semibold flex items-center gap-2 transition-all active:scale-95"
                                >
                                    Next <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white dark:bg-zinc-900 update z-40 shadow-2xl flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Questions</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-600 dark:text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-5 gap-3">
                                    {questions.map((q, idx) => {
                                        const isAnswered = answers[q._id] !== undefined;
                                        const isCurrent = idx === currentQuestionIndex;
                                        return (
                                            <button
                                                key={q._id}
                                                onClick={() => { setCurrentQuestionIndex(idx); setIsSidebarOpen(false); }}
                                                className={`w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all
                                                    ${isCurrent ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                                                        isAnswered ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                                            'bg-gray-100 text-gray-500 dark:bg-zinc-800'}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                                <button onClick={confirmSubmit} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                                    Submit Test
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Fullscreen Enforcer Overlay (Strict Mode) */}
            {(contest?.strictMode && !isFullscreen) && (
                <div className="fixed inset-0 z-50 bg-white/90 dark:bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 rounded-3xl shadow-2xl max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3">
                            Strict Mode Active
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            This exam must be taken in <strong>Full Screen Mode</strong>.
                            Exiting full screen may result in warnings or disqualification.
                        </p>
                        <button
                            onClick={() => document.documentElement.requestFullscreen().catch(err => alert("Could not enable full screen: " + err.message))}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                        >
                            Enter Full Screen
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => modalConfig.type !== 'danger' && setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                autoClose={modalConfig.autoClose}
            />
        </div>
    );
}
