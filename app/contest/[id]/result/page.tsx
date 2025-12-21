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
                // Fetch User Result (We might need an API for 'my-result-for-contest')
                // For now, assume we passed resultId via query param or fetch 'latest'
                // Or better, fetch Leaderboard which includes me?
                // Let's create a specialized 'result-summary' fetch
                // Actually, the previous 'submit' returned the resultId. Let's assume the user was redirected here.
                // We can fetch `/api/contest/${params.id}/result/me` (Needs implementation or logic)
                // Simpler: Fetch Leaderboard and find me, OR just show generic 'You submitted'.
                // Let's implement a quick 'get my result' in the same useEffect if we had an endpoint.

                // Fetching Leaderboard (mock or real)
                // We need `api/contest/[id]/ranking`
                const leaderRes = await fetch(`/api/contest/${params.id}/ranking`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });


                if (leaderRes.ok) {
                    const data = await leaderRes.json();
                    setLeaderboard(data.leaderboard || []);
                    setResult(data.myResult); // Expected API to return my result too
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
                    <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
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
                    </div>
                    {!contestEnded && (
                        <p className="text-xs text-gray-400 mt-3">
                            Answer key will be available after the contest ends.
                        </p>
                    )}
                </div>

                {/* Leaderboard */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-zinc-800">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Leaderboard
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-zinc-800">
                                    <th className="pb-4 font-semibold pl-4">Rank</th>
                                    <th className="pb-4 font-semibold">User</th>
                                    <th className="pb-4 font-semibold text-right">Time</th>
                                    <th className="pb-4 font-semibold text-right pr-4">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                                {leaderboard.map((userRes: any, index: number) => (
                                    <tr key={userRes._id} className={`group ${userRes.userId._id === result?.userId ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="py-4 pl-4 font-bold text-gray-400">
                                            #{index + 1}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs">
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
                                        <td className="py-4 text-right text-gray-500 dark:text-gray-400 font-mono text-sm">
                                            {userRes.didNotAttend ? <span className="text-red-500 text-xs">Absent</span> : formatTime(userRes.timeTaken)}
                                        </td>
                                        <td className="py-4 pr-4 text-right font-bold text-gray-900 dark:text-gray-100">
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
