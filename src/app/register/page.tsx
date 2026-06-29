"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Copy,
  Check,
  Upload,
  User,
  Phone,
  BookOpen,
  HelpCircle,
  Camera,
  Home
} from "lucide-react";
import { registerMember, MemberRegistrationData } from "../actions/memberActions";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterMultiStep() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<number>(1); // من 1 إلى 5، ثم 6 للنجاح
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // بيانات التسجيل
  const [formData, setFormData] = useState<MemberRegistrationData>({
    fullName: "",
    age: 18,
    gender: "ذكر",
    nationality: "أردني",
    phone: "",
    address: "",
    degree: "بكالوريوس",
    specialization: "",
    nationalId: "",
    idImage: "",
    purpose: "زيارة",
    details: "",
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [generatedId, setGeneratedId] = useState<string>("");

  // التعامل مع تغيير الحقول
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  // معالجة رفع الصورة وتحويلها إلى Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          idImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // محاكاة التقاط صورة الهوية بالكاميرا
  const handleCameraCapture = () => {
    // صورة تجريبية لسهولة الاستخدام على الأجهزة التي لا تدعم الكاميرا بشكل مباشر في الويب ساندبوكس
    const dummyIdBase64 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' rx='10' fill='%231e293b' stroke='%2314b8a6' stroke-width='4'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='18'>بطاقة هوية موثقة</text></svg>";
    setFormData((prev) => ({
      ...prev,
      idImage: dummyIdBase64,
    }));
    alert("تم التقاط صورة هوية افتراضية للتحقق بنجاح!");
  };

  // التحقق من الحقول قبل الانتقال للخطوة التالية
  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.fullName.trim()) return "يرجى إدخال الاسم الكامل";
      const nameParts = formData.fullName.trim().split(/\s+/).filter(Boolean);
      if (nameParts.length < 4) return "يجب أن يتكون الاسم الكامل من 4 مقاطع (كلمات) على الأقل مفصولة بمسافات";
      if (!formData.age || formData.age < 5) return "يرجى إدخال عمر صحيح";
    } else if (step === 2) {
      if (!formData.phone.trim()) return "يرجى إدخال رقم الهاتف";
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length < 10) return "يجب ألا يقل رقم الهاتف عن 10 أرقام";
      if (!formData.address.trim()) return "يرجى إدخال عنوان السكن الحالي";
    } else if (step === 3) {
      if (!formData.specialization.trim()) return "يرجى إدخال التخصص الأكاديمي";
      if (!formData.nationalId.trim()) return "يرجى إدخال الرقم الوطني";
      const nationalIdDigits = formData.nationalId.replace(/\D/g, "");
      if (nationalIdDigits.length < 10) return "يجب ألا يقل الرقم الوطني عن 10 أرقام";
      if (!formData.idImage) {
        return formData.age < 17 ? "يرجى رفع صورة شهادة الميلاد" : "يرجى رفع صورة الهوية الشخصية";
      }
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  // إرسال البيانات النهائية
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await registerMember(formData);

    setLoading(false);
    if (result.success && result.memberId) {
      setGeneratedId(result.memberId);
      setStep(6); // الانتقال لشاشة النجاح
    } else {
      setError(result.error || "حدث خطأ أثناء حفظ البيانات");
    }
  };

  // نسخ رقم العضوية
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">

      <div className="w-full max-w-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* زر العودة للرئيسية */}
        {step < 6 && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors bg-slate-100 hover:bg-rose-50 dark:bg-slate-800/50 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-lg"
            >
              <Home className="w-4 h-4" />
              <span>{t("register.go_home")}</span>
            </button>
          </div>
        )}

        {/* شريط التقدم من 1 إلى 4 (يظهر فقط أثناء الاستمارات) */}
        {step >= 1 && step <= 4 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-600 dark:text-slate-400">
              <span>المرحلة {step} من 4</span>
              <span className="text-teal-400">
                {step === 1 && t("register.step1")}
                {step === 2 && t("register.step2")}
                {step === 3 && t("register.step3")}
                {step === 4 && t("reception.visit_purpose")}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* عرض الخطأ إن وجد */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 px-4 py-3 rounded-2xl text-sm text-center">
            {error}
          </div>
        )}

        {/* الخطوة 1: البيانات الشخصية */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <User className="w-6 h-6 text-teal-400" />
                <span>{t("register.step1")}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">يرجى كتابة معلوماتك الأساسية كما هي في الهوية الشخصية.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.full_name")}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="الاسم الرباعي كما في الهوية"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.age")}</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="5"
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all text-center"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.gender")}</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all"
                  >
                    <option value="ذكر">{t("register.male")}</option>
                    <option value="أنثى">{t("register.female")}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.nationality")}</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="مثال: أردني، سوري، إلخ"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>{t("register.next")}</span>
                <ArrowLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 2: معلومات التواصل والسكن */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Phone className="w-6 h-6 text-teal-400" />
                <span>{t("register.step2")}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">كيف يمكننا التواصل معك وتحديد موقع سكنك الحالي؟</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.phone")}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="أدخل رقم هاتفك (10 أرقام على الأقل)"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all text-left dir-ltr"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.address")}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="المحافظة، اسم الشارع، أو الحي"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
                <span>{t("register.back")}</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>{t("register.next")}</span>
                <ArrowLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 3: المؤهل والتخصص */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <BookOpen className="w-6 h-6 text-teal-400" />
                <span>{t("register.step3")}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">تساعدنا هذه المعلومات على تخصيص الفعاليات والتحقق من الهوية.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.degree")}</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all"
                  >
                    <option value="إعدادي">{t("register.degree_options.none")}</option>
                    <option value="ثانوية عامة">{t("register.degree_options.high_school")}</option>
                    <option value="دبلوم">{t("register.degree_options.diploma")}</option>
                    <option value="بكالوريوس">{t("register.degree_options.bachelor")}</option>
                    <option value="ماجستير">{t("register.degree_options.master")}</option>
                    <option value="دكتوراه">{t("register.degree_options.phd")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.specialization")}</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="التخصص الدراسي"
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.national_id")}</label>
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  placeholder="أدخل الرقم الوطني المكون من 10 خانات"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all text-center"
                  required
                />
              </div>

              {/* رفع صورة الهوية */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("register.upload_id")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500/60 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 cursor-pointer group transition-all text-center">
                    <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400 group-hover:text-teal-400 mb-2" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-600 dark:text-slate-300">اختر صورة الهوية</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500/60 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 cursor-pointer text-center text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-all"
                  >
                    <Camera className="w-8 h-8 text-slate-500 dark:text-slate-400 mb-2" />
                    <span className="text-xs">التقاط سريع بالكاميرا</span>
                  </button>
                </div>

                {formData.idImage && (
                  <div className="mt-3 p-3 bg-teal-950/20 border border-teal-900 rounded-2xl flex items-center justify-between text-xs text-teal-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>تم إرفاق صورة الهوية الشخصية بنجاح.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, idImage: "" }))}
                      className="text-rose-400 hover:underline"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
                <span>{t("register.back")}</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>{t("register.next")}</span>
                <ArrowLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 4: سبب الزيارة */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <HelpCircle className="w-6 h-6 text-teal-400" />
                <span>{t("reception.visit_purpose")}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">ما هو الغرض من زيارتك الحالية للمركز؟</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("reception.visit_purpose")}</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all"
                >
                  <option value="زيارة">{t("reception.other")}</option>
                  <option value="حضور التدريب">{t("reception.workshop")}</option>
                  <option value="للدراسة أو العمل">{t("reception.study")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("reception.visit_details")}</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={4}
                  placeholder="اكتب أي ملاحظات أو تفاصيل عن طبيعة زيارتك الحالية لتسهيل تقديم المساعدة لك..."
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
                <span>{t("register.back")}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>{t("common.loading")}</span>
                ) : (
                  <>
                    <span>{t("register.submit")}</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* الخطوة 5: نجاح التسجيل (شاشة 6) */}
        {step === 6 && (
          <div className="text-center py-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center justify-center text-teal-400 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t("common.success") || "تم التسجيل بنجاح!"}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("register.success_msg") || "تم إنشاء وتوثيق ملف عضويتك في المنصة للمركز."}</p>
            </div>

            {/* بطاقة العضوية المصغرة */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 max-w-sm mx-auto shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
              <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">Member Card</div>
              
              <div className="text-center py-4 space-y-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">رقم العضوية الفريد الخاص بك (ID)</span>
                <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl">
                  <span className="text-2xl font-black text-teal-400 tracking-wider font-mono">{generatedId}</span>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-teal-400 transition-all cursor-pointer"
                    title="نسخ رقم العضوية"
                  >
                    {copied ? <Check className="w-5 h-5 text-teal-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3 text-right space-y-1">
                <div className="text-xs text-slate-600 dark:text-slate-400"><span className="text-slate-500 dark:text-slate-400">الاسم:</span> {formData.fullName}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400"><span className="text-slate-500 dark:text-slate-400">رقم الهاتف:</span> {formData.phone}</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              💡 <span className="font-bold text-slate-600 dark:text-slate-300">ملاحظة هامة:</span> يرجى إظهار رقم العضوية (ID) أو هذه الصفحة لموظف الاستقبال في كل مرة تزور فيها المركز لتسجيل حضورك مباشرة.
            </div>

            <div className="pt-4 flex flex-col gap-3 max-w-sm mx-auto">
              <button
                onClick={() => router.push(`/member/${generatedId}`)}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold text-lg rounded-2xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <User className="w-5 h-5" />
                <span>الانتقال للملف الشخصي (لوحة التحكم)</span>
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold text-sm rounded-2xl transition-all cursor-pointer"
              >
                {t("register.go_home")}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
