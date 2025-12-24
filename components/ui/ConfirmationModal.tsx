
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, AlertOctagon } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
    type?: 'danger' | 'warning' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
    autoClose?: boolean;
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", duration: 0.4, bounce: 0.3 } as any
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.2 }
    }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    autoClose = true
}: ConfirmationModalProps) {

    const getConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertOctagon size={32} className="text-red-600 dark:text-red-500" />,
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-100 dark:border-red-900/30',
                    btn: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
                    iconBg: 'bg-red-100 dark:bg-red-900/30'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={32} className="text-orange-600 dark:text-orange-500" />,
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    border: 'border-orange-100 dark:border-orange-900/30',
                    btn: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20',
                    iconBg: 'bg-orange-100 dark:bg-orange-900/30'
                };
            case 'success':
                return {
                    icon: <CheckCircle size={32} className="text-green-600 dark:text-green-500" />,
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-100 dark:border-green-900/30',
                    btn: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20',
                    iconBg: 'bg-green-100 dark:bg-green-900/30'
                };
            case 'info':
            default:
                return {
                    icon: <Info size={32} className="text-blue-600 dark:text-blue-500" />,
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-100 dark:border-blue-900/30',
                    btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
                    iconBg: 'bg-blue-100 dark:bg-blue-900/30'
                };
        }
    };

    const config = getConfig();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Decoration */}
                        <div className={`h-2 w-full ${config.btn.split(' ')[0]}`} />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${config.iconBg} ring-8 ring-opacity-50 ${config.bg}`}>
                                    {config.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                    {title}
                                </h3>

                                <div className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8 max-w-sm">
                                    {message}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 w-full">
                                    {cancelText && (
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
                                        >
                                            {cancelText}
                                        </button>
                                    )}
                                    {confirmText && (
                                        <button
                                            onClick={() => {
                                                onConfirm();
                                                if (autoClose) onClose();
                                            }}
                                            className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] ${config.btn}`}
                                        >
                                            {confirmText}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
