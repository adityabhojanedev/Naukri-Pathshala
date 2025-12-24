'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trophy, Search, AlertTriangle, Trash2, Edit2, ShieldAlert, Save, X, Loader2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';


interface LeaderboardEntry {
    _id: string; // Result ID
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    score: number;
    submittedAt: string;
    stats: {
        correct: number;
        wrong: number;
        skipped: number;
    };
    didNotAttend?: boolean;
    warningLabels?: string[];
}

export default function AdminLeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [contestId, setContestId] = useState<string>('');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string | React.ReactNode;
        type: 'danger' | 'warning' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const [editingScore, setEditingScore] = useState<{ id: string, score: number } | null>(null);

    useEffect(() => {
        params.then(p => {
            setContestId(p.id);
            fetchLeaderboard(p.id);
        });
    }, [params]);

    const fetchLeaderboard = async (id: string) => {
        try {
            const res = await fetch(`/api/contest/${id}/ranking`);
            const data = await res.json();
            if (data.success) {
                setLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWarnUser = (user: { _id: string, firstName: string, lastName: string }) => {
        setModalConfig({
            isOpen: true,
            title: 'Issue Warning',
            message: `Are you sure you want to warn ${user.firstName} ${user.lastName}? This will increase their warning count.`,
            type: 'warning',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/users/${user._id}/warn`, { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                    } else {
                        setModalConfig({
                            isOpen: true,
                            title: 'Error',
                            message: data.error || 'Failed to warn user',
                            type: 'danger',
                            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
    };

    const handleDeleteResult = (resultId: string, userName: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Entry',
            message: `Are you sure you want to remove ${userName} from the leaderboard? This action cannot be undone.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/results/${resultId}?contestId=${contestId}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        setLeaderboard(prev => prev.filter(item => item._id !== resultId));
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                    } else {
                        setModalConfig({
                            isOpen: true,
                            title: 'Error',
                            message: data.error || 'Failed to delete result',
                            type: 'danger',
                            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
    };

    const handleViewWarnings = (user: { firstName: string, lastName: string }, warnings: string[]) => {
        setModalConfig({
            isOpen: true,
            title: `Warnings for ${user.firstName}`,
            message: (
                <div className="text-left w-full bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 max-h-60 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {warnings.map((w, i) => (
                            <li key={i} className="leading-snug">{w}</li>
                        ))}
                    </ul>
                </div>
            ),
            type: 'warning',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    const handleSaveScore = async () => {
        if (!editingScore) return;
        try {
            const res = await fetch(`/api/admin/results/${editingScore.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: Number(editingScore.score) })
            });
            const data = await res.json();
            if (data.success) {
                setLeaderboard(prev => prev.map(item => item._id === editingScore.id ? { ...item, score: Number(editingScore.score) } : item));
                setEditingScore(null);
            } else {
                setModalConfig({
                    isOpen: true,
                    title: 'Error',
                    message: data.error || 'Failed to update score',
                    type: 'danger',
                    onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredLeaderboard = leaderboard.filter(entry =>
        entry.userId?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userId?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button onClick={() => router.push('/admin/dashboard?tab=contests')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-2 transition-colors">
                            <ChevronLeft size={16} /> Back to Dashboard
                        </button>
                        <h1 className="text-2xl font-bold dark:text-gray-100 flex items-center gap-2">
                            <Trophy className="text-yellow-500" /> Manage Contest Leaderboard
                        </h1>
                        <p className="text-gray-500 text-sm">Contest ID: {contestId}</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Score</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Submitted At</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {filteredLeaderboard.length > 0 ? filteredLeaderboard.map((entry, index) => (
                                    <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${index + 1 === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                    index + 1 === 2 ? 'bg-gray-200 text-gray-700' :
                                                        index + 1 === 3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium dark:text-gray-200">
                                            {entry.userId?.firstName} {entry.userId?.lastName}
                                            {entry.didNotAttend && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/20">
                                                    <AlertTriangle size={12} /> Absent
                                                </span>
                                            )}
                                            {/* @ts-ignore */}
                                            {entry.warningLabels && entry.warningLabels.length > 0 && (
                                                <button
                                                    onClick={() => handleViewWarnings(entry.userId, entry.warningLabels!)}
                                                    className="ml-2 inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                                                    title="View Warning Log"
                                                >
                                                    <AlertTriangle size={12} /> {entry.warningLabels.length} Warnings
                                                </button>
                                            )}
                                        </td>

                                        {/* Editable Score Cell */}
                                        <td className="px-6 py-4 text-right">
                                            {/* @ts-ignore */}
                                            {entry.didNotAttend ? (
                                                <span className="text-gray-400">-</span>
                                            ) : editingScore?.id === entry._id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <input
                                                        type="number"
                                                        value={editingScore.score}
                                                        onChange={(e) => setEditingScore({ ...editingScore, score: Number(e.target.value) })}
                                                        className="w-20 px-2 py-1 text-right text-sm border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                                        autoFocus
                                                    />
                                                    <button onClick={handleSaveScore} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={16} /></button>
                                                    <button onClick={() => setEditingScore(null)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <span className="font-bold text-green-600 cursor-pointer hover:underline" onClick={() => setEditingScore({ id: entry._id, score: entry.score })}>
                                                    {entry.score}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right text-gray-500 text-sm">
                                            {/* @ts-ignore */}
                                            {entry.didNotAttend ? (
                                                <span className="text-gray-400 italic">Not Submitted</span>
                                            ) : new Date(entry.submittedAt).toLocaleTimeString()}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {!entry.didNotAttend && (
                                                    <button
                                                        onClick={() => setEditingScore({ id: entry._id, score: entry.score })}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                        title="Edit Score"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleWarnUser(entry.userId)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors"
                                                    title="Warn User"
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResult(entry._id, `${entry.userId?.firstName} ${entry.userId?.lastName}`)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                    title="Remove from Leaderboard"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No results found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText="Confirm"
                cancelText="Cancel"
            />
        </div>
    );
}
