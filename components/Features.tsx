"use client";

import { useLanguage } from "./LanguageContext";
import { Trophy, BookOpen, BarChart3, CheckCircle2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export default function Features() {
    const { t } = useLanguage();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const features = [
        {
            icon: BarChart3,
            title: t("feature1Title"),
            desc: t("feature1Desc"),
            className: "md:col-span-2",
            gradient: "from-blue-500/20 to-cyan-500/20",
        },
        {
            icon: BookOpen,
            title: t("feature2Title"),
            desc: t("feature2Desc"),
            className: "md:col-span-1",
            gradient: "from-green-500/20 to-emerald-500/20",
        },
        {
            icon: Trophy,
            title: t("feature3Title"),
            desc: t("feature3Desc"),
            className: "md:col-span-3",
            gradient: "from-yellow-500/20 to-orange-500/20",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut" as any,
            },
        },
    };

    return (
        <section id="features" className="py-24 bg-secondary/20 dark:bg-black">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Powerful Features
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                    >
                        {t("featuresTitle")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg leading-relaxed"
                    >
                        {t("featuresSubtitle")}
                    </motion.p>
                </div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl border border-border bg-background p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300",
                                feature.className
                            )}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10 flex flex-col items-start gap-4">
                                <div className="p-3 rounded-2xl bg-secondary group-hover:bg-background/80 transition-colors shadow-sm">
                                    <feature.icon className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed max-w-lg">
                                        {feature.desc}
                                    </p>
                                </div>

                                <div className="pt-4 mt-auto">
                                    <ul className="space-y-2">
                                        {[1, 2].map(i => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                                <span>Feature benefit point {i}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
