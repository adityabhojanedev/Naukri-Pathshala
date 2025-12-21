"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import VerificationModal from "@/components/auth/VerificationModal";
import Link from "next/link";
import { Loader2, Languages } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

export default function SignupPage() {
    const router = useRouter();
    const { t, language, setLanguage } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        mobile: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match"); // Ideally strictly from t() but sticking to known keys for now
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    mobile: formData.mobile,
                    password: formData.password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setShowModal(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        router.push("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/20 opacity-20 blur-[120px]" />
            </div>

            {/* Language Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <div className="relative">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-card/50 backdrop-blur-md border border-white/10 shadow-sm rounded-full"
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
                                    className="absolute right-0 mt-2 w-40 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-xl py-2 z-20 overflow-hidden ring-1 ring-black/5"
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
                                                "w-full text-left px-4 py-2 text-sm transition-all duration-200 flex items-center justify-between",
                                                language === lang.code
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {lang.label}
                                            {language === lang.code && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl"
            >
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        {t("signUpTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t("signUpSubtitle")}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="sr-only">{t("firstName")}</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="relative block w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                                    placeholder={t("firstNamePlaceholder")}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="sr-only">{t("lastName")}</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="relative block w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                                    placeholder={t("lastNamePlaceholder")}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mobile" className="sr-only">{t("mobileNumber")}</label>
                            <input
                                id="mobile"
                                name="mobile"
                                type="tel"
                                required
                                pattern="[0-9]{10}"
                                className="relative block w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                                placeholder={t("mobileNumberPlaceholder")}
                                value={formData.mobile}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">{t("password")}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                className="relative block w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                                placeholder={t("passwordPlaceholder")}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-muted-foreground px-1">{t("passwordHint")}</p>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                                placeholder={t("password")} // Using password translation as placeholder fallback or create new key if needed, but keeping it simple for now
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/25"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                t("createAccount")
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                            {t("signIn")}
                        </Link>
                    </div>
                </form>
            </motion.div>

            <VerificationModal isOpen={showModal} onClose={handleModalClose} />
        </div>
    );
}
