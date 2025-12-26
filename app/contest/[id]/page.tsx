'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Clock, Trophy, AlertCircle, PlayCircle, Loader2, AlertTriangle, Lock } from 'lucide-react';
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
            `Marking Scheme: +${contest?.marksPerQuestion || 4} for correct answer, -${contest?.negativeMarking || 1} for wrong answer.`,
            ...(contest?.strictMode ? [
                "Do not switch tabs or minimize the window. Doing so will lead to warnings and potential ban.",
                "Right-click, copy, and paste are disabled.",
                `You can only submit the test in the last ${contest?.submitWindow || 10} minutes.`
            ] : []),
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

    const handleStart = async () => {
        if (contest?.strictMode) {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.log("Fullscreen request failed", err);
            }
        }
        router.push(`/contest/${params.id}/live`);
    };

    const strictTranslations = {
        en: {
            title: "Full Mock Instructions",
            marking: "Marking Scheme",
            correct: "Correct",
            wrong: "Wrong",
            duration: "Exam Duration",
            start: "Start",
            end: "End",
            to: "to",
            syllabus: "Subject Breakdown",
            syllabusFallback: "Syllabus will be listed here.",
            rulesTitle: "Strict Rules & Regulations",
            rules: [
                { title: "Zero Tolerance on Tab Switching", desc: "Switching tabs, minimizing the window, or using external tools will trigger warnings." },
                { title: "Session Locked", desc: "Once started, you cannot pause or leave the exam interface." },
                { title: "Submission Window", desc: "Submit only in the last {window} minutes." }
            ]
        },
        hi: {
            title: "पूर्ण मॉक निर्देश",
            marking: "अंकन योजना",
            correct: "सही",
            wrong: "गलत",
            duration: "परीक्षा अवधि",
            start: "शुरू",
            end: "समाप्त",
            to: "से",
            syllabus: "विषय विवरण",
            syllabusFallback: "पाठ्यक्रम यहाँ सूचीबद्ध किया जाएगा।",
            rulesTitle: "सख्त नियम और शर्तें",
            rules: [
                { title: "टैब बदलने पर शून्य सहिष्णुता", desc: "टैब बदलना, विंडो छोटा करना या बाहरी टूल्स का उपयोग करना चेतावनी को ट्रिगर करेगा।" },
                { title: "सत्र लॉक", desc: "एक बार शुरू होने पर, आप परीक्षा इंटरफ़ेस को रोक या छोड़ नहीं सकते।" },
                { title: "सबमिशन विंडो", desc: "केवल अंतिम {window} मिनटों में जमा करें।" }
            ]
        },
        mr: {
            title: "पूर्ण मॉक सूचना",
            marking: "गुणदान पद्धत",
            correct: "बरोबर",
            wrong: "चूक",
            duration: "परीक्षा कालावधी",
            start: "प्रारंभ",
            end: "समाप्त",
            to: "ते",
            syllabus: "विषय तपशील",
            syllabusFallback: "अभ्यासक्रम येथे सूचीबद्ध केला जाईल.",
            rulesTitle: "कठोर नियम आणि अटी",
            rules: [
                { title: "टॅब बदलल्यास कठोर कारवाई", desc: "टॅब बदलणे, विंडो लहान करणे किंवा बाह्य साधने वापरल्यास चेतावणी दिली जाईल." },
                { title: "सत्र लॉक", desc: "एकदा सुरू झाल्यास, आपण परीक्षा इंटरफेस थांबवू किंवा सोडू शकत नाही." },
                { title: "सबमिशन विंडो", desc: "केवळ शेवटच्या {window} मिनिटांत जमा करा." }
            ]
        }
    };

    const t = strictTranslations[language];

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

                    {/* Dynamic Syllabus from Question Subjects */}
                    {contest.questions && contest.questions.length > 0 && (
                        <div className="mb-8 text-left max-w-3xl mx-auto bg-gray-50 dark:bg-zinc-800/30 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 transition-colors">
                            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Syllabus / Subjects
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(contest.questions.map((q: any) => q.subject || 'General'))).map((subject: any, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
                                        {String(subject)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Strict Instructions for Full Tests */}
                    {(contest.duration > 60 || contest.strictMode) ? (
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 mb-10 text-left relative z-10 text-gray-900 dark:text-white shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
                            {/* Decorative Blur */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-700">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="text-red-500" />
                                    <h3 className="font-bold text-xl md:text-2xl">{t.title}</h3>
                                </div>

                                {/* Language Toggle Inside Strict Panel */}
                                <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700 self-start md:self-auto">
                                    {(['en', 'hi', 'mr'] as const).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === lang
                                                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow'
                                                : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
                                                }`}
                                        >
                                            {lang.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700">
                                        <span className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase font-bold block mb-1">{t.marking}</span>
                                        <div className="flex items-center gap-4 text-sm font-medium">
                                            <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><span className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">+{contest.marksPerQuestion || 4}</span> {t.correct}</span>
                                            <span className="text-red-600 dark:text-red-400 flex items-center gap-1"><span className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">-{contest.negativeMarking || 1}</span> {t.wrong}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700">
                                        <span className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase font-bold block mb-1">{t.duration}</span>
                                        <div className="flex justify-between items-center text-sm">
                                            <span><span className="font-bold">{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> {t.start}</span>
                                            <span className="text-gray-400 dark:text-zinc-500">{t.to}</span>
                                            <span><span className="font-bold">{new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> {t.end}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700">
                                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase font-bold block mb-2">{t.syllabus}</span>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(new Set(contest.questions?.map((q: any) => q.subject || 'General') || [])).map((subject: any, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded text-xs text-gray-600 dark:text-zinc-300">
                                                {String(subject)}
                                            </span>
                                        ))}
                                        {(!contest.questions || contest.questions.length === 0) && <span className="text-gray-400 dark:text-zinc-500 text-xs italic">{t.syllabusFallback}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{t.rulesTitle}</h4>
                                <ul className="space-y-3 text-sm text-gray-700 dark:text-zinc-300">
                                    <li className="flex gap-3 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <strong className="text-red-700 dark:text-red-400 block mb-0.5">{t.rules[0].title}</strong>
                                            {t.rules[0].desc}
                                        </div>
                                    </li>
                                    <li className="flex gap-3 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                        <Lock className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <strong className="text-amber-700 dark:text-amber-400 block mb-0.5">{t.rules[1].title}</strong>
                                            {t.rules[1].desc}
                                        </div>
                                    </li>
                                    <li className="flex gap-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                        <Clock className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <strong className="text-blue-700 dark:text-blue-400 block mb-0.5">{t.rules[2].title}</strong>
                                            {t.rules[2].desc.replace('{window}', String(contest.submitWindow || 10))}
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 mb-10 text-left relative z-10 transition-colors">
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
                    )}

                    {/* Animated, Smaller Start Button */}
                    <div className="flex justify-center pb-8">
                        <button
                            onClick={handleStart}
                            className="group relative px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-base flex items-center gap-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:hidden" />
                            <span className="relative z-10 flex items-center gap-2">
                                <PlayCircle size={18} className="fill-current" />
                                Start Challenge
                            </span>
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}
