"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  Search,
  User,
  CreditCard,
  Edit3,
  Check,
  RefreshCw,
  Eye,
  X,
  FileText,
  BookOpen,
  Plus,
  Trash2,
  Users,
  CalendarDays,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchMembers, updateVisitPurpose, getMemberDetails } from "../actions/memberActions";
import { createCourse, getCourses, registerForCourse, deleteCourse, CreateCourseData } from "../actions/courseActions";

type Visit = {
  id: string;
  memberId: string;
  purpose: string;
  details: string | null;
  date: Date;
};

type Activity = {
  id: string;
  memberId: string;
  type: string;
  title: string;
  description: string | null;
  date: Date;
  time: string | null;
  location: string | null;
};

type Member = {
  id: string;
  fullName: string;
  phone: string;
  nationality: string;
  address: string;
  degree: string;
  specialization: string;
  nationalId: string;
  idImage: string | null;
  isBlacklisted: boolean;
  visits: Visit[];
  activities?: Activity[];
};

type CourseRegistrant = {
  id: string;
  member: {
    id: string;
    fullName: string;
    phone: string;
    specialization: string;
    degree?: string;
  };
};

type Course = {
  id: string;
  title: string;
  topics: string | null;
  startDate: Date;
  startTime: string | null;
  endTime: string | null;
  trainerName: string | null;
  ageFrom: number | null;
  ageTo: number | null;
  genderTarget: string | null;
  maxSeats: number;
  createdAt: Date;
  registrations: CourseRegistrant[];
};

export default function ReceptionDashboardClient({
  employee
}: {
  employee: { id: string; fullName: string; employeeCode: string; role: string; canExportWorkshops: boolean; canExportVisitors: boolean };
}) {
  const { t } = useLanguage();
  const router = useRouter();

  // التبويب الرئيسي: أعضاء أو ورش
  const [mainTab, setMainTab] = useState<"members" | "courses">("members");

  // ---- حالات الأعضاء ----
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // حقول تعديل سبب الزيارة
  const [newPurpose, setNewPurpose] = useState<string>("دراسة وتدريب حُر");
  const [newDetails, setNewDetails] = useState<string>("");
  const [savingPurpose, setSavingPurpose] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // ---- حالات الورش ----
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [showCreateCourse, setShowCreateCourse] = useState<boolean>(false);
  const [creatingCourse, setCreatingCourse] = useState<boolean>(false);
  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    title: "",
    topics: "",
    startDate: "",
    startTime: "",
    endTime: "",
    trainerName: "",
    ageFrom: undefined,
    ageTo: undefined,
    genderTarget: "الجميع",
    maxSeats: 50,
  });

  // تسجيل عضو في ورشة
  const [registerCourseId, setRegisterCourseId] = useState<string | null>(null);
  const [registerMemberId, setRegisterMemberId] = useState<string>("");
  const [registeringMember, setRegisteringMember] = useState<boolean>(false);
  const [registerMsg, setRegisterMsg] = useState<{ text: string; success: boolean } | null>(null);

  // عرض المسجلين في ورشة
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // إحصائيات
  const [totalMembers, setTotalMembers] = useState<number>(0);

  // ---- جلب الأعضاء ----
  const handleSearch = async (query: string) => {
    setLoading(true);
    const result = await searchMembers(query);
    setLoading(false);
    if (result.success && result.members) {
      setMembers(result.members);
      if (query === "") {
        setTotalMembers(result.members.length);
      }
    }
  };

  // ---- جلب الورش ----
  const fetchCourses = async () => {
    setLoadingCourses(true);
    const result = await getCourses();
    setLoadingCourses(false);
    if (result.success && result.courses) {
      setCourses(result.courses as Course[]);
    }
  };

  useEffect(() => {
    handleSearch("");
    fetchCourses();
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    handleSearch(val);
  };

  // جلب تفاصيل العضو عند اختياره
  const handleSelectMember = async (memberId: string) => {
    setLoading(true);
    const result = await getMemberDetails(memberId);
    setLoading(false);
    if (result.success && result.member) {
      setSelectedMember(result.member);
      setNewPurpose(result.member.visits[0]?.purpose || "دراسة وتدريب حُر");
      setNewDetails("");
      setSaveSuccess(false);
    }
  };

  // تعديل سبب الزيارة
  const handleUpdatePurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setSavingPurpose(true);
    setSaveSuccess(false);

    const result = await updateVisitPurpose(selectedMember.id, newPurpose, newDetails);

    setSavingPurpose(false);
    if (result.success) {
      setSaveSuccess(true);
      handleSelectMember(selectedMember.id);
      handleSearch(searchQuery);
    } else {
      alert("فشل تحديث سبب الزيارة!");
    }
  };

  // ---- إنشاء ورشة ----
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.startDate) return;

    setCreatingCourse(true);
    const result = await createCourse(courseForm);
    setCreatingCourse(false);

    if (result.success) {
      setCourseForm({
        title: "",
        topics: "",
        startDate: "",
        startTime: "",
        endTime: "",
        trainerName: "",
        ageFrom: undefined,
        ageTo: undefined,
        genderTarget: "الجميع",
        maxSeats: 50,
      });
      setShowCreateCourse(false);
      fetchCourses();
    } else {
      alert(result.error || "فشل إنشاء الورشة");
    }
  };

  // ---- حذف ورشة ----
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الورشة؟ سيتم حذف جميع التسجيلات المرتبطة بها.")) return;

    const result = await deleteCourse(courseId);
    if (result.success) {
      fetchCourses();
    } else {
      alert(result.error || "فشل حذف الورشة");
    }
  };

  // ---- تسجيل عضو في ورشة ----
  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerCourseId || !registerMemberId.trim()) return;

    setRegisteringMember(true);
    setRegisterMsg(null);

    const result = await registerForCourse(registerCourseId, registerMemberId.trim().toUpperCase());

    setRegisteringMember(false);
    if (result.success) {
      setRegisterMsg({ text: "تم تسجيل العضو في الورشة بنجاح!", success: true });
      setRegisterMemberId("");
      fetchCourses();
    } else {
      setRegisterMsg({ text: result.error || "فشل التسجيل", success: false });
    }
  };

  // ---- تصدير لـ Excel ----
  const handleExportCourseExcel = (course: Course) => {
    try {
      if (employee.role !== "ADMIN" && !employee.canExportWorkshops) {
        alert("ليس لديك صلاحية لتصدير هذه البيانات.");
        return;
      }
      if (course.registrations.length === 0) {
        alert("لا يوجد مسجلين لتصدير بياناتهم.");
        return;
      }

      const dataToExport = course.registrations.map((reg, index) => ({
        "م": index + 1,
        "رقم العضوية (ID)": reg.member.id,
        "الاسم الكامل": reg.member.fullName,
        "رقم الهاتف": reg.member.phone,
        "التخصص": reg.member.specialization,
        "المؤهل": reg.member.degree || "غير محدد"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "المسجلين");
      
      const fileName = `مسجلي_ورشة_${course.title.replace(/\s+/g, "_")}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Excel Export Error:", err);
      alert("حدث خطأ أثناء التصدير.");
    }
  };

  // ---- تصدير لـ Excel (زوار) ----
  const handleExportVisitorsExcel = () => {
    try {
      if (employee.role !== "ADMIN" && !employee.canExportVisitors) {
        alert("ليس لديك صلاحية لتصدير هذه البيانات.");
        return;
      }
      if (members.length === 0) {
        alert("لا توجد بيانات لتصديرها.");
        return;
      }

      const dataToExport = members.map((m, index) => ({
        "م": index + 1,
        "رقم العضوية (ID)": m.id,
        "الاسم الكامل": m.fullName,
        "رقم الهاتف": m.phone,
        "الجنسية": m.nationality,
        "العنوان": m.address,
        "التخصص": m.specialization,
        "المؤهل": m.degree || "غير محدد",
        "الرقم الوطني": m.nationalId,
        "عدد الزيارات": m.visits?.length || 0,
        "سبب آخر زيارة": m.visits?.[0]?.purpose || "لا يوجد"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet["!dir"] = "rtl";
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "الزوار");
      
      const fileName = `بيانات_الزوار_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Excel Export Error:", err);
      alert("حدث خطأ أثناء التصدير.");
    }
  };

  return (
    <main className="min-h-screen text-slate-800 dark:text-slate-100 flex flex-col">
      {/* الشريط العلوي */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t("reception.title")}</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t("reception.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all border border-slate-300 dark:border-slate-700"
            >
              {t("home.welcome")}
            </button>
          </div>
        </div>

        {/* إحصائيات سريعة + تبويبات */}
        <div className="max-w-7xl mx-auto mt-4 space-y-4">
          {/* إحصائيات */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">إجمالي الأعضاء</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{totalMembers}</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الورش المتاحة</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{courses.length}</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">إجمالي التسجيلات</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {courses.reduce((acc, c) => acc + c.registrations.length, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* تبويبات */}
          <div className="flex gap-2">
            <button
              onClick={() => setMainTab("members")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                mainTab === "members"
                  ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t("reception.members_screen")}</span>
            </button>
            <button
              onClick={() => setMainTab("courses")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                mainTab === "courses"
                  ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t("reception.workshops_screen")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========== تبويب الأعضاء ========== */}
      {mainTab === "members" && (
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
          {/* القسم الأيمن: قائمة الأعضاء والبحث */}
          <section className="w-full lg:w-1/2 p-6 border-l border-slate-200 dark:border-slate-800 flex flex-col space-y-6">
            {/* حقل البحث */}
            <div className="relative">
              <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleQueryChange}
                placeholder={t("reception.search_member")}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl pr-12 pl-4 py-3.5 text-slate-900 dark:text-white outline-none transition-all placeholder-slate-500"
              />
            </div>

            {/* قائمة الأعضاء */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[60vh] lg:max-h-[70vh] pr-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold px-2 mb-2">
                <div>
                  <span>{t("reception.search_results").replace("{count}", members.length.toString())}</span>
                </div>
                {(employee.role === "ADMIN" || employee.canExportVisitors) && members.length > 0 && (
                  <button
                    onClick={handleExportVisitorsExcel}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير Excel</span>
                  </button>
                )}
              </div>

              {loading && members.length === 0 ? (
                <div className="text-center py-12 flex justify-center items-center gap-2 text-slate-600 dark:text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
                  <span>جاري التحميل...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/30 border border-slate-900 rounded-2xl text-slate-500 dark:text-slate-400">
                  {t("reception.no_results")}
                </div>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMember(m.id)}
                    className={`bg-white/80 dark:bg-slate-900/40 border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-md group ${
                      selectedMember?.id === m.id
                        ? "border-teal-500 bg-white/80 dark:bg-slate-900/80 shadow-lg shadow-teal-500/5"
                        : "border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-teal-400 font-bold group-hover:border-teal-500/20">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base group-hover:text-teal-300 transition-colors flex items-center gap-2">
                          {m.fullName}
                          {m.isBlacklisted && <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">ممنوع</span>}
                        </h3>
                        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-400 font-mono">{m.id}</span>
                          <span>•</span>
                          <span>الهاتف: {m.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left space-y-1">
                      <span className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 block font-semibold text-center">
                        {m.visits[0]?.purpose || "لا توجد زيارة"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* القسم الأيسر: تفاصيل العضو المحدد وإجراء التعديل */}
          <section className="w-full lg:w-1/2 p-6 flex flex-col space-y-6 bg-slate-50 dark:bg-slate-950/40">
            {!selectedMember ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 dark:text-slate-400 space-y-3">
                <Eye className="w-16 h-16 text-slate-700" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">لم يتم اختيار عضو</h3>
                <p className="text-xs max-w-xs leading-relaxed">
                  اختر أحد الأعضاء من القائمة الجانبية أو ابحث لتتمكن من معاينة بياناته الشخصية، هويته، وتعديل سبب زيارته فوراً.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn flex flex-col h-full justify-between">
                <div className="space-y-6">
                  {selectedMember.isBlacklisted && (
                    <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-start gap-3 shadow-sm animate-pulse">
                      <div className="bg-rose-500 text-white p-2 rounded-full mt-0.5">
                        <X className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-rose-600 dark:text-rose-400 font-bold text-lg">هذا الزائر موجود في القائمة السوداء</h4>
                        <p className="text-rose-500/80 dark:text-rose-400/80 text-xs mt-1">
                          يرجى مراجعة الإدارة قبل تقديم أي خدمات أو استكمال إجراءات التسجيل.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ترويسة العضو المختار */}
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-850 pb-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedMember.fullName}</h2>
                      <div className="flex gap-2 text-xs font-semibold">
                        <span className="text-teal-400 font-mono">ID: {selectedMember.id}</span>
                        <span className="text-slate-500 dark:text-slate-400">•</span>
                        <span className="text-slate-600 dark:text-slate-400">{t("reception.national_id") || "الرقم الوطني"}: {selectedMember.nationalId}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* بيانات العضو */}
                  <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                    <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">{t("reception.phone_col")}</span>
                      <span className="font-semibold text-slate-900 dark:text-white dir-ltr block">{selectedMember.phone}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">{t("employee.nationality")}</span>
                      <span className="font-semibold text-slate-900 dark:text-white block">{selectedMember.nationality}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">{t("employee.address")}</span>
                      <span className="font-semibold text-slate-900 dark:text-white block truncate">{selectedMember.address}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">{t("reception.degree_col")} & {t("reception.spec_col")}</span>
                      <span className="font-semibold text-teal-400 block truncate">
                        {selectedMember.degree} - {selectedMember.specialization}
                      </span>
                    </div>
                  </div>

                  {/* صورة الهوية */}
                  {selectedMember.idImage && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-teal-400" />
                        <span>صورة الهوية الموثقة</span>
                      </h4>
                      <div className="flex justify-center border border-slate-200 dark:border-slate-850 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 max-h-40 overflow-hidden">
                        <img
                          src={selectedMember.idImage}
                          alt="الهوية الشخصية"
                          className="rounded-xl max-h-36 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* نموذج تعديل سبب الزيارة */}
                  <form onSubmit={handleUpdatePurpose} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <Edit3 className="w-4 h-4 text-teal-400" />
                      <span>{t("reception.update_visit") || "تحديث سبب زيارة العضو الحالية"}</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("reception.visit_purpose")}</label>
                        <select
                          value={newPurpose}
                          onChange={(e) => setNewPurpose(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs outline-none transition-all"
                        >
                          <option value="دراسة وتدريب حُر">{t("reception.study")}</option>
                          <option value="حضور ورشة تدريبية">{t("reception.workshop")}</option>
                          <option value="حضور ورشة عمل">{t("reception.workshop")}</option>
                          <option value="جلسة عمل فردية / جماعية">{t("reception.meeting")}</option>
                          <option value="أخرى / مراجعة إدارة">{t("reception.other")}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("reception.visit_details")}</label>
                        <input
                          type="text"
                          value={newDetails}
                          onChange={(e) => setNewDetails(e.target.value)}
                          placeholder="مثال: قاعة التطوير A، مراجعة بخصوص ورشة البرمجة"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="submit"
                        disabled={savingPurpose}
                        className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingPurpose ? (
                          <span>{t("common.loading")}</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{t("reception.register")}</span>
                          </>
                        )}
                      </button>

                      {saveSuccess && (
                        <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
                          ✓ تم التحديث والتوثيق بنجاح!
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* سجل الزيارات السابقة */}
                <div className="space-y-2 pt-4">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>{t("employee.activities_record")}</span>
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {selectedMember.visits.map((v) => (
                      <div key={v.id} className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-600 dark:text-slate-300">{v.purpose}</span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{v.details || "لا توجد تفاصيل"}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(v.date).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========== تبويب الورش ========== */}
      {mainTab === "courses" && (
        <div className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6 animate-fadeIn">
          {/* ترويسة + زر إنشاء ورشة */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-teal-400" />
                <span>{t("workshop.title")}</span>
              </h2>
            </div>
            <button
              onClick={() => setShowCreateCourse(!showCreateCourse)}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold text-sm rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-teal-500/10"
            >
              {showCreateCourse ? (
                <>
                  <X className="w-4 h-4" />
                  <span>{t("common.cancel")}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t("workshop.create_new")}</span>
                </>
              )}
            </button>
          </div>

          {/* نموذج إنشاء ورشة */}
          {showCreateCourse && (
            <form
              onSubmit={handleCreateCourse}
              className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-fadeIn"
            >
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Plus className="w-4 h-4 text-teal-400" />
                <span>{t("workshop.create_new")}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.workshop_name")} *</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.topics")}</label>
                  <input
                    type="text"
                    value={courseForm.topics || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, topics: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.start_date")} *</label>
                  <input
                    type="date"
                    value={courseForm.startDate}
                    onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.trainer")}</label>
                  <input
                    type="text"
                    value={courseForm.trainerName || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, trainerName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 space-y-0">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.start_time")}</label>
                    <input
                      type="time"
                      value={courseForm.startTime || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, startTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.end_time")}</label>
                    <input
                      type="time"
                      value={courseForm.endTime || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, endTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 space-y-0">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.from_age")}</label>
                    <input
                      type="number"
                      value={courseForm.ageFrom || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, ageFrom: parseInt(e.target.value) || undefined })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.to_age")}</label>
                    <input
                      type="number"
                      value={courseForm.ageTo || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, ageTo: parseInt(e.target.value) || undefined })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.target_group")}</label>
                  <select
                    value={courseForm.genderTarget || "الجميع"}
                    onChange={(e) => setCourseForm({ ...courseForm, genderTarget: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                  >
                    <option value="الجميع">{t("workshop.both")}</option>
                    <option value="ذكر">{t("workshop.male_only")}</option>
                    <option value="أنثى">{t("workshop.female_only")}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("workshop.total_seats")} *</label>
                  <input
                    type="number"
                    value={courseForm.maxSeats}
                    onChange={(e) => setCourseForm({ ...courseForm, maxSeats: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold text-sm rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingCourse ? (
                    <span>{t("common.loading")}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t("workshop.create_btn")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* قائمة الورش */}
          {loadingCourses ? (
            <div className="text-center py-12 flex justify-center items-center gap-2 text-slate-600 dark:text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
              <span>{t("common.loading")}</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">{t("workshop.no_workshops")}</p>
              <p className="text-xs">{t("workshop.add_first_workshop")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  {/* ترويسة الورشة */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{course.title}</h3>
                        {course.topics && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"><span className="font-semibold">{t("workshop.topics")}:</span> {course.topics}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mr-4">
                        <span className={`text-xs px-3 py-1.5 border rounded-full font-bold ${
                          course.registrations.length >= course.maxSeats 
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                            : "bg-teal-500/10 border-teal-500/20 text-teal-400"
                        }`}>
                          {course.registrations.length} / {course.maxSeats} {t("workshop.registrations")}
                        </span>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-xl transition-all cursor-pointer"
                          title={t("workshop.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* معلومات الورشة */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-teal-500" />
                        <span>
                          {new Date(course.startDate).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                          {course.startTime && course.endTime && ` (${course.startTime} - ${course.endTime})`}
                        </span>
                      </span>
                      {course.trainerName && (
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-cyan-500" />
                          <span>{t("workshop.trainer")}: {course.trainerName}</span>
                        </span>
                      )}
                      {(course.ageFrom || course.ageTo) && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-amber-500" />
                          <span>{t("workshop.age_group")}: {course.ageFrom || t("workshop.both")} - {course.ageTo || t("workshop.both")}</span>
                        </span>
                      )}
                      {course.genderTarget && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span>{t("register.gender")}: {course.genderTarget}</span>
                        </span>
                      )}
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setRegisterCourseId(registerCourseId === course.id ? null : course.id);
                          setRegisterMemberId("");
                          setRegisterMsg(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          registerCourseId === course.id
                            ? "bg-teal-500 text-slate-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{t("reception.register_visit")}</span>
                      </button>
                      <button
                        onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>{t("workshop.registrations")}</span>
                        {expandedCourseId === course.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* نموذج تسجيل عضو في الورشة */}
                  {registerCourseId === course.id && (
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-5 py-4 animate-fadeIn">
                      <form onSubmit={handleRegisterMember} className="flex items-end gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t("reception.id_col")}</label>
                          <input
                            type="text"
                            value={registerMemberId}
                            onChange={(e) => setRegisterMemberId(e.target.value)}
                            placeholder="مثال: 1001"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none transition-all uppercase"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={registeringMember}
                          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        >
                          {registeringMember ? t("common.loading") : t("reception.register")}
                        </button>
                      </form>
                      {registerMsg && (
                        <div className={`mt-3 text-xs font-semibold px-3 py-2 rounded-xl ${
                          registerMsg.success
                            ? "bg-teal-950/30 border border-teal-800 text-teal-400"
                            : "bg-rose-950/30 border border-rose-800 text-rose-400"
                        }`}>
                          {registerMsg.text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* قائمة المسجلين */}
                  {expandedCourseId === course.id && (
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 px-5 py-4 animate-fadeIn">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-4 h-4 text-teal-400" />
                          <span>{t("workshop.registrations")} ({course.registrations.length})</span>
                        </h4>

                        {(employee.role === "ADMIN" || employee.canExportWorkshops) && course.registrations.length > 0 && (
                          <button
                            onClick={() => handleExportCourseExcel(course)}
                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>تصدير Excel</span>
                          </button>
                        )}
                      </div>

                      {course.registrations.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                          {t("reception.no_results")}
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {course.registrations.map((reg) => (
                            <div key={reg.id} className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-teal-400">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{reg.member.fullName}</span>
                                  <span className="text-slate-500 dark:text-slate-400">{reg.member.specialization} • {reg.member.degree}</span>
                                </div>
                              </div>
                              <div className="text-left space-y-0.5">
                                <span className="font-mono text-teal-400 font-semibold block">{reg.member.id}</span>
                                <span className="text-slate-500 dark:text-slate-400 block">{reg.member.phone}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
