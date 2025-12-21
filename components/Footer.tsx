"use client";

import { useLanguage } from "./LanguageContext";
import Link from "next/link";
import { Trophy } from "lucide-react";

export default function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-background border-t border-border py-8">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary p-1.5 rounded-lg text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                        <Trophy size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        Naukri Pathshala
                    </span>
                </Link>

                <p className="text-sm text-muted-foreground text-center md:text-right">
                    &copy; {currentYear} Naukri Pathshala. {t("footerText")}
                </p>
            </div>
        </footer>
    );
}
