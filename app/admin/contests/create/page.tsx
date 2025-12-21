
'use client';

import ContestWizard from '@/components/admin/ContestWizard';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateContestPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push('/admin/dashboard?tab=contests')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-6 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back to Dashboard
                </button>

                <h1 className="text-2xl font-bold mb-8">Create New Contest</h1>

                <ContestWizard />
            </div>
        </div>
    );
}
