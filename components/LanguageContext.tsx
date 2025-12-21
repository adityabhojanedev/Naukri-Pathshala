"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi" | "mr";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    en: {
        // Hero Section
        heroTitle: "Master Your Path with Naukri Pathshala",
        heroSubtitle: "The best platform to practice quizzes, track progress, and excel in your career.",
        heroBadge: "Your Path to Success Starts Here",
        startQuiz: "Start Quiz",
        viewContest: "View Contests",
        getStarted: "Get Started",

        // Stats
        activeUsers: "Active Users",
        successRate: "Success Rate",
        quizzes: "Quizzes",

        // Features Section
        featuresTitle: "Why Choose Us?",
        featuresSubtitle: "Everything you need to excel in your career journey",
        feature1Title: "Real-time Results",
        feature1Desc: "Get instant feedback on your performance.",
        feature2Title: "Multiple Topics",
        feature2Desc: "Covering a wide range of subjects and exams.",
        feature3Title: "Leaderboards",
        feature3Desc: "Compete with others and see where you stand.",

        // Navigation
        navHome: "Home",
        navContest: "Contest",

        // Footer
        footerText: "© 2024 Naukri Pathshala. All rights reserved.",
        footerTagline: "Designed for Excellence.",
        footerProduct: "Product",
        footerCompany: "Company",
        footerLegal: "Legal",
        footerFeatures: "Features",
        footerPricing: "Pricing",
        footerContests: "Contests",
        footerAPI: "API",
        footerAbout: "About Us",
        footerCareers: "Careers",
        footerBlog: "Blog",
        footerContact: "Contact",
        footerPrivacy: "Privacy Policy",
        footerTerms: "Terms of Service",
        footerCookies: "Cookie Policy",
        footerDescription: "Empowering your career through interactive quizzes, real-time contests, and comprehensive performance analytics.",

        // Sign Up Page
        signUpTitle: "Create your account",
        signUpSubtitle: "Start your journey to success today",
        firstName: "First Name",
        firstNamePlaceholder: "Enter your first name",
        lastName: "Last Name",
        lastNamePlaceholder: "Enter your last name",
        mobileNumber: "Mobile Number",
        mobileNumberPlaceholder: "Enter 10-digit mobile number",
        password: "Password",
        passwordPlaceholder: "Create a strong password",
        passwordHint: "Must be at least 8 characters long",
        createAccount: "Create Account",
        alreadyHaveAccount: "Already have an account?",
        signIn: "Sign in",
        termsText: "By signing up, you agree to our",
        termsLink: "Terms of Service",
        andText: "and",
        privacyLink: "Privacy Policy",
    },
    hi: {
        // Hero Section
        heroTitle: "नौकरी पाठशाला के साथ अपनी राह में महारत हासिल करें",
        heroSubtitle: "प्रश्नोत्तरी का अभ्यास करने, प्रगति को ट्रैक करने और अपने करियर में उत्कृष्टता प्राप्त करने के लिए सबसे अच्छा मंच।",
        heroBadge: "आपकी सफलता की यात्रा यहाँ से शुरू होती है",
        startQuiz: "क्विज शुरू करें",
        viewContest: "प्रतियोगिता देखें",
        getStarted: "शुरू करें",

        // Stats
        activeUsers: "सक्रिय उपयोगकर्ता",
        successRate: "सफलता दर",
        quizzes: "क्विज़",

        // Features Section
        featuresTitle: "हमें क्यों चुनें?",
        featuresSubtitle: "आपके करियर की यात्रा में उत्कृष्टता के लिए सब कुछ",
        feature1Title: "वास्तविक समय के परिणाम",
        feature1Desc: "अपने प्रदर्शन पर तुरंत प्रतिक्रिया प्राप्त करें।",
        feature2Title: "विविध विषय",
        feature2Desc: "विषयों और परीक्षाओं की एक विस्तृत श्रृंखला को कवर करना।",
        feature3Title: "लीडरबोर्ड",
        feature3Desc: "दूसरों के साथ प्रतिस्पर्धा करें और देखें कि आप कहां खड़े हैं।",

        // Navigation
        navHome: "होम",
        navContest: "प्रतियोगिता",

        // Footer
        footerText: "© 2024 नौकरी पाठशाला। सर्वाधिकार सुरक्षित।",
        footerTagline: "उत्कृष्टता के लिए डिज़ाइन किया गया।",
        footerProduct: "उत्पाद",
        footerCompany: "कंपनी",
        footerLegal: "कानूनी",
        footerFeatures: "विशेषताएं",
        footerPricing: "मूल्य निर्धारण",
        footerContests: "प्रतियोगिताएं",
        footerAPI: "एपीआई",
        footerAbout: "हमारे बारे में",
        footerCareers: "करियर",
        footerBlog: "ब्लॉग",
        footerContact: "संपर्क करें",
        footerPrivacy: "गोपनीयता नीति",
        footerTerms: "सेवा की शर्तें",
        footerCookies: "कुकी नीति",
        footerDescription: "इंटरैक्टिव क्विज़, रियल-टाइम प्रतियोगिताओं और व्यापक प्रदर्शन विश्लेषण के माध्यम से आपके करियर को सशक्त बनाना।",

        // Sign Up Page
        signUpTitle: "अपना खाता बनाएं",
        signUpSubtitle: "आज ही सफलता की यात्रा शुरू करें",
        firstName: "पहला नाम",
        firstNamePlaceholder: "अपना पहला नाम दर्ज करें",
        lastName: "अंतिम नाम",
        lastNamePlaceholder: "अपना अंतिम नाम दर्ज करें",
        mobileNumber: "मोबाइल नंबर",
        mobileNumberPlaceholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
        password: "पासवर्ड",
        passwordPlaceholder: "एक मजबूत पासवर्ड बनाएं",
        passwordHint: "कम से कम 8 अक्षर लंबा होना चाहिए",
        createAccount: "खाता बनाएं",
        alreadyHaveAccount: "पहले से खाता है?",
        signIn: "साइन इन करें",
        termsText: "साइन अप करके, आप हमारी",
        termsLink: "सेवा की शर्तों",
        andText: "और",
        privacyLink: "गोपनीयता नीति",
    },
    mr: {
        // Hero Section
        heroTitle: "नोकरी पाठशाला सह आपला मार्ग प्रशस्त करा",
        heroSubtitle: "क्विझचा सराव करण्यासाठी, प्रगतीचा मागोवा घेण्यासाठी आणि आपल्या करिअरमध्ये उत्कृष्ट कामगिरी करण्यासाठी सर्वोत्तम व्यासपीठ.",
        heroBadge: "तुमच्या यशाचा मार्ग येथून सुरू होतो",
        startQuiz: "क्विझ सुरू करा",
        viewContest: "स्पर्धा पहा",
        getStarted: "सुरू करा",

        // Stats
        activeUsers: "सक्रिय वापरकर्ते",
        successRate: "यश दर",
        quizzes: "क्विझ",

        // Features Section
        featuresTitle: "आम्हाला का निवडावे?",
        featuresSubtitle: "तुमच्या करिअर प्रवासात उत्कृष्टतेसाठी आवश्यक असलेली प्रत्येक गोष्ट",
        feature1Title: "रिअल-टाइम निकाल",
        feature1Desc: "आपल्या कामगिरीवर त्वरित अभिप्राय मिळवा.",
        feature2Title: "अनेक विषय",
        feature2Desc: "विषय आणि परीक्षांची विस्तृत श्रेणी कव्हर करणे.",
        feature3Title: "लीडरबोर्ड",
        feature3Desc: "इतरांशी स्पर्धा करा आणि आपण कोठे आहात ते पहा.",

        // Navigation
        navHome: "होम",
        navContest: "स्पर्धा",

        // Footer
        footerText: "© 2024 नोकरी पाठशाला. सर्व हक्क राखीव.",
        footerTagline: "उत्कृष्टतेसाठी डिझाइन केलेले.",
        footerProduct: "उत्पादन",
        footerCompany: "कंपनी",
        footerLegal: "कायदेशीर",
        footerFeatures: "वैशिष्ट्ये",
        footerPricing: "किंमत",
        footerContests: "स्पर्धा",
        footerAPI: "एपीआय",
        footerAbout: "आमच्याबद्दल",
        footerCareers: "करिअर",
        footerBlog: "ब्लॉग",
        footerContact: "संपर्क",
        footerPrivacy: "गोपनीयता धोरण",
        footerTerms: "सेवा अटी",
        footerCookies: "कुकी धोरण",
        footerDescription: "परस्परसंवादी क्विझ, रिअल-टाइम स्पर्धा आणि सर्वसमावेशक कामगिरी विश्लेषणाद्वारे तुमच्या करिअरला सशक्त बनवणे.",

        // Sign Up Page
        signUpTitle: "तुमचे खाते तयार करा",
        signUpSubtitle: "आजच यशाचा प्रवास सुरू करा",
        firstName: "पहिले नाव",
        firstNamePlaceholder: "तुमचे पहिले नाव प्रविष्ट करा",
        lastName: "आडनाव",
        lastNamePlaceholder: "तुमचे आडनाव प्रविष्ट करा",
        mobileNumber: "मोबाइल नंबर",
        mobileNumberPlaceholder: "10 अंकी मोबाइल नंबर प्रविष्ट करा",
        password: "पासवर्ड",
        passwordPlaceholder: "एक मजबूत पासवर्ड तयार करा",
        passwordHint: "किमान 8 वर्ण लांब असणे आवश्यक आहे",
        createAccount: "खाते तयार करा",
        alreadyHaveAccount: "आधीपासून खाते आहे?",
        signIn: "साइन इन करा",
        termsText: "साइन अप करून, तुम्ही आमच्या",
        termsLink: "सेवा अटींशी",
        andText: "आणि",
        privacyLink: "गोपनीयता धोरणाशी",
    },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    React.useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "hi" || savedLang === "mr")) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key: string) => {
        // @ts-expect-error - simple key access
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
