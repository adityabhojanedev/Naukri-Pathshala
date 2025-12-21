"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-background border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />

                        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <ShieldAlert className="w-8 h-8 text-yellow-500" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight">Verification Pending</h3>
                                <p className="text-muted-foreground">
                                    Your joining request has been sent successfully!
                                </p>
                            </div>

                            <div className="bg-secondary/50 p-4 rounded-xl text-sm text-left w-full space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-zinc-600 dark:text-zinc-400">Account created successfully</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                    </div>
                                    <span className="text-zinc-600 dark:text-zinc-400">Waiting for admin approval</span>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Please wait for a few hours for verification. <br />
                                In case of urgency, contact: <span className="text-primary font-medium">admin@gmail.com</span>
                            </p>

                            <Button onClick={onClose} className="w-full">
                                Got it
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
