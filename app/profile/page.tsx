'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Loader2, User, Trophy, AlertTriangle, Shield, Clock, Calendar, LogOut, Lock, RefreshCcw } from 'lucide-react';
import ContestCalendar from '@/components/ContestCalendar';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'success' | 'info';
        confirmText: string;
        cancelText: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => { }
    });

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setUser(data.data);
            } else {
                console.error("Profile fetch failed:", data.error);
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login');
                } else {
                    alert(`Failed to load profile: ${data.error}`);
                }
            }
        } catch (err) {
            console.error("Profile fetch network error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const canLeave = (startTime: string) => {
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        const hoursDiff = (start - now) / (1000 * 60 * 60);
        return hoursDiff >= 24;
    };

    const handleLeaveClick = (contestId: string, contestTitle: string, startTime: string) => {
        if (!canLeave(startTime)) {
            setModalConfig({
                isOpen: true,
                title: 'Cannot Leave Contest',
                message: 'You cannot leave a contest less than 24 hours before it starts.',
                type: 'warning',
                confirmText: 'Got it',
                cancelText: '',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        setModalConfig({
            isOpen: true,
            title: 'Leave Contest?',
            message: `Are you sure you want to leave "${contestTitle}"? Your spot will be released.`,
            type: 'danger',
            confirmText: 'Yes, Leave',
            cancelText: 'Cancel',
            onConfirm: () => executeLeave(contestId)
        });
    };

    const executeLeave = async (contestId: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`/api/contest/${contestId}/leave`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                // Update local state
                setUser((prev: any) => ({
                    ...prev,
                    joinedContests: prev.joinedContests.filter((c: any) => c._id !== contestId)
                }));
                // Optional: success toast or alert
            } else {
                setModalConfig({
                    isOpen: true,
                    title: 'Error',
                    message: data.error || 'Failed to leave contest',
                    type: 'danger',
                    confirmText: 'Close',
                    cancelText: '',
                    onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                });
            }
        } catch (error) {
            console.error('Leave error:', error);
            alert('Something went wrong');
        }
    };

    // Calendar State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'current' | 'next'>('current');

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    const getFilteredContests = () => {
        if (!user || !user.joinedContests) return [];

        const targetDate = new Date(selectedDate);
        if (activeTab === 'next') {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        return user.joinedContests.filter((contest: any) => {
            const contestDate = new Date(contest.startTime);
            return isSameDay(contestDate, targetDate);
        });
    };

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const filteredContests = getFilteredContests();

    // Get dates with contests for calendar highlighting
    const contestDates = user?.joinedContests?.map((c: any) => c.startTime) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans pb-20">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 md:pt-28 pb-8 max-w-6xl">
                {/* Header Profile Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-zinc-800 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    {/* Refresh Button */}


                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-xl shadow-blue-500/30 ring-4 ring-white dark:ring-zinc-900">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        {user.isVerified && (
                            <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full ring-4 ring-white dark:ring-zinc-900" title="Verified User">
                                <Shield size={16} fill="currentColor" />
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left flex-1 relative z-10 w-full">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white capitalize truncate max-w-[250px] md:max-w-none mx-auto md:mx-0">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{user.mobile}</p>
                                {user.email && <p className="text-sm text-gray-400 dark:text-gray-500">{user.email}</p>}

                                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                                    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800/50">
                                        {user.role}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${user.isVerified || user.status === 'active'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/50'
                                        : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800/50'
                                        }`}>
                                        {user.isVerified ? 'Verified' : user.status}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Grid & Refresh - Mobile Optimized */}
                            <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto mt-6 md:mt-0">
                                <button
                                    onClick={fetchProfile}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-zinc-700 rounded-lg transition-all active:scale-95"
                                    title="Refresh Profile"
                                >
                                    <RefreshCcw size={14} className={loading && user ? "animate-spin" : ""} />
                                    <span>Refresh Profile</span>
                                </button>

                                <div className="grid grid-cols-3 gap-3 w-full">
                                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 md:p-4 rounded-xl text-center border border-gray-100 dark:border-zinc-700/50 min-w-[80px]">
                                        <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{user.stats?.level || 1}</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Level</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 md:p-4 rounded-xl text-center border border-gray-100 dark:border-zinc-700/50 min-w-[80px]">
                                        <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-500">{user.stats?.bestScore || 0}</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Score</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 md:p-4 rounded-xl text-center border border-gray-100 dark:border-zinc-700/50 min-w-[80px]">
                                        <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-500">{user.stats?.totalContentAttended || 0}</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Contests</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warnings Section */}
                {user.warningCount > 0 && (
                    <div className="mb-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                            <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-700 dark:text-red-400">Account Warning</h3>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1 leading-relaxed">
                                You have {user.warningCount} active warning(s). Please follow the community guidelines to avoid suspension.
                            </p>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Contests - Left / Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={20} /> Joined Contests
                            </h2>

                            {/* Tabs */}
                            <div className="bg-gray-100 dark:bg-zinc-800/50 p-1 rounded-xl flex">
                                <button
                                    onClick={() => setActiveTab('current')}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'current'
                                        ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    <span className="ml-1 text-xs opacity-70">(Today)</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('next')}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'next'
                                        ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    <span className="ml-1 text-xs opacity-70">(Next)</span>
                                </button>
                            </div>
                        </div>

                        {filteredContests && filteredContests.length > 0 ? (
                            <div className="space-y-4">
                                {filteredContests.map((contest: any) => {
                                    const isLeaveable = canLeave(contest.startTime);
                                    const isCompleted = user.completedContests?.includes(contest._id);

                                    const now = new Date().getTime();
                                    const start = new Date(contest.startTime).getTime();
                                    const end = new Date(contest.endTime).getTime();

                                    let status = 'Pending';
                                    let buttonText = 'Starts Soon';
                                    let buttonAction = () => { };
                                    let buttonStyle = 'bg-gray-200 text-gray-500 cursor-not-allowed';
                                    let statusColor = 'bg-yellow-100 text-yellow-700';

                                    if (isCompleted) {
                                        status = 'Completed';
                                        buttonText = 'View Ranking';
                                        buttonAction = () => router.push(`/contest/${contest._id}/result`); // Updated link for ranking
                                        buttonStyle = 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20';
                                        statusColor = 'bg-green-100 text-green-700';
                                    } else if (contest.status === 'Completed') {
                                        status = 'Completed';
                                        buttonText = 'View Ranking';
                                        buttonAction = () => router.push(`/contest/${contest._id}/result`);
                                        buttonStyle = 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20';
                                        statusColor = 'bg-green-100 text-green-700';
                                    } else if (contest.status === 'Active') {
                                        status = 'Active';
                                        buttonText = 'Start Test';
                                        buttonAction = () => router.push(`/contest/${contest._id}/live`);
                                        buttonStyle = 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 animate-pulse';
                                        statusColor = 'bg-blue-100 text-blue-700';
                                    } else if (now > end && contest.status !== 'Upcoming') {
                                        status = 'Expired';
                                        buttonText = 'Missed';
                                        buttonAction = () => { };
                                        buttonStyle = 'bg-red-100 text-red-500 cursor-not-allowed';
                                        statusColor = 'bg-red-100 text-red-700';
                                    } else if (now >= start && now <= end) {
                                        status = 'Active';
                                        buttonText = 'Start Test';
                                        buttonAction = () => router.push(`/contest/${contest._id}/live`);
                                        buttonStyle = 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 animate-pulse';
                                        statusColor = 'bg-blue-100 text-blue-700';
                                    }

                                    return (
                                        <div key={contest._id} className={`group bg-white dark:bg-zinc-900 p-4 md:p-5 rounded-2xl border transition-all duration-300 ${isCompleted ? 'border-green-200 dark:border-green-900/30' : 'border-gray-200 dark:border-zinc-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 shadow-sm hover:shadow-md'}`}>
                                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                                <div className="space-y-2">
                                                    <div className="space-y-3 w-full">
                                                        <div className="flex items-start justify-between md:justify-start gap-3">
                                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {contest.title}
                                                            </h3>
                                                            {/* Mobile Status Badge */}
                                                            <span className={`md:hidden px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${statusColor}`}>
                                                                {status}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 pr-4 hidden md:block">
                                                            {contest.description}
                                                        </p>

                                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar size={14} className="text-gray-400" />
                                                                {new Date(contest.startTime).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={14} className="text-gray-400" />
                                                                {contest.duration} min
                                                            </span>
                                                            {contest.difficulty && (
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${contest.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800' :
                                                                        contest.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800' :
                                                                            'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800'
                                                                    }`}>
                                                                    {contest.difficulty}
                                                                </span>
                                                            )}
                                                            {contest.category && (
                                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[10px] font-bold uppercase tracking-wide border border-gray-200 dark:border-zinc-700">
                                                                    {contest.category}
                                                                </span>
                                                            )}
                                                            {contest.slots && (
                                                                <span className="flex items-center gap-1.5 text-xs">
                                                                    {contest.slots} Slots
                                                                </span>
                                                            )}

                                                            {!isCompleted && now < start && (
                                                                <span className="flex items-center gap-1.5 text-orange-500 font-medium ml-auto md:ml-0">
                                                                    <Clock size={14} />
                                                                    Starts in {Math.ceil((start - now) / (1000 * 60 * 60))}h
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-zinc-800 mt-2 md:mt-0">
                                                    <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor}`}>
                                                        {status}
                                                    </span>

                                                    <div className="flex gap-2">
                                                        {/* Leave Button - Only if Pending */}
                                                        {status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleLeaveClick(contest._id, contest.title, contest.startTime)}
                                                                className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center
                                                                ${isLeaveable
                                                                        ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10'
                                                                        : 'border-gray-200 text-gray-400 cursor-not-allowed dark:border-zinc-700 dark:text-zinc-600'
                                                                    }`}
                                                                title={isLeaveable ? "Leave Contest" : "Cannot leave within 24h of start"}
                                                            >
                                                                {isLeaveable ? <LogOut size={18} /> : <Lock size={18} />}
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={buttonAction}
                                                            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors active:scale-95 shadow-lg ${buttonStyle}`}
                                                            disabled={status === 'Pending' || status === 'Expired'}
                                                        >
                                                            {buttonText}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 p-12 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 text-center animate-in fade-in zoom-in-50 duration-300">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="text-gray-400 dark:text-zinc-500" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Contests for {activeTab === 'current' ? 'Selected Date' : 'Next Day'}</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                                    There are no contests scheduled for {activeTab === 'current' ? selectedDate.toLocaleDateString() : nextDate.toLocaleDateString()}.
                                </p>
                                <button
                                    onClick={() => router.push('/contest')}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    Browse All Contests
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        {/* Calendar Component */}
                        <ContestCalendar
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            highlightDates={contestDates}
                        />

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={18} /> Account Details
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-zinc-800">
                                    <span className="text-gray-500">Member Since</span>
                                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-zinc-800">
                                    <span className="text-gray-500">Last Active</span>
                                    <span className="font-medium text-green-600">Now</span>
                                </div>

                                <div className="pt-4 bg-blue-50 dark:bg-blue-900/10 -mx-6 -mb-6 p-6 mt-4">
                                    <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 text-xs uppercase tracking-wide">Pro Tip</h4>
                                    <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                                        Complete more contests to increase your level and unlock exclusive badges. Your consistency builds your trust score.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />
        </div >
    );

}
