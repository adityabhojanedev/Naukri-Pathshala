
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, HelpCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle className="text-red-500" size={32} />;
            case 'warning': return <AlertTriangle className="text-orange-500" size={32} />;
            case 'success': return <CheckCircle className="text-green-500" size={32} />;
            default: return <HelpCircle className="text-blue-500" size={32} />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning': return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
            case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        {/* Modal Content */}
                        <motion.div
                            key={title + type}
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 dark:border-zinc-800 overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-6 text-center">
                                <div className="mb-4 flex justify-center bg-gray-50 dark:bg-zinc-800/50 w-16 h-16 rounded-full items-center mx-auto">
                                    {getIcon()}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {title}
                                </h3>

                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                    {message}
                                </p>

                                <div className="flex gap-3 justify-end">
                                    {cancelText && (
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                                        >
                                            {cancelText}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { onConfirm(); onClose(); }}
                                        className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors shadow-lg ${getButtonColor()}`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
