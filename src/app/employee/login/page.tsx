"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { loginEmployee } from "../../actions/employeeActions";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const result = await loginEmployee(employeeCode.trim());

    if (result.success) {
      // التوجيه إلى شاشة الموظف الرئيسية
      router.push("/employee");
      router.refresh();
    } else {
      setLoading(false);
      setErrorMsg(result.error || "فشل تسجيل الدخول");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden text-slate-800 dark:text-slate-100">



      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative backdrop-blur-md space-y-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />

        {/* الترويسة والشعار */}
        <div className="text-center space-y-3">
          <img src="/logo.png" alt="شعار المنصة" className="w-40 h-40 object-contain mx-auto mb-2 hover:scale-105 transition-transform duration-300" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">المنصة</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">بوابة الدخول الموحدة للموظفين والمدراء</p>
        </div>

        {/* رسائل الخطأ */}
        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* نموذج الدخول */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
              رمز الموظف (Employee Code)
            </label>
            <div className="relative">
              <input
                id="code"
                type="password"
                placeholder="أدخل رمز الموظف الخاص بك"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl pl-4 pr-11 py-3.5 text-center text-slate-900 dark:text-white placeholder-slate-600 outline-none transition-all font-mono tracking-widest text-lg disabled:opacity-50"
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-slate-600">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !employeeCode.trim()}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-900 disabled:text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <span>دخول للوحة التحكم</span>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </>
            )}
          </button>
        </form>


        {/* زر العودة */}
        <div className="text-center pt-2">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all underline cursor-pointer"
          >
            العودة للشاشة الترحيبية
          </button>
        </div>
      </div>
    </main>
  );
}
