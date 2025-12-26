'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { CheckCircle, XCircle, ArrowLeft, Lock } from 'lucide-react';

export default function AnswerKeyPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null); // { questions, userAnswers, score }
    const [accessDenied, setAccessDenied] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'All' | 'Correct' | 'Wrong' | 'Skipped'>('All');
    const [subjectFilter, setSubjectFilter] = useState<string>('All');

    // --- Derived Data & Logic ---

    // 1. Extract Unique Subjects
    const subjects = Array.from(new Set(data?.questions?.map((q: any) => q.subject || 'General'))).sort() as string[];

    // Extract available languages dynamically
    const availableLanguages = Array.from(new Set(
        data?.questions?.flatMap((q: any) => Object.keys(q.text || {})) || []
    )).filter(l => l) as string[];

    // Default to 'en' if available, otherwise first available, or just 'en'
    const [language, setLanguage] = useState<string>('en');

    useEffect(() => {
        if (availableLanguages.length > 0 && !availableLanguages.includes(language)) {
            setLanguage(availableLanguages.includes('en') ? 'en' : availableLanguages[0]);
        }
    }, [availableLanguages.join(',')]); // Update if available languages change

    useEffect(() => {
        const fetchAnalysis = async () => {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/login');

            try {
                const res = await fetch(`/api/contest/${params.id}/analysis`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 403) {
                    setAccessDenied(true);
                    setLoading(false);
                    return;
                }

                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-sm md:text-base">Loading Analysis...</div>;

    if (accessDenied) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 text-center">
                <Lock size={48} className="text-gray-400 mb-4" />
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">Analysis Locked</h1>
                <p className="text-xs md:text-base text-gray-500 mt-2">The contest is still ongoing. Answer key will be available once it ends.</p>
                <button onClick={() => router.back()} className="mt-6 text-blue-600 hover:underline text-sm">Go Back</button>
            </div>
        );
    }

    // --- Derived Data & Logic ---



    const languageNames: { [key: string]: string } = {
        en: 'English',
        hi: 'Hindi',
        mr: 'Marathi',
        gu: 'Gujarati',
        ta: 'Tamil',
        bn: 'Bengali'
    };

    const getLocalizedText = (obj: any, lang: string) => {
        if (!obj) return '';
        return obj[lang] || obj['en'] || Object.values(obj)[0] || '';
    };

    // 2. Filter Questions
    const filteredQuestions = data?.questions?.filter((q: any) => {
        const userAns = data.userAnswers[q._id];
        const isCorrect = userAns === q.correctOption;
        const isSkipped = userAns === undefined || userAns === null;

        // Subject Filter
        const qSubject = q.subject || 'General';
        if (subjectFilter !== 'All' && qSubject !== subjectFilter) return false;

        // Status Filter
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Correct') return isCorrect;
        if (statusFilter === 'Wrong') return !isCorrect && !isSkipped;
        if (statusFilter === 'Skipped') return isSkipped;

        return true;
    }) || [];

    // 3. Subject Performance Stats
    const subjectStats = subjects.map(subj => {
        const questionsInSubj = data?.questions?.filter((q: any) => (q.subject || 'General') === subj) || [];
        const total = questionsInSubj.length;
        if (total === 0) return null;

        let correct = 0;
        questionsInSubj.forEach((q: any) => {
            const userAns = data.userAnswers[q._id];
            if (userAns === q.correctOption) correct++;
        });

        return {
            subject: subj,
            total,
            correct,
            percentage: Math.round((correct / total) * 100)
        };
    }).filter(s => s !== null);


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-20 md:pt-28 max-w-5xl">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors text-xs md:text-base">
                    <ArrowLeft size={16} /> Back to Results
                </button>

                <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-gray-100 mb-6">Detailed Analysis</h1>

                {/* --- Performance Overview Chart --- */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-zinc-800 mb-6">
                    <h2 className="text-sm md:text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Subject Performance</h2>
                    <div className="space-y-3">
                        {subjectStats.map((stat: any) => (
                            <div key={stat.subject}>
                                <div className="flex justify-between text-[10px] md:text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{stat.subject}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{stat.correct}/{stat.total} ({stat.percentage}%)</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${stat.percentage >= 70 ? 'bg-green-500' : stat.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${stat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Filters --- */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 sticky top-20 z-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            {/* Status Filter */}
                            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                                {['All', 'Correct', 'Wrong', 'Skipped'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status as any)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] md:text-sm font-bold whitespace-nowrap transition-colors border
                                    ${statusFilter === status
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                {/* Subject Filter */}
                                <select
                                    value={subjectFilter}
                                    onChange={(e) => setSubjectFilter(e.target.value)}
                                    className="flex-1 md:w-40 px-3 py-2 rounded-xl text-[10px] md:text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="All">All Subjects</option>
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>

                                {/* Language Filter */}
                                {availableLanguages.length > 1 && (
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="flex-1 md:w-32 px-3 py-2 rounded-xl text-[10px] md:text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {availableLanguages.map(lang => (
                                            <option key={lang} value={lang}>
                                                {languageNames[lang] || lang.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Questions List --- */}
                <div className="space-y-4 md:space-y-6">
                    {filteredQuestions.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">No questions match the selected filters.</div>
                    ) : (
                        filteredQuestions.map((q: any, idx: number) => {
                            const userAns = data.userAnswers[q._id];
                            const isCorrect = userAns === q.correctOption;
                            const isSkipped = userAns === undefined || userAns === null;

                            return (
                                <div key={q._id} className={`bg-white dark:bg-zinc-900 rounded-2xl p-4 md:p-6 border-l-4 shadow-sm ${isSkipped ? 'border-gray-300 dark:border-zinc-700' :
                                    isCorrect ? 'border-green-500' : 'border-red-500'
                                    }`}>
                                    <div className="flex gap-3 md:gap-4">
                                        <div className="flex flex-col items-center gap-1 min-w-[30px]">
                                            <span className="font-bold text-gray-400 text-xs md:text-base">Q{data.questions.findIndex((orig: any) => orig._id === q._id) + 1}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Subject Tag */}
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 mb-2">
                                                {q.subject || 'General'}
                                            </span>

                                            <h3 className="font-medium text-xs md:text-lg text-gray-900 dark:text-gray-100 mb-3 md:mb-4 leading-relaxed">
                                                {getLocalizedText(q.text, language)}
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                                                {q.options.map((opt: any, optIdx: number) => {
                                                    const isSelected = userAns === optIdx;
                                                    const isCorrectOpt = q.correctOption === optIdx;

                                                    let style = "border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50";
                                                    if (isCorrectOpt) style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                                                    else if (isSelected && !isCorrectOpt) style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";

                                                    return (
                                                        <div key={optIdx} className={`p-2 md:p-3 rounded-lg border flex justify-between items-start md:items-center text-[10px] md:text-sm ${style}`}>
                                                            <span className="leading-tight">{getLocalizedText(opt, language)}</span>
                                                            <div className="ml-2 flex-shrink-0">
                                                                {isCorrectOpt && <CheckCircle size={14} className="text-green-600 md:w-4 md:h-4" />}
                                                                {isSelected && !isCorrectOpt && <XCircle size={14} className="text-red-600 md:w-4 md:h-4" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 md:p-4 rounded-xl text-[10px] md:text-sm text-blue-900 dark:text-blue-300">
                                                <span className="font-bold block mb-1">Explanation:</span>
                                                {getLocalizedText(q.explanation, language) || "No explanation provided."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
