'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Clock, Trophy, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { use } from 'react';

export default function ContestLobbyPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');

    const [contest, setContest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check Auth
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch Contest
        fetch(`/api/admin/contests/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setContest(data.data);
                } else {
                    setError(data.error || 'Contest not found');
                }
            })
            .catch(err => setError('Failed to load contest'))
            .finally(() => setLoading(false));
    }, [params.id]);

    const instructions = {
        en: [
            "Ensure you have a stable internet connection.",
            `You have ${contest?.timePerQuestion || 60} seconds per question.`,
            "Negative marking: -1 for every wrong answer.",
            "Do not switch tabs or minimize the window. Doing so will lead to a 1-day ban.",
            "Accumulating 3 warnings will result in permanent removal from the platform.",
            "Click 'Submit Test' only when you have completed all questions."
        ],
        hi: [
            "निश्चित करें कि आपका इंटरनेट कनेक्शन स्थिर है।",
            `आपके पास प्रत्येक प्रश्न के लिए ${contest?.timePerQuestion || 60} सेकंड हैं।`,
            "नकारात्मक अंकन: प्रत्येक गलत उत्तर के लिए -1।",
            "टैब न बदलें या विंडो को छोटा न करें। ऐसा करने पर 1 दिन का प्रतिबंध लगेगा।",
            "3 चेतावनी मिलने पर आपको प्लेटफॉर्म से स्थायी रूप से हटा दिया जाएगा।",
            "'सबमिट टेस्ट' पर केवल तभी क्लिक करें जब आपने सभी प्रश्न पूरे कर लिए हों।"
        ],
        mr: [
            "तुमचे इंटरनेट कनेक्शन स्थिर असल्याची खात्री करा.",
            `तुमच्याकडे प्रत्येक प्रश्नासाठी ${contest?.timePerQuestion || 60} सेकंद आहेत.`,
            "निगेटिव्ह मार्किंग: प्रत्येक चुकीच्या उत्तरासाठी -1.",
            "टॅब बदलू नका किंवा विंडो लहान करू नका. असे केल्यास 1 दिवसाची बंदी घातली जाईल.",
            "3 चेतावणी मिळाल्यास तुम्हाला प्लॅटफॉर्मवरून कायमचे काढून टाकले जाईल.",
            "सर्व प्रश्न पूर्ण झाल्यावरच 'सबमिट टेस्ट' वर क्लिक करा."
        ]
    };

    const handleStart = () => {
        router.push(`/contest/${params.id}/live`);
    };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center text-blue-600"><Loader2 className="animate-spin w-8 h-8" /></div>;
    if (error) return <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 md:pt-28 max-w-4xl">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-12 shadow-xl border border-gray-200 dark:border-zinc-800 text-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${contest.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {contest.category} • {contest.difficulty}
                    </span>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
                        {contest.title}
                    </h1>

                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {contest.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50">
                            <Clock className="mx-auto mb-2 text-blue-500" />
                            <div className="font-bold text-xl text-gray-900 dark:text-white">{contest.duration} mins</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Duration</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50">
                            <Trophy className="mx-auto mb-2 text-yellow-500" />
                            <div className="font-bold text-xl text-gray-900 dark:text-white">{contest.questions?.length || 0}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Questions</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50">
                            <AlertCircle className="mx-auto mb-2 text-purple-500" />
                            <div className="font-bold text-xl text-gray-900 dark:text-white">+4 / -1</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Marking</div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 mb-10 text-left relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300">Instructions</h3>
                            <div className="flex bg-white dark:bg-zinc-800 rounded-lg p-1 border border-blue-100 dark:border-blue-800 shadow-sm">
                                {(['en', 'hi', 'mr'] as const).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setLanguage(lang)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${language === lang
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                            }`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ul className="space-y-3">
                            {instructions[language].map((instruction, index) => (
                                <li key={index} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                        {index + 1}
                                    </span>
                                    <span className="leading-relaxed">{instruction}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full md:w-auto px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 mx-auto"
                    >
                        <PlayCircle size={24} className="fill-current" /> Start Challenge
                    </button>

                </div>
            </main>
        </div>
    );
}
