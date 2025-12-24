'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Trophy, Clock, XCircle, CheckCircle, BarChart2, Lock, ArrowRight, AlertTriangle, BookOpen } from 'lucide-react';

export default function ResultPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [result, setResult] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [contestEnded, setContestEnded] = useState(false); // To verify if answer key should be shown

    const [contest, setContest] = useState<any>(null);

    const formatTime = (seconds: number) => {
        if (!seconds) return '-';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // Fetch Contest Details for Marking Scheme
                const contestRes = await fetch(`/api/admin/contests/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (contestRes.ok) {
                    const cData = await contestRes.json();
                    if (cData.success) setContest(cData.data);
                }

                // Fetch Leaderboard and Result
                const leaderRes = await fetch(`/api/contest/${params.id}/ranking`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (leaderRes.ok) {
                    const data = await leaderRes.json();
                    setLeaderboard(data.leaderboard || []);
                    setResult(data.myResult);
                    setContestEnded(data.contestEnded);
                }

            } catch (error) {
                console.error("Failed to load results", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Results...</div>;

    const myRank = leaderboard.findIndex((r: any) => r.userId._id === result?.userId) + 1;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 md:pt-28 max-w-4xl">
                {/* My Score Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 mb-8 shadow-xl border border-gray-200 dark:border-zinc-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                    <h1 className="text-2xl font-bold text-gray-500 uppercase tracking-widest mb-4">Quiz Completed!</h1>
                    <div className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
                        {result?.score ?? 0}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Total Score</p>

                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result?.stats?.correct || 0}</div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Correct</div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result?.stats?.wrong || 0}</div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Wrong</div>
                        </div>
                        <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700">
                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{result?.stats?.skipped || 0}</div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Skipped</div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            disabled={!contestEnded}
                            onClick={() => router.push(`/contest/${params.id}/analysis`)}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all
                            ${contestEnded
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'}`}
                        >
                            {contestEnded ? <BookOpen size={20} /> : <Lock size={20} />}
                            {contestEnded ? 'View Answer Key' : 'Answer Key Locked'}
                        </button>
                        <button
                            onClick={() => window.location.reload()} // Simple reload to refetch everything
                            className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                            title="Refresh Results"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                        </button>
                    </div>
                    {!contestEnded && (
                        <p className="text-xs text-gray-400 mt-3">
                            Answer key will be available after the contest ends.
                        </p>
                    )}
                </div>

                {/* Score Calculation Breakdown */}
                {contest && result && (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-gray-200 dark:border-zinc-800">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <BarChart2 className="text-blue-500" size={20} /> Score Breakdown
                        </h3>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3 font-mono text-sm">
                            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                <span className="flex items-center gap-2">
                                    <CheckCircle size={16} /> Correct Answers ({result.stats?.correct || 0})
                                </span>
                                <span>
                                    {result.stats?.correct || 0} × {contest.marksPerQuestion} = <span className="font-bold">+{(result.stats?.correct || 0) * contest.marksPerQuestion}</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                                <span className="flex items-center gap-2">
                                    <XCircle size={16} /> Wrong Answers ({result.stats?.wrong || 0})
                                </span>
                                <span>
                                    {result.stats?.wrong || 0} × {contest.negativeMarking} = <span className="font-bold">-{(result.stats?.wrong || 0) * contest.negativeMarking}</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-2">
                                    <AlertTriangle size={16} /> Skipped ({result.stats?.skipped || 0})
                                </span>
                                <span>0</span>
                            </div>
                            <div className="h-px bg-gray-200 dark:bg-zinc-700 my-2" />
                            <div className="flex justify-between items-center text-base md:text-lg font-bold text-gray-900 dark:text-white">
                                <span>Final Score</span>
                                <span>{result.score}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-zinc-800">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Leaderboard
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] md:text-sm text-gray-500 uppercase tracking-wider border-b-2 border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                                    <th className="py-3 pl-3 md:pl-6 font-bold rounded-tl-lg">Rank</th>
                                    <th className="py-3 font-bold">User</th>
                                    <th className="py-3 text-right font-bold hidden md:table-cell">Time</th>
                                    <th className="py-3 md:hidden text-right font-bold">Time</th>
                                    <th className="py-3 pr-3 md:pr-6 text-right font-bold rounded-tr-lg">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800 text-xs md:text-sm">
                                {leaderboard.map((userRes: any, index: number) => (
                                    <tr key={userRes._id}
                                        className={`transition-colors
                                            ${userRes.userId._id === result?.userId
                                                ? 'bg-blue-50/80 dark:bg-blue-900/20 shadow-sm border-l-4 border-blue-500'
                                                : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 even:bg-gray-50/30 dark:even:bg-zinc-900/30'
                                            }`}
                                    >
                                        <td className="py-2.5 md:py-4 pl-3 md:pl-6 font-black text-gray-400 text-xs md:text-base">
                                            #{index + 1}
                                        </td>
                                        <td className="py-2.5 md:py-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs shadow-sm
                                                    ${userRes.userId._id === result?.userId ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                    {userRes.userId.firstName?.[0]}
                                                </div>
                                                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                                    {userRes.userId.firstName} {userRes.userId.lastName}
                                                    {userRes.userId._id === result?.userId && <span className="ml-2 text-xs text-blue-500">(You)</span>}
                                                    {userRes.didNotAttend && (
                                                        <div title="Did not attend" className="text-red-500">
                                                            <AlertTriangle size={14} />
                                                        </div>
                                                    )}
                                                    {/* @ts-ignore */}
                                                    {userRes.warningLabels && userRes.warningLabels.length > 0 && (
                                                        <div className="group relative ml-2 inline-block">
                                                            <span className="inline-flex items-center gap-1 text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/10 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-900/20 cursor-help">
                                                                <AlertTriangle size={12} /> {userRes.warningLabels.length}
                                                            </span>
                                                            <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-zinc-800 text-xs shadow-lg rounded-lg border border-gray-200 dark:border-zinc-700 p-2 hidden group-hover:block z-10">
                                                                <p className="font-bold mb-1 border-b border-gray-100 dark:border-zinc-700 pb-1">Warning Log:</p>
                                                                <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-300">
                                                                    {/* @ts-ignore */}
                                                                    {userRes.warningLabels.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2 md:py-4 text-right text-gray-500 dark:text-gray-400 font-mono">
                                            {userRes.didNotAttend ? <span className="text-red-500 text-[10px]">Absent</span> :
                                                <span className="hidden md:inline">{formatTime(userRes.timeTaken)}</span>}
                                            {/* Mobile Time: Short format? Or just formatted */}
                                            {!userRes.didNotAttend && <span className="md:hidden">{Math.floor(userRes.timeTaken / 60)}m{userRes.timeTaken % 60}s</span>}
                                        </td>
                                        <td className="py-2 md:py-4 pr-2 md:pr-4 text-right font-bold text-gray-900 dark:text-gray-100">
                                            {userRes.score}
                                        </td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-gray-400">No submissions yet only you.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
