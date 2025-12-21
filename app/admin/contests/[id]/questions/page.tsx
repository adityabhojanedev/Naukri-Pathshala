'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Upload, Trash2, FileText, X, Edit } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_JSON = [
    {
        "text": { "en": "What is 2+2?", "hi": "2+2 क्या है?" },
        "options": [
            { "en": "3", "hi": "3" },
            { "en": "4", "hi": "4" },
            { "en": "5", "hi": "5" },
            { "en": "6", "hi": "6" }
        ],
        "correctOption": 1,
        "explanation": { "en": "Basic Math", "hi": "मूल गणित" }
    }
];

export default function ManageQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [contestId, setContestId] = useState<string>('');
    useEffect(() => {
        params.then(p => setContestId(p.id));
    }, [params]);

    const [loading, setLoading] = useState(false);
    const [questionsList, setQuestionsList] = useState<any[]>([]);
    const [contestTitle, setContestTitle] = useState('');
    const [contestLangs, setContestLangs] = useState<string[]>(['en']);

    // UI States
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

    // Manual Question State
    const [manualQ, setManualQ] = useState<any>({
        text: {},
        options: [{}, {}, {}, {}],
        correctOption: 0,
        explanation: {}
    });
    const [activeLangTab, setActiveLangTab] = useState('en');
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    // JSON State
    const [jsonInput, setJsonInput] = useState('');

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'danger' | 'warning' | 'success',
        onConfirm: () => { },
        confirmText: 'OK',
        cancelText: ''
    });

    const showModal = (title: string, message: string, type: 'info' | 'danger' | 'warning' | 'success' = 'info', onConfirm = () => { }) => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            confirmText: 'OK',
            cancelText: ''
        });
    };

    // Fetch Data
    const fetchContestAndQuestions = async () => {
        if (!contestId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/contests/${contestId}`);
            const data = await res.json();
            if (data.success) {
                setContestTitle(data.data.title);
                setContestLangs(data.data.supportedLanguages || ['en']);
                setQuestionsList(data.data.questions || []);
                if (data.data.supportedLanguages?.length > 0) {
                    setActiveLangTab(data.data.supportedLanguages[0]);
                }
            } else {
                showModal('Error', data.error || 'Failed to fetch contest', 'danger');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showModal('Error', 'Failed to load data', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contestId) fetchContestAndQuestions();
    }, [contestId]);

    // --- Actions ---

    const submitQuestions = async (questions: any[], silent: boolean = false): Promise<boolean> => {
        if (!contestId) return false;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/contests/${contestId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions }),
            });
            const data = await res.json();

            if (!data.success) {
                showModal('Error', data.error, 'danger');
                return false;
            } else {
                fetchContestAndQuestions();
                return true;
            }
        } catch (error) {
            showModal('Error', 'Failed to add questions', 'danger');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleManualQuestionSubmit = async () => {
        if (editingQuestionId) {
            await handleUpdateQuestion();
            return;
        }

        const filledLangs = Object.keys(manualQ.text).filter(k => manualQ.text[k]?.trim());
        const validLangs = filledLangs.filter(l => contestLangs.includes(l));
        const minRequired = Math.min(2, contestLangs.length);

        if (validLangs.length < minRequired) {
            showModal('Validation Error', `Please provide Question Text in at least ${minRequired} supported languages.`, 'warning');
            return;
        }

        const success = await submitQuestions([manualQ], true);
        if (success) {
            resetForm();
            setIsQuestionModalOpen(false);
            showModal('Success', 'Question Added Successfully!', 'success');
        }
    };

    const handleUpdateQuestion = async () => {
        if (!editingQuestionId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/questions/${editingQuestionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(manualQ)
            });
            const data = await res.json();
            if (data.success) {
                showModal('Success', 'Question Updated Successfully!', 'success');
                resetForm();
                setIsQuestionModalOpen(false);
                fetchContestAndQuestions();
            } else {
                showModal('Error', data.error, 'danger');
            }
        } catch (error) {
            showModal('Error', 'Failed to update question', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (qId: string) => {
        setModal({
            isOpen: true,
            title: 'Delete Question?',
            message: 'Are you sure? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    await fetch(`/api/admin/questions/${qId}`, { method: 'DELETE' });
                    fetchContestAndQuestions();
                    setModal(prev => ({ ...prev, isOpen: false }));
                } catch (e) {
                    showModal('Error', 'Failed to delete', 'danger');
                }
            }
        });
    };

    const handleJsonSubmit = async () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) throw new Error('Root must be an array');
            const success = await submitQuestions(parsed, true);
            if (success) {
                setJsonInput('');
                setIsJsonModalOpen(false);
                showModal('Success', 'Questions Imported Successfully!', 'success');
            }
        } catch (error: any) {
            showModal('Invalid JSON', error.message, 'danger');
        }
    };

    const openEditModal = (q: any) => {
        setEditingQuestionId(q._id);
        const text = q.text || {};
        const options = q.options && q.options.length === 4 ? q.options : [{}, {}, {}, {}];
        const correctOption = typeof q.correctOption === 'number' ? q.correctOption : 0;
        const explanation = q.explanation || {};

        setManualQ({
            text,
            options,
            correctOption,
            explanation
        });
        setIsQuestionModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsQuestionModalOpen(true);
    };

    const resetForm = () => {
        setEditingQuestionId(null);
        setManualQ({ text: {}, options: [{}, {}, {}, {}], correctOption: 0, explanation: {} });
    };

    const copySampleJson = () => {
        navigator.clipboard.writeText(JSON.stringify(SAMPLE_JSON, null, 2));
        showModal('Success', 'Sample JSON copied to clipboard!', 'success');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <button onClick={() => router.push('/admin/dashboard?tab=contests')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-4 transition-colors">
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-gray-100">Manage Questions</h1>
                            <p className="text-gray-500 text-sm mt-1">Contest: <span className="font-semibold text-blue-600 dark:text-blue-400">{contestTitle}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsJsonModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors text-sm font-medium"
                            >
                                <Upload size={16} /> Bulk Upload
                            </button>
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium"
                            >
                                <Plus size={16} /> Add Question
                            </button>
                        </div>
                    </div>
                </div>

                {/* Questions Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    {questionsList.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                            <FileText size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No questions added yet.</p>
                            <p className="text-xs mt-1">Click "Add Question" or "Bulk Upload" to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 w-12 text-center">#</th>
                                        <th className="px-6 py-4">Question Text</th>
                                        <th className="px-6 py-4 text-center">Correct</th>
                                        {/* Simplified Options column to avoid clutter, focus on Correct Answer visual or simple options count? 
                                            User asked for "show questions table". I will show options as badges.
                                        */}
                                        <th className="px-6 py-4">Options</th>
                                        <th className="px-6 py-4 w-28 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                                    {questionsList.map((q, idx) => (
                                        <tr key={q._id || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 text-center text-gray-400">{idx + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200 max-w-sm">
                                                <div className="line-clamp-2" title={q.text?.en || Object.values(q.text || {})[0]}>
                                                    {q.text?.en || Object.values(q.text || {})[0]}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold text-xs">
                                                    {String.fromCharCode(65 + (q.correctOption || 0))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {q.options?.map((opt: any, oIdx: number) => (
                                                        <span key={oIdx} className={`px-2 py-0.5 rounded text-[10px] font-medium border
                                                            ${oIdx === q.correctOption
                                                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                                                : 'bg-white border-gray-200 text-gray-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-500'}`}
                                                        >
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(q)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteQuestion(q._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add/Edit Question Modal */}
                <AnimatePresence>
                    {isQuestionModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsQuestionModalOpen(false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                                    <h3 className="text-xl font-bold dark:text-gray-100">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h3>
                                    <button onClick={() => setIsQuestionModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar">
                                    {/* Language Tabs */}
                                    <div className="flex gap-2 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                                        {contestLangs.map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => setActiveLangTab(lang)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLangTab === lang
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                                    }`}
                                            >
                                                {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Marathi'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-gray-500">Question Text ({activeLangTab.toUpperCase()})</label>
                                            <textarea
                                                value={manualQ.text[activeLangTab] || ''}
                                                onChange={e => setManualQ({ ...manualQ, text: { ...manualQ.text, [activeLangTab]: e.target.value } })}
                                                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                                rows={3}
                                                placeholder="Enter question text..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[0, 1, 2, 3].map(optIndex => (
                                                <div key={optIndex}>
                                                    <label className="block text-[10px] font-medium mb-1 text-gray-400">Option {optIndex + 1}</label>
                                                    <input
                                                        type="text"
                                                        value={manualQ.options[optIndex]?.[activeLangTab] || ''}
                                                        onChange={e => {
                                                            const newOpts = [...manualQ.options];
                                                            newOpts[optIndex] = { ...newOpts[optIndex], [activeLangTab]: e.target.value };
                                                            setManualQ({ ...manualQ, options: newOpts });
                                                        }}
                                                        className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-500">Correct Option</label>
                                                <select
                                                    value={manualQ.correctOption}
                                                    onChange={e => setManualQ({ ...manualQ, correctOption: parseInt(e.target.value) })}
                                                    className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm outline-none dark:text-gray-100"
                                                >
                                                    {[0, 1, 2, 3].map(i => <option key={i} value={i}>Option {i + 1}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-500">Explanation (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={manualQ.explanation[activeLangTab] || ''}
                                                    onChange={e => setManualQ({ ...manualQ, explanation: { ...manualQ.explanation, [activeLangTab]: e.target.value } })}
                                                    className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm outline-none dark:text-gray-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900 rounded-b-2xl">
                                    <button
                                        onClick={() => setIsQuestionModalOpen(false)}
                                        className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleManualQuestionSubmit}
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                                    >
                                        {editingQuestionId ? 'Save Changes' : 'Add Question'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* JSON Upload Modal */}
                <AnimatePresence>
                    {isJsonModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsJsonModalOpen(false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                                    <h3 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2"><FileText size={20} className="text-blue-500" /> Bulk Upload</h3>
                                    <button onClick={() => setIsJsonModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-gray-500">Paste your question array below:</p>
                                        <button onClick={copySampleJson} className="text-xs text-blue-600 hover:underline font-medium">Copy Sample JSON</button>
                                    </div>
                                    <textarea
                                        value={jsonInput}
                                        onChange={e => setJsonInput(e.target.value)}
                                        className="w-full h-48 p-4 font-mono text-xs bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 mb-4 dark:text-gray-300 custom-scrollbar resize-none"
                                        placeholder="[{ ... }]"
                                    />
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsJsonModalOpen(false)}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleJsonSubmit}
                                            disabled={!jsonInput.trim() || loading}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Importing...' : 'Import JSON'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <ConfirmationModal
                    isOpen={modal.isOpen}
                    onClose={() => setModal({ ...modal, isOpen: false })}
                    onConfirm={modal.onConfirm}
                    title={modal.title}
                    message={modal.message}
                    type={modal.type}
                    confirmText={modal.confirmText}
                    cancelText={modal.cancelText}
                />
            </div>
        </div>
    );
}
