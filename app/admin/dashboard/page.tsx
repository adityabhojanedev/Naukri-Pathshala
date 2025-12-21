'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Users, Shield, AlertTriangle, CheckCircle, XCircle,
    Search, MoreVertical, LogOut, Clock, Filter, Trophy, ChevronDown, ChevronUp,
    Plus, Trash2, Pencil, List, BarChart2, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface UserStats {
    totalContentAttended: number;
    bestScore: number;
    level: number;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email?: string;
    role: 'user' | 'moderator' | 'admin';
    isVerified: boolean;
    warningCount: number;
    suspensionEndDate?: string;
    isBanned: boolean;
    status: string;
    createdAt: string;
    stats?: UserStats;
}

// Dummy Contests Data
const dummyContests = [
    { id: 1, title: 'Weekly Coding Challenge', date: '2025-01-10', participants: 120, status: 'Upcoming' },
    { id: 2, title: 'Design Sprint 2024', date: '2024-12-25', participants: 45, status: 'Active' },
    { id: 3, title: 'Algorithm Global Test', date: '2024-12-15', participants: 300, status: 'Completed' },
];

export default function AdminDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [activeTab, setActiveTab] = useState<'users' | 'contests'>('users');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'contests') setActiveTab('contests');
        else if (tab === 'users') setActiveTab('users');
    }, [searchParams]);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'danger' | 'warning' | 'success',
        onConfirm: () => { },
        confirmText: 'Confirm'
    });

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        if (!adminUser) {
            router.push('/admin/login');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                // Add dummy stats for demonstration
                const usersWithStats = data.data.map((user: User) => ({
                    ...user,
                    stats: {
                        totalContentAttended: Math.floor(Math.random() * 100),
                        bestScore: Math.floor(Math.random() * 1000),
                        level: Math.floor(Math.random() * 10) + 1,
                    }
                }));
                setUsers(usersWithStats);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (id: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error('Failed to update role', error);
        }
    };

    const confirmVerifyToggle = (user: User) => {
        setModal({
            isOpen: true,
            title: user.isVerified ? 'Unverify User' : 'Verify User',
            message: `Are you sure you want to ${user.isVerified ? 'revoke verification for' : 'verify'} ${user.firstName} ${user.lastName}?`,
            type: user.isVerified ? 'warning' : 'success',
            confirmText: user.isVerified ? 'Unverify' : 'Verify',
            onConfirm: () => {
                handleVerifyToggle(user._id, user.isVerified);
                setModal({ ...modal, isOpen: false });
            }
        });
    };

    const handleVerifyToggle = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: !currentStatus }),
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error('Failed to update verification', error);
        }
    };

    const confirmWarn = (user: User) => {
        const nextWarningCount = (user.warningCount || 0) + 1;
        let consequence = "This will increment their warning count.";
        if (nextWarningCount === 2) consequence = "This will SUSPEND the user for 3 days.";
        if (nextWarningCount >= 3) consequence = "This will BAN the user for 1 month.";

        setModal({
            isOpen: true,
            title: 'Issue Warning',
            message: `Are you sure you want to warn ${user.firstName}? ${consequence}`,
            type: 'danger',
            confirmText: 'Issue Warning',
            onConfirm: () => {
                handleWarn(user._id);
                setModal({ ...modal, isOpen: false });
            }
        });
    };

    const handleWarn = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/users/${id}/warn`, {
                method: 'POST',
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error('Failed to warn user', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile?.includes(searchTerm);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getStatusBadge = (user: User) => {
        if (user.isBanned) return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium border border-red-200 dark:border-red-800">Banned</span>;
        if (user.suspensionEndDate && new Date(user.suspensionEndDate) > new Date()) {
            return <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-800">Suspended</span>;
        }
        if (user.isVerified) return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">Verified</span>;
        return <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-200 dark:border-zinc-700">Active</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Modal */}
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText={modal.confirmText}
            />

            {/* Navbar */}
            <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-opacity-90">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-blue-600 dark:bg-blue-500 p-1.5 md:p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
                        <Shield size={18} className="md:w-5 md:h-5" />
                    </div>
                    <h1 className="text-lg md:text-xl font-bold tracking-tight">Admin<span className="text-blue-600 dark:text-blue-500">Panel</span></h1>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <ThemeToggle />
                    <button onClick={handleLogout} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-red-600 hover:text-red-700 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all font-medium">
                        <LogOut size={14} className="md:w-4 md:h-4" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-4 md:p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Dashboard</h2>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Manage users, roles, warnings, and contests.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-x-auto max-w-full no-scrollbar">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('contests')}
                            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'contests' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Contests
                        </button>
                    </div>
                </div>

                {activeTab === 'users' ? (
                    <>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                            {/* Filter Controls */}
                            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="relative min-w-[160px]">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="pl-10 pr-8 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer w-full transition-all shadow-sm"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="user">User</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className="bg-gray-50/50 dark:bg-zinc-800/20 border-b border-gray-200 dark:border-zinc-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Info</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Warnings</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                        {loading ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Loading users...</td></tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No users found.</td></tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <Fragment key={user._id}>
                                                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => toggleRow(user._id)}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                                        {user.firstName} {user.lastName}
                                                                        {expandedRows.has(user._id) ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.mobile}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td onClick={e => e.stopPropagation()} className="px-6 py-4">
                                                            <div className="relative group/select inline-block">
                                                                <select
                                                                    value={user.role}
                                                                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                                    className="bg-transparent text-sm border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus:border-blue-500 rounded px-2 py-1 cursor-pointer font-medium text-blue-600 dark:text-blue-400 transition-all outline-none appearance-none pr-6"
                                                                >
                                                                    <option value="user">User</option>
                                                                    <option value="moderator">Moderator</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                                {/* <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none opacity-0 group-hover/select:opacity-100 transition-opacity" /> */}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {getStatusBadge(user)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {Array.from({ length: 3 }).map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i < user.warningCount ? 'bg-red-500 scale-110 shadow-sm shadow-red-500/50' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td onClick={e => e.stopPropagation()} className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => confirmVerifyToggle(user)}
                                                                    title={user.isVerified ? "Unverify User" : "Verify User"}
                                                                    className={`p-2 rounded-lg transition-all active:scale-95 ${user.isVerified
                                                                        ? 'text-green-600 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20'
                                                                        : 'text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                                                        }`}
                                                                >
                                                                    {user.isVerified ? <CheckCircle size={18} /> : <CheckCircle size={18} className="opacity-70" />}
                                                                </button>

                                                                <button
                                                                    onClick={() => confirmWarn(user)}
                                                                    disabled={user.isBanned}
                                                                    title="Warn User"
                                                                    className={`p-2 rounded-lg transition-all active:scale-95 ${user.isBanned
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'text-orange-500 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                                                                        }`}
                                                                >
                                                                    <AlertTriangle size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Stats Row */}
                                                    <AnimatePresence>
                                                        {expandedRows.has(user._id) && (
                                                            <motion.tr
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="bg-gray-50/50 dark:bg-zinc-900/50 overflow-hidden"
                                                            >
                                                                <td colSpan={5} className="px-6 py-0">
                                                                    <div className="py-4 grid grid-cols-3 gap-4 max-w-2xl text-sm">
                                                                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm flex flex-col items-center text-center">
                                                                            <span className="text-gray-400 font-medium mb-1">Current Level</span>
                                                                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">{user.stats?.level || 0}</span>
                                                                        </div>
                                                                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm flex flex-col items-center text-center">
                                                                            <span className="text-gray-400 font-medium mb-1">Best Score</span>
                                                                            <span className="text-2xl font-bold text-green-600 dark:text-green-500">{user.stats?.bestScore || 0}</span>
                                                                        </div>
                                                                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm flex flex-col items-center text-center">
                                                                            <span className="text-gray-400 font-medium mb-1">Content Attended</span>
                                                                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-500">{user.stats?.totalContentAttended || 0}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        )}
                                                    </AnimatePresence>
                                                </Fragment>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Contests Tab */
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 sticky left-0">
                            <h3 className="font-bold text-base md:text-lg">Contest Management</h3>
                            <button
                                onClick={() => router.push('/admin/contests/create')}
                                className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-1"
                            >
                                <Plus size={16} /> <span className="hidden md:inline">Create New</span><span className="md:hidden">New</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <ContestList />
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}

function ContestList() {
    const router = useRouter();
    const [contests, setContests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'danger' | 'warning' | 'success',
        onConfirm: () => { },
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    useEffect(() => {
        fetch('/api/admin/contests')
            .then(res => res.json())
            .then(data => {
                if (data.success) setContests(data.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = (contestId: string) => {
        setModal({
            isOpen: true,
            title: 'Delete Contest',
            message: 'Are you sure you want to delete this contest? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: async () => {
                // Optimistic Update
                setContests(c => c.filter(x => x._id !== contestId));
                try {
                    await fetch(`/api/admin/contests/${contestId}`, { method: 'DELETE' });
                } catch (error) {
                    console.error('Failed to delete', error);
                }
            }
        });
    };

    return (
        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50/50 dark:bg-zinc-800/20 border-b border-gray-200 dark:border-zinc-800">
                    <tr>
                        <th className="px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contest Name</th>
                        <th className="px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start Time</th>
                        <th className="px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    <AnimatePresence>
                        {contests.length === 0 ? (
                            !loading && (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No contests found. Create one.</td>
                                </motion.tr>
                            )
                        ) : (
                            contests.map((contest, index) => (
                                <motion.tr
                                    key={contest._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors group"
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                                                <Trophy size={18} />
                                            </div>
                                            {contest.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(contest.startTime).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{contest.duration}m</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{contest.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${contest.status === 'Active'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : contest.status === 'Upcoming'
                                                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700'
                                            }`}>
                                            {contest.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-gray-400">
                                            <button
                                                onClick={() => router.push(`/admin/contests/${contest._id}/questions`)}
                                                className="p-2 text-purple-600 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all active:scale-95"
                                                title="Manage Questions"
                                            >
                                                <List size={16} />
                                            </button>
                                            <button
                                                onClick={() => router.push(`/admin/contests/${contest._id}/leaderboard`)}
                                                className="p-2 text-amber-600 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-all active:scale-95"
                                                title="Leaderboard"
                                            >
                                                <BarChart2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => router.push(`/admin/contests/${contest._id}/edit`)}
                                                className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all active:scale-95"
                                                title="Edit Contest Settings"
                                            >
                                                <Settings size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contest._id)}
                                                className="p-2 text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all active:scale-95"
                                                title="Delete Contest"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </AnimatePresence>
                </tbody>
            </table>
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
