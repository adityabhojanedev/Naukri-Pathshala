"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { useTheme } from "next-themes";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Moon, Sun, Languages, Menu, X, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { t, setLanguage, language } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect & Auth check
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const navLinks = [
        { href: "/contest", label: t("navContest") },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 inset-x-0 z-50 h-[80px] transition-all duration-300 flex items-center",
                scrolled
                    ? "glass border-b border-white/10 dark:border-white/5"
                    : "bg-transparent border-transparent"
            )}
        >
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group relative z-50">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full group-hover:bg-primary/50 transition-all" />
                        <div className="relative bg-gradient-to-br from-primary to-indigo-600 p-2 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Trophy size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all duration-300">
                        Naukri Pathshala
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2 bg-secondary/50 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-all duration-300"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="w-px h-6 bg-border mx-1" />

                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-white/50 dark:hover:bg-black/20 rounded-full"
                        >
                            <Languages className="w-4 h-4" />
                            <span className="uppercase text-xs">{language}</span>
                        </button>

                        <AnimatePresence>
                            {isLangOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsLangOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-48 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-xl py-2 z-20 overflow-hidden ring-1 ring-black/5"
                                    >
                                        {[
                                            { code: "en", label: "English" },
                                            { code: "hi", label: "हिंदी" },
                                            { code: "mr", label: "मराठी" }
                                        ].map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => { setLanguage(lang.code as "en" | "hi" | "mr"); setIsLangOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between",
                                                    language === lang.code
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-muted-foreground hover:bg-muted"
                                                )}
                                            >
                                                {lang.label}
                                                {language === lang.code && (
                                                    <motion.div
                                                        layoutId="activeLang"
                                                        className="w-1.5 h-1.5 rounded-full bg-primary"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-all relative w-9 h-9 flex items-center justify-center overflow-hidden"
                    >
                        <Sun className="h-5 w-5 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2 pl-2">
                            <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all group">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                    {user.firstName ? user.firstName[0] : 'U'}
                                </div>
                                <span className="text-sm font-semibold pr-1">My Profile</span>
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className={cn(buttonVariants({ size: 'sm' }), "rounded-full ml-1 px-5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300")}
                        >
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-4 z-50">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-foreground bg-secondary/50 backdrop-blur-md rounded-full border border-white/10"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100dvh" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 top-0 z-40 bg-background/95 backdrop-blur-2xl flex flex-col pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between w-full p-4 rounded-xl bg-secondary/50 border border-border text-lg font-semibold text-foreground/80 hover:text-primary hover:bg-secondary transition-all active:scale-95"
                                    >
                                        {link.label}
                                        <Trophy size={18} className="text-muted-foreground" />
                                    </Link>
                                </motion.div>
                            ))}
                            {user && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between w-full p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-200 dark:border-blue-900 text-lg font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition-all active:scale-95"
                                    >
                                        My Profile
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                            {user.firstName ? user.firstName[0] : 'U'}
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="h-px w-full bg-border my-2"
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col gap-3">
                                    <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                                    <button
                                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                        className="flex items-center justify-between p-2 rounded-xl bg-background shadow-sm"
                                    >
                                        <span className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                                    </button>
                                </div>

                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col gap-3">
                                    <span className="text-sm font-medium text-muted-foreground">Language</span>
                                    <div className="flex gap-2">
                                        {["en", "hi", "mr"].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => { setLanguage(lang as any); setIsMobileMenuOpen(false); }}
                                                className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                                                    language === lang
                                                        ? "bg-primary text-primary-foreground shadow-md"
                                                        : "bg-background text-muted-foreground hover:bg-muted"
                                                )}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className={cn(buttonVariants({ size: 'lg', variant: 'destructive' }), "w-full rounded-xl text-lg font-semibold shadow-xl")}
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(buttonVariants({ size: 'lg' }), "w-full rounded-xl text-lg font-semibold shadow-xl shadow-primary/20")}
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
