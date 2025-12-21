'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';

interface ContestFormData {
    title: string;
    description: string;
    instructions: string;
    startTime: string;
    endTime: string;
    duration: number;
    category: string;
    difficulty: string;
    slots: number;
    timePerQuestion: number;
    supportedLanguages: string[];
    status: string;
}

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' },
];

const SUGGESTED_CATEGORIES = ['SSC GD', 'SSC MTS', 'Police', 'DRDO', 'RRB', 'Banking', 'UPSC', 'Railways', 'Coding'];

export default function ContestWizard({ existingContestId }: { existingContestId?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [contestId, setContestId] = useState<string | null>(existingContestId || null);

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

    // Form Data
    const [formData, setFormData] = useState<ContestFormData>({
        title: '',
        description: '',
        instructions: '',
        startTime: '',
        endTime: '',
        duration: 60,
        category: '',
        difficulty: 'Medium',
        slots: 100,
        timePerQuestion: 60,
        supportedLanguages: ['en'],
        status: 'Draft'
    });

    // Safe Date Parser
    const formatDateForInput = (dateString: string | undefined) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().slice(0, 16);
        } catch (e) {
            console.error('Date parsing error', dateString, e);
            return '';
        }
    };

    useEffect(() => {
        if (existingContestId) {
            setLoading(true);
            fetch(`/api/admin/contests/${existingContestId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const c = data.data;
                        setFormData({
                            title: c.title || '',
                            description: c.description || '',
                            instructions: c.instructions || '',
                            startTime: formatDateForInput(c.startTime),
                            endTime: formatDateForInput(c.endTime),
                            duration: c.duration || 60,
                            category: c.category || '',
                            difficulty: c.difficulty || 'Medium',
                            slots: c.slots || 100,
                            timePerQuestion: c.timePerQuestion || 60,
                            supportedLanguages: c.supportedLanguages || ['en'],
                            status: c.status || 'Draft'
                        });
                        setContestId(c._id);
                    } else {
                        showModal('Error', data.error || 'Failed to fetch contest details', 'danger');
                    }
                })
                .catch(err => {
                    showModal('Error', `Failed to load contest: ${err.message}`, 'danger');
                })
                .finally(() => setLoading(false));
        }
    }, [existingContestId]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.supportedLanguages.length < 2) {
            showModal('Validation Error', 'Please select at least 2 supported languages.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const url = contestId ? `/api/admin/contests/${contestId}` : '/api/admin/contests';
            const method = contestId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                showModal('Success', `Contest ${contestId ? 'updated' : 'created'} successfully!`, 'success', () => {
                    router.push('/admin/dashboard?tab=contests');
                });
                // Also auto redirect after a moment
                setTimeout(() => router.push('/admin/dashboard?tab=contests'), 1500);
            } else {
                showModal('Error', data.error, 'danger');
            }
        } catch (error) {
            showModal('Error', 'Failed to save contest', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleLangToggle = (code: string) => {
        setFormData(prev => {
            const langs = prev.supportedLanguages.includes(code)
                ? prev.supportedLanguages.filter(l => l !== code)
                : [...prev.supportedLanguages, code];
            return { ...prev, supportedLanguages: langs };
        });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold dark:text-gray-100">{contestId ? 'Edit Contest' : 'Create New Contest'}</h2>
                <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard?tab=contests')}
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 text-sm flex items-center gap-1"
                >
                    <ChevronLeft size={16} /> Cancel
                </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Contest Title</label>
                        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" placeholder="e.g. Weekly Coding Master" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Description</label>
                        <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none h-20 md:h-24 text-sm transition-all resize-none" placeholder="Brief description..." />
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Start Time</label>
                        <input type="datetime-local" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">End Time</label>
                        <input type="datetime-local" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Duration (m)</label>
                            <input type="number" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Slots</label>
                            <input type="number" required value={formData.slots} onChange={e => setFormData({ ...formData, slots: parseInt(e.target.value) })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Category</label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                            placeholder="Type or select category..."
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {SUGGESTED_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`px-3 py-1 text-xs rounded-full border transition-all ${formData.category === cat
                                        ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Difficulty</label>
                        <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all appearance-none">
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Status</label>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all appearance-none">
                            <option value="Draft">Draft (Hidden)</option>
                            <option value="Active">Active</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Supported Languages</label>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => handleLangToggle(lang.code)}
                                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${formData.supportedLanguages.includes(lang.code)
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-500 mt-2">At least 2 languages required.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg transition-all flex items-center gap-2">
                        {loading ? 'Saving...' : <><Save size={18} /> Save & Return to Dashboard</>}
                    </button>
                </div>
            </form>

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
    );
}
