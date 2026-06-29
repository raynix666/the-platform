"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, Moon, Sun, Mail, Phone, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const isDark = mounted && theme === "dark";

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* زر الهامبرغر */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-sm backdrop-blur-sm cursor-pointer flex items-center justify-center"
        aria-label="فتح القائمة"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className={`absolute top-12 ${lang === "ar" ? "left-0" : "right-0"} w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-slate-900/60 overflow-hidden animate-fadeIn`}
        >
          {/* رأس القائمة مع شعار المنصة */}
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 dark:from-teal-950/50 dark:to-cyan-950/50 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <img src="/logo.png" alt="شعار المنصة" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                {lang === "ar" ? "المنصة التكنولوجية" : "The Platform"}
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                {lang === "ar" ? "العقبة – إنجاز" : "Aqaba – INJAZ"}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* تغيير اللغة */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                {lang === "ar" ? "اللغة" : "Language"}
              </p>
              <button
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-300 dark:hover:border-teal-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer group"
              >
                <Globe className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold flex-1 text-start">
                  {lang === "ar" ? "English" : "العربية"}
                </span>
                <span className="text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-mono">
                  {lang === "ar" ? "EN" : "AR"}
                </span>
              </button>
            </div>

            {/* تغيير الثيم */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                {lang === "ar" ? "المظهر" : "Theme"}
              </p>
              {mounted && (
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer group"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-sm font-semibold flex-1 text-start">
                    {isDark
                      ? (lang === "ar" ? "الوضع الفاتح" : "Light Mode")
                      : (lang === "ar" ? "الوضع الداكن" : "Dark Mode")}
                  </span>
                  <span className={`w-10 h-5 rounded-full transition-all relative ${isDark ? "bg-teal-500" : "bg-slate-200"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isDark ? (lang === "ar" ? "right-0.5" : "left-5") : (lang === "ar" ? "right-5" : "left-0.5")}`} />
                  </span>
                </button>
              )}
            </div>

            {/* تواصل معنا */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                {lang === "ar" ? "تواصل معنا" : "Contact Us"}
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <a
                  href="mailto:theplatform-aqab@injaz.org.jo"
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 transition-all group"
                >
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium break-all">theplatform-aqab@injaz.org.jo</span>
                </a>
                <a
                  href="tel:0798292582"
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-green-50 dark:hover:bg-green-950/30 text-slate-700 dark:text-slate-300 transition-all group"
                >
                  <Phone className="w-4 h-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium font-mono tracking-wide" dir="ltr">0798292582</span>
                </a>
              </div>
            </div>

            {/* نبذة عن المنصة */}
            <div className="space-y-1.5">
              <button
                onClick={() => setAboutExpanded((prev) => !prev)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="text-sm font-semibold flex-1 text-start">
                  {lang === "ar" ? "نبذة عن المنصة" : "About the Platform"}
                </span>
                {aboutExpanded
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {aboutExpanded && (
                <div className="px-4 py-4 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2.5 animate-fadeIn max-h-72 overflow-y-auto">
                  <p className="font-bold text-teal-700 dark:text-teal-400 text-sm">
                    المنصة التكنولوجية – العقبة
                  </p>
                  <p>
                    إحدى مبادرات مشروع الشباب والتكنولوجيا والوظائف التابع لوزارة الاقتصاد الرقمي والريادة، والمنفذ من قبل مؤسسة إنجاز.
                  </p>
                  <p>
                    نسعى إلى تمكين الشباب في جنوب الأردن من خلال توفير بيئة حديثة للتعلم والعمل والابتكار، وبناء المهارات الرقمية، واحتضان الأفكار الريادية، ودعم فرص التشغيل وريادة الأعمال.
                  </p>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">🎯 تقدم المنصة:</p>
                    <ul className="space-y-1 list-none">
                      {[
                        "برامج تدريبية متخصصة في المهارات الرقمية والتكنولوجية.",
                        "ورش عمل في الذكاء الاصطناعي والتحول الرقمي.",
                        "برامج في ريادة الأعمال والابتكار.",
                        "مساحات عمل واجتماعات وتدريب مجهزة.",
                        "جلسات إرشاد وتوجيه مهني.",
                        "فرص تشبيك مع رواد الأعمال والشركات الناشئة.",
                        "دعم واحتضان الأفكار والمشاريع الريادية.",
                        "أنشطة ومبادرات مجتمعية تستهدف الشباب والنساء واللاجئين.",
                        "برامج تعزز جاهزية الشباب لدخول سوق العمل.",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-500 mt-0.5">–</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-teal-700 dark:text-teal-400">
                    📍 <span className="font-semibold">أوقات الدوام:</span> من 10:00 صباحًا حتى 6:00 مساءً يوميًا، باستثناء يوم الجمعة.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 italic">
                    ✨ أهلاً وسهلاً بكم، ونتطلع إلى مشاركتكم في برامج وورش المنصة التي تصنع فارقًا وتفتح آفاقًا جديدة للتعلم والتطوير.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
