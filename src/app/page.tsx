"use client";

import Link from "next/link";
import { ArrowLeft, Users, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">

      <div className="w-full max-w-2xl text-center z-10 space-y-8 px-4 py-10 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl border border-white/40 dark:border-slate-700/40">
        {/* العناوين والترحيب */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t("home.welcome")}<br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent">The Platform</span><br />
            {t("home.aqaba")}
          </h1>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            {t("home.subtitle")}
          </p>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold text-base rounded-2xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>{t("home.start_registration")}</span>
            <ArrowLeft className="w-5 h-5 rtl:hidden" />
            <ArrowLeft className="w-5 h-5 hidden rtl:block rotate-180" />
          </Link>

          <Link
            href="/reception"
            className="w-full sm:w-auto px-6 py-4 bg-white/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/100 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-base rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>{t("home.reception")}</span>
          </Link>

          <Link
            href="/employee"
            className="w-full sm:w-auto px-6 py-4 bg-white/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/100 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-base rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Briefcase className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>{t("home.admin")}</span>
          </Link>
        </div>

        {/* للدخول السريع إذا كان لديه عضوية */}
        <div className="pt-8 border-t border-slate-300 dark:border-slate-800/60 max-w-sm mx-auto">
          <p className="text-sm text-slate-700 dark:text-slate-400 mb-3">{t("home.have_membership")}</p>
          <form action="/member/redirect" method="GET" className="flex gap-2">
            <input
              type="text"
              name="id"
              placeholder={t("home.id_placeholder")}
              required
              className="flex-1 bg-white/90 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-4 py-2 text-center text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all uppercase"
            />
            <button
              type="submit"
              className="bg-slate-200 dark:bg-slate-800 hover:bg-teal-600 text-slate-900 dark:text-white hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-300 dark:border-slate-700 hover:border-teal-600"
            >
              {t("home.view")}
            </button>
          </form>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-500 pt-6">
          {t("common.copyright")}
        </div>
      </div>
    </main>
  );
}
