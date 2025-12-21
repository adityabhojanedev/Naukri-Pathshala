"use client";

import { useLanguage } from "./LanguageContext";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Play, Database, Cloud, Code2, Globe } from "lucide-react";

export default function Hero() {
    const { t } = useLanguage();

    return (
        <section className="relative overflow-hidden min-h-[100dvh] flex items-center justify-center py-20 md:py-32">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            {t("heroBadge")}
                        </span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
                            {t("heroTitle").split(' ').map((word, i) => (
                                <span key={i} className="inline-block mr-2 md:mr-4 last:mr-0">
                                    {i % 2 === 0 ? (
                                        word
                                    ) : (
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">
                                            {word}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                        {t("heroSubtitle")}
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-8"
                    >
                        <Button
                            size="lg"
                            className="rounded-full px-10 h-14 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white border-0"
                            asChild
                        >
                            <Link href="/contest" className="flex items-center gap-2">
                                <Play className="w-5 h-5 mr-2 fill-current" />
                                {t("viewContest")}
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Trusted By Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                    className="mt-28 border-t border-border/40 pt-12"
                >
                    <p className="text-sm text-center text-muted-foreground mb-8 font-medium uppercase tracking-wider opacity-60">Trusted by top learners from</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 contrast-0 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-2 text-xl font-bold dark:text-white text-zinc-900"><Database className="text-blue-500" /> DataCorp</div>
                        <div className="flex items-center gap-2 text-xl font-bold dark:text-white text-zinc-900"><Cloud className="text-indigo-500" /> CloudSys</div>
                        <div className="flex items-center gap-2 text-xl font-bold dark:text-white text-zinc-900"><Code2 className="text-green-500" /> DevStudio</div>
                        <div className="flex items-center gap-2 text-xl font-bold dark:text-white text-zinc-900"><Globe className="text-purple-500" /> GlobalTech</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
