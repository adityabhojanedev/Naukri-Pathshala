"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/app/assets/logo.png";
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
                    <div className="relative h-10 w-10 transition-transform duration-300 hover:scale-105">
                        <Image
                            src={logo}
                            alt="Naukri Pathshala"
                            fill
                            className="object-contain bg-white p-1.5 rounded-xl shadow-sm border border-gray-100/50"
                            priority
                        />
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
                        <div className="relative pl-2 group">
                            <button
                                onClick={() => setIsLangOpen(false)} // Close lang if open
                                className="flex items-center gap-2 px-1 py-1 rounded-full hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-white/20">
                                    {user.firstName ? user.firstName[0] : 'U'}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-64 opacity-0 scale-95 translate-y-2 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 ease-out origin-top-right">
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden p-2">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 mb-2">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                    >
                                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                            <Trophy size={16} />
                                        </div>
                                        My Profile
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors mt-1"
                                    >
                                        <div className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        </div>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
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
