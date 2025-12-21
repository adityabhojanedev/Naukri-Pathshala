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

    useEffect(() => {
        const fetchAnalysis = async () => {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/login');

            try {
                // Fetch Analysis Data (Protected by Time)
                // We could repurpose 'ranking' or create a specific 'analysis' endpoint
                // For speed, let's assume we create a new endpoint or logical check here.
                // Creating a specific endpoint is better for security.
                // But let's reuse logic: If I fetch contest details and it's ended, I can fetch questions with correct answers.
                // Or best, make a dedicated API.
                // Let's assume we call `/api/contest/${params.id}/analysis` (Need to create this if we want strict security)
                // For now, let's implement the UI and a mock-ish fetch that validates time on client (WEAK SECURITY but fast dev)
                // NO, user asked for "Answer Key", usually requires secure backend.
                // Let's create the API route next. For now, assume it returns:
                // { questions: [ { ..., correctOption, explanation } ], userAnswers: { ... } }

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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Analysis...</div>;

    if (accessDenied) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 text-center">
                <Lock size={48} className="text-gray-400 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Analysis Locked</h1>
                <p className="text-gray-500 mt-2">The contest is still ongoing. Answer key will be available once it ends.</p>
                <button onClick={() => router.back()} className="mt-6 text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 md:pt-28 max-w-4xl">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-8 transition-colors">
                    <ArrowLeft size={20} /> Back to Results
                </button>

                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-8">Detailed Analysis</h1>

                <div className="space-y-6">
                    {data?.questions?.map((q: any, idx: number) => {
                        const userAns = data.userAnswers[q._id];
                        const isCorrect = userAns === q.correctOption;
                        const isSkipped = userAns === undefined || userAns === null;

                        return (
                            <div key={q._id} className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 border-l-4 shadow-sm ${isSkipped ? 'border-gray-300 dark:border-zinc-700' :
                                    isCorrect ? 'border-green-500' : 'border-red-500'
                                }`}>
                                <div className="flex gap-4">
                                    <span className="font-bold text-gray-400">Q{idx + 1}.</span>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-4">{q.text.en}</h3>
                                        {q.text.hi && <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{q.text.hi}</p>}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                            {q.options.map((opt: any, optIdx: number) => {
                                                const isSelected = userAns === optIdx;
                                                const isCorrectOpt = q.correctOption === optIdx;

                                                let style = "border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50";
                                                if (isCorrectOpt) style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                                                else if (isSelected && !isCorrectOpt) style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";

                                                return (
                                                    <div key={optIdx} className={`p-3 rounded-lg border flex justify-between items-center ${style}`}>
                                                        <span>{opt.en}</span>
                                                        {isCorrectOpt && <CheckCircle size={16} className="text-green-600" />}
                                                        {isSelected && !isCorrectOpt && <XCircle size={16} className="text-red-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl text-sm text-blue-900 dark:text-blue-300">
                                            <span className="font-bold block mb-1">Explanation:</span>
                                            {q.explanation?.en || "No explanation provided."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
