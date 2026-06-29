"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  Search,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  LogOut,
  Check,
  X,
  AlertCircle,
  Eye,
  Calendar,
  FileSpreadsheet
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import * as XLSX from "xlsx";
import {
  getFilteredMembers,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  listEmployees,
  logoutEmployee,
  toggleBlacklistStatus
} from "../actions/employeeActions";

type Visit = {
  id: string;
  purpose: string;
  details: string | null;
  date: Date;
};

type Activity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  date: Date;
  time: string | null;
  location: string | null;
};

type Registration = {
  id: string;
  course: {
    title: string;
  };
};

type MemberData = {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  nationality: string;
  phone: string;
  address: string;
  degree: string;
  specialization: string;
  nationalId: string;
  idImage: string | null;
  isBlacklisted: boolean;
  createdAt: Date;
  visits: Visit[];
  activities: Activity[];
  registrations: Registration[];
};

type Employee = {
  id: string;
  fullName: string;
  employeeCode: string;
  role: string;
  canExportWorkshops: boolean;
  canExportVisitors: boolean;
  createdAt: Date;
};

export default function EmployeeDashboardClient({
  employee
}: {
  employee: {
    id: string;
    fullName: string;
    employeeCode: string;
    role: string;
    canExportWorkshops: boolean;
    canExportVisitors: boolean;
  };
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "employees">("dashboard");

  // ---- حالات لوحة البيانات ----
  const [members, setMembers] = useState<MemberData[]>([]);
  const [filterType, setFilterType] = useState<"all" | "today" | "week">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

  // ---- حالات التنبيهات ----
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---- حالات إدارة الموظفين ----
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState({
    fullName: "",
    employeeCode: "",
    role: "EMPLOYEE",
    canExportWorkshops: false,
    canExportVisitors: false
  });
  const [confirmCode, setConfirmCode] = useState("");
  const [submittingEmp, setSubmittingEmp] = useState(false);
  const [togglingBlacklist, setTogglingBlacklist] = useState(false);

  // جلب الأعضاء المفلترين
  const fetchMembers = async () => {
    setLoading(true);
    setErrorMsg(null);
    const result = await getFilteredMembers(filterType, searchQuery);
    setLoading(false);
    if (result.success && result.members) {
      setMembers(result.members as MemberData[]);
    } else {
      setErrorMsg(result.error || "فشل جلب بيانات الأعضاء");
    }
  };

  const handleToggleBlacklist = async (memberId: string, currentStatus: boolean) => {
    if (!window.confirm(currentStatus ? "هل أنت متأكد من إزالة هذا العضو من القائمة السوداء؟" : "هل أنت متأكد من إضافة هذا العضو إلى القائمة السوداء؟")) return;
    setTogglingBlacklist(true);
    const result = await toggleBlacklistStatus(memberId, !currentStatus);
    setTogglingBlacklist(false);
    if (result.success) {
      setSuccessMsg("تم تحديث حالة القائمة السوداء بنجاح!");
      fetchMembers();
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember({ ...selectedMember, isBlacklisted: !currentStatus });
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(result.error || "فشل تحديث حالة القائمة السوداء");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // جلب الموظفين (فقط للمدراء)
  const fetchEmployees = async () => {
    if (employee.role !== "ADMIN") return;
    setLoadingEmployees(true);
    const result = await listEmployees();
    setLoadingEmployees(false);
    if (result.success && result.employees) {
      setEmployees(result.employees as Employee[]);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filterType]);

  useEffect(() => {
    if (activeTab === "employees") {
      fetchEmployees();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    await logoutEmployee();
    router.push("/employee/login");
    router.refresh();
  };

  // تصدير البيانات إلى Excel (.xlsx)
  const handleExportExcel = () => {
    if (employee.role !== "ADMIN" && !employee.canExportVisitors) {
      setErrorMsg("ليس لديك صلاحية لتصدير هذه البيانات.");
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    if (members.length === 0) {
      setErrorMsg("لا توجد بيانات متاحة لتصديرها.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    try {
      setSuccessMsg(null);
      setErrorMsg(null);

      // تحضير البيانات بأعمدة منظمة باللغة العربية
      const dataToExport = members.map((m) => ({
        "رقم العضوية": m.id,
        "الاسم الكامل": m.fullName,
        "العمر": m.age,
        "الجنس": m.gender,
        "الجنسية": m.nationality,
        "رقم الهاتف": m.phone,
        "العنوان": m.address,
        "المؤهل التعليمي": m.degree,
        "التخصص": m.specialization,
        "رقم الهوية": m.nationalId,
        "تاريخ التسجيل": new Date(m.createdAt).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        "عدد الزيارات": m.visits.length,
        "آخر زيارة": m.visits[0]
          ? new Date(m.visits[0].date).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
          : "لا يوجد زيارات"
      }));

      // إنشاء ورقة العمل والمصنف
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات الأعضاء");

      // ضبط اتجاه الورقة لتكون من اليمين لليسار (RTL) للغة العربية
      worksheet["!dir"] = "rtl";

      // اسم الملف بناءً على الفلتر المختار
      const filterLabels = {
        all: "الكل",
        today: "اليوم",
        week: "هذا_الأسبوع"
      };
      const fileName = `enjaz_members_${filterLabels[filterType]}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      // كتابة وتنزيل الملف
      XLSX.writeFile(workbook, fileName);

      setSuccessMsg("تم تصدير ملف Excel بنجاح! 📊");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Excel Export Error:", err);
      setErrorMsg("حدث خطأ أثناء محاولة تصدير البيانات إلى Excel.");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // إدارة الموظفين: إنشاء أو تعديل موظف
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.fullName.trim()) return;

    // التحقق من تطابق الرمزين
    if (empForm.employeeCode !== confirmCode) {
      setErrorMsg("رمز الموظف وتأكيده غير متطابقين!");
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    setSubmittingEmp(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let result;
    if (editingEmployee) {
      result = await updateEmployee(
        editingEmployee.id,
        {
          fullName: empForm.fullName,
          employeeCode: empForm.employeeCode || undefined,
          role: empForm.role,
          canExportWorkshops: empForm.canExportWorkshops,
          canExportVisitors: empForm.canExportVisitors
        },
        confirmCode
      );
    } else {
      result = await createEmployee(empForm, confirmCode);
    }

    setSubmittingEmp(false);

    if (result.success) {
      setSuccessMsg(editingEmployee ? "تم تعديل حساب الموظف بنجاح!" : "تم إنشاء حساب الموظف بنجاح! 🎉");
      setEmpForm({ fullName: "", employeeCode: "", role: "EMPLOYEE", canExportWorkshops: false, canExportVisitors: false });
      setConfirmCode("");
      setEditingEmployee(null);
      fetchEmployees();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(result.error || "فشل حفظ بيانات الموظف");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // حذف موظف
  const handleDeleteEmp = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا الموظف؟")) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await deleteEmployee(id);
    if (result.success) {
      setSuccessMsg("تم حذف الموظف بنجاح.");
      fetchEmployees();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(result.error || "فشل حذف الموظف");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // اختيار موظف للتعديل
  const handleStartEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpForm({
      fullName: emp.fullName,
      employeeCode: "", // نترك الرمز فارغاً إلا إذا أراد تغييره
      role: emp.role,
      canExportWorkshops: emp.canExportWorkshops || false,
      canExportVisitors: emp.canExportVisitors || false
    });
    setConfirmCode("");
  };

  return (
    <main className="min-h-screen pb-24 text-slate-800 dark:text-slate-100 flex flex-col items-center">
      {/* هيدر الترويسة الفخمة */}
      <header className="w-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 py-4 px-6 flex justify-between items-center max-w-7xl">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{t("employee.title")}</h1>
          <span className="text-xs text-slate-600 dark:text-slate-400">{t("employee.subtitle")}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-left items-end">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{employee.fullName}</span>
            <span className="text-[10px] text-teal-400 font-bold">
              {employee.role === "ADMIN" ? "مدير النظام" : "موظف الاستقبال"}
            </span>
          </div>

          <button
            onClick={() => router.push("/reception")}
            className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700/50"
          >
            {t("employee.reception_screen")}
          </button>

          <button
            onClick={handleLogout}
            className="text-xs text-rose-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 bg-rose-950/20 hover:bg-rose-600 rounded-xl transition-all border border-rose-900/50 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t("employee.logout")}</span>
          </button>
        </div>
      </header>

      <div className="w-full max-w-7xl px-4 py-6 space-y-6 flex-1">
        {/* التنبيهات المنبثقة */}
        {successMsg && (
          <div className="bg-teal-950/45 border border-teal-800/60 p-4 rounded-2xl flex items-center gap-3 text-teal-300 text-sm animate-fadeIn">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-950/45 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* التبويبات الفخمة */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "dashboard"
                ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-800/30"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>{t("employee.members_dashboard")}</span>
          </button>

          {employee.role === "ADMIN" && (
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "employees"
                  ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-800/30"
                }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{t("employee.manage_employees")}</span>
            </button>
          )}
        </div>

        {/* ---- تبويب لوحة البيانات وتصدير البيانات ---- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fadeIn">
            {/* الفلاتر والبحث وتصدير Excel */}
            <div className="bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* فلاتر الوقت */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-2">{t("employee.time_filter")}</span>
                  {[
                    { label: t("employee.filter_today"), value: "today" },
                    { label: t("employee.filter_week"), value: "week" },
                    { label: t("employee.filter_all"), value: "all" }
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setFilterType(btn.value as "all" | "today" | "week")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterType === btn.value
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-teal-500/45 shadow"
                          : "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border border-slate-900 hover:text-slate-900 dark:hover:text-white hover:border-slate-200 dark:border-slate-800"
                        }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* زر تصدير Excel */}
                {(employee.role === "ADMIN" || employee.canExportVisitors) && (
                  <button
                    onClick={handleExportExcel}
                    className="px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all self-start lg:self-auto"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{t("employee.export_excel")}</span>
                  </button>
                )}
              </div>

              {/* البحث بالاسم أو الهوية أو رقم الهاتف */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={t("employee.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-600 outline-none transition-all"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-slate-500 dark:text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t("employee.search_btn")}</span>
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      // نقوم بالبحث فوراً بالقيمة الفارغة
                      setTimeout(() => fetchMembers(), 50);
                    }}
                    className="bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-3 rounded-xl border border-slate-900 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>

            {/* جدول المستخدمين */}
            <div className="bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  <span>{t("employee.results")} ({members.length})</span>
                </h3>

                <button
                  onClick={fetchMembers}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all border border-slate-200 dark:border-slate-700/50 cursor-pointer"
                  title="تحديث البيانات"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-400" : ""}`} />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 flex flex-col justify-center items-center gap-2 text-slate-600 dark:text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
                  <span className="text-sm">{t("common.loading")}</span>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-2">
                  <Users className="w-12 h-12 mx-auto text-slate-700" />
                  <p className="font-bold text-slate-600 dark:text-slate-400">{t("employee.no_data")}</p>
                  <p className="text-xs">{t("employee.check_filter")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
                        <th className="py-4 px-6 rtl:text-right ltr:text-left">{t("employee.id_col")}</th>
                        <th className="py-4 px-6 rtl:text-right ltr:text-left">{t("employee.name_col")}</th>
                        <th className="py-4 px-6 rtl:text-right ltr:text-left">{t("employee.phone_col")}</th>
                        <th className="py-4 px-6 rtl:text-right ltr:text-left">{t("employee.spec_col")}</th>
                        <th className="py-4 px-6 rtl:text-right ltr:text-left">{t("employee.degree_col")}</th>
                        <th className="py-4 px-6 rtl:text-right ltr:text-left">{t("employee.date_col")}</th>
                        <th className="py-4 px-6 text-center">{t("employee.visits_col")}</th>
                        <th className="py-4 px-6 text-center">{t("employee.actions_col")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {members.map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-white/80 dark:bg-slate-900/30 transition-all border-b border-slate-200 dark:border-slate-850/50"
                        >
                          <td className="py-4 px-6 font-mono text-teal-400 font-bold">{m.id}</td>
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white rtl:text-right ltr:text-left">
                            <div className="flex items-center gap-2 rtl:justify-end ltr:justify-start">
                              {m.isBlacklisted && (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] rounded-full font-bold">
                                  {t("employee.blacklist_badge")}
                                </span>
                              )}
                              <span>{m.fullName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-300 dir-ltr">{m.phone}</td>
                          <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">{m.specialization}</td>
                          <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">{m.degree}</td>
                          <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(m.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full font-bold">
                              {m.visits.length}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => setSelectedMember(m)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-500 hover:text-slate-900 text-teal-400 rounded-lg transition-all border border-slate-200 dark:border-slate-700/50 cursor-pointer"
                              title={t("common.view_details") || "عرض التفاصيل الكاملة"}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- تبويب إدارة الموظفين (للمدير فقط) ---- */}
        {activeTab === "employees" && employee.role === "ADMIN" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* نموذج إنشاء/تعديل موظف */}
            <div className="lg:col-span-1 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 h-fit relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-400" />
                  <span>{editingEmployee ? t("employee.edit_employee") : t("employee.create_employee")}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingEmployee
                    ? "قم بتعديل بيانات الحساب. اترك حقل الرمز فارغاً للاحتفاظ بالرمز الحالي."
                    : "أضف موظفاً جديداً وعيّن له الرمز والصلاحيات."}
                </p>
              </div>

              <form onSubmit={handleSaveEmployee} className="space-y-4">
                {/* الاسم الكامل */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">{t("employee.emp_name")}</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: خالد محمد الحربي"
                    value={empForm.fullName}
                    onChange={(e) => setEmpForm({ ...empForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-650 outline-none transition-all"
                  />
                </div>

                {/* الرمز */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">
                    {t("employee.emp_code")} {editingEmployee && `(${t("common.optional") || "اختياري"})`}
                  </label>
                  <input
                    type="password"
                    required={!editingEmployee}
                    placeholder={editingEmployee ? "اتركه فارغاً لعدم التغيير" : "مثال: EMP789"}
                    value={empForm.employeeCode}
                    onChange={(e) => setEmpForm({ ...empForm, employeeCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-650 outline-none transition-all font-mono"
                  />
                </div>

                {/* تأكيد الرمز */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">
                    {t("employee.emp_confirm_code")} {editingEmployee && `(${t("common.optional") || "اختياري"})`}
                  </label>
                  <input
                    type="password"
                    required={!!empForm.employeeCode}
                    placeholder={editingEmployee ? "تأكيد الرمز الجديد" : "أعد إدخال الرمز للتأكيد"}
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-650 outline-none transition-all font-mono"
                  />
                </div>

                {/* الدور / الصلاحية */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">{t("employee.emp_role")}</label>
                  <select
                    value={empForm.role}
                    onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all"
                  >
                    <option value="EMPLOYEE">{t("employee.role_emp")}</option>
                    <option value="ADMIN">{t("employee.role_admin")}</option>
                  </select>
                </div>

                {/* صلاحيات التصدير */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="exportWorkshops"
                      checked={empForm.canExportWorkshops}
                      onChange={(e) => setEmpForm({ ...empForm, canExportWorkshops: e.target.checked })}
                      className="w-4 h-4 text-teal-500 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded focus:ring-teal-500 focus:ring-offset-slate-900"
                    />
                    <label htmlFor="exportWorkshops" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      {t("employee.export_workshops_perm")}
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="exportVisitors"
                      checked={empForm.canExportVisitors}
                      onChange={(e) => setEmpForm({ ...empForm, canExportVisitors: e.target.checked })}
                      className="w-4 h-4 text-teal-500 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded focus:ring-teal-500 focus:ring-offset-slate-900"
                    />
                    <label htmlFor="exportVisitors" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      {t("employee.export_visitors_perm")}
                    </label>
                  </div>
                </div>

                {/* أزرار الحفظ */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submittingEmp}
                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-650 disabled:bg-slate-100 dark:bg-slate-800 text-slate-900 disabled:text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {submittingEmp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t("common.loading")}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t("employee.save_account")}</span>
                      </>
                    )}
                  </button>

                  {editingEmployee && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEmployee(null);
                        setEmpForm({ fullName: "", employeeCode: "", role: "EMPLOYEE", canExportWorkshops: false, canExportVisitors: false });
                        setConfirmCode("");
                      }}
                      className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      {t("common.cancel")}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* جدول الموظفين */}
            <div className="lg:col-span-2 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden h-fit">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/20">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t("employee.current_employees")}</h3>
              </div>

              {loadingEmployees ? (
                <div className="text-center py-12 flex justify-center items-center gap-2 text-slate-600 dark:text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
                  <span>{t("common.loading")}</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
                        <th className="py-3 px-5 rtl:text-right ltr:text-left">{t("employee.emp_name")}</th>
                        <th className="py-3 px-5 rtl:text-right ltr:text-left">{t("employee.role_col")}</th>
                        <th className="py-3 px-5 rtl:text-right ltr:text-left">{t("employee.code_col")}</th>
                        <th className="py-3 px-5 text-center">{t("employee.actions_col")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-white/80 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-850/50">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900 dark:text-white">{emp.fullName}</div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              تاريخ الإنشاء: {new Date(emp.createdAt).toLocaleDateString("ar-EG")}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${emp.role === "ADMIN"
                                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                }`}
                            >
                              {emp.role}
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {emp.canExportWorkshops && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-green-500/10 text-green-400 border border-green-500/20 w-max">
                                  يصدّر الورش
                                </span>
                              )}
                              {emp.canExportVisitors && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 w-max">
                                  يصدّر الزوار
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-xs text-slate-500 dark:text-slate-400">
                            {emp.employeeCode.slice(0, 2)}****
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleStartEdit(emp)}
                                className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-500 hover:text-slate-900 text-teal-400 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-all cursor-pointer"
                                title="تعديل الموظف"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmp(emp.id)}
                                disabled={employee.id === emp.id}
                                className="p-1 bg-rose-950/20 hover:bg-rose-600 hover:text-slate-900 dark:hover:text-white text-rose-400 rounded-lg border border-rose-900/50 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                title="حذف الموظف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* مودال التفاصيل الكاملة للمستخدم المحدد */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* الاسم ومعرف العضوية */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-teal-500/25 to-cyan-500/25 rounded-2xl flex items-center justify-center text-teal-400 font-bold border border-teal-500/30">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedMember.fullName}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t("member.membership_label")}: <span className="font-mono text-teal-400 font-bold">{selectedMember.id}</span>
                </span>
                {selectedMember.isBlacklisted && (
                  <span className="mr-2 px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs rounded-full font-bold">
                    ⚠️ {t("employee.blacklist_badge")}
                  </span>
                )}
              </div>
            </div>

            {/* أزرار الإدارة الخاصة بالمدير */}
            {employee.role === "ADMIN" && (
              <div className="flex justify-end border-b border-slate-200 dark:border-slate-800 pb-4">
                <button
                  onClick={() => handleToggleBlacklist(selectedMember.id, selectedMember.isBlacklisted)}
                  disabled={togglingBlacklist}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 ${selectedMember.isBlacklisted
                      ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20"
                    }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {selectedMember.isBlacklisted ? "إزالة من القائمة السوداء" : "إضافة للقائمة السوداء"}
                </button>
              </div>
            )}

            {/* شبكة البيانات الشخصية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">رقم الهاتف</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 dir-ltr">{selectedMember.phone}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">رقم الهوية الوطنية</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">{selectedMember.nationalId}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">العمر / الجنس</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {selectedMember.age} سنة / {selectedMember.gender}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">الجنسية</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedMember.nationality}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">المؤهل الدراسي</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedMember.degree}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">التخصص الدراسي</span>
                <span className="font-semibold text-teal-400">{selectedMember.specialization}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center col-span-1 md:col-span-2">
                <span className="text-slate-500 dark:text-slate-400">عنوان السكن</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedMember.address}</span>
              </div>
            </div>

            {/* صورة الهوية إذا كانت موجودة */}
            {selectedMember.idImage && (
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850/50 p-4 rounded-2xl text-center space-y-2">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold block text-right">صورة الهوية الوطنية</span>
                <div className="flex justify-center border border-slate-200 dark:border-slate-850 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden">
                  <img
                    src={selectedMember.idImage}
                    alt="صورة الهوية"
                    className="max-h-40 rounded-lg object-contain"
                  />
                </div>
              </div>
            )}

            {/* قائمة الورش المسجلة */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                <span>الورش التدريبية المسجل فيها ({selectedMember.registrations.length})</span>
              </h4>
              {selectedMember.registrations.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 p-3 border border-slate-200 dark:border-slate-850/50 rounded-xl">
                  لم يسجل في أي ورشة بعد.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {selectedMember.registrations.map((reg) => (
                    <div key={reg.id} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850/50 p-3 rounded-xl">
                      <div className="font-bold text-slate-900 dark:text-white">{reg.course.title}</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        مسجل
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* سجل الزيارات الأخيرة */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>سجل الزيارات والحضور ({selectedMember.visits.length})</span>
              </h4>
              {selectedMember.visits.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 p-3 border border-slate-200 dark:border-slate-850/50 rounded-xl">
                  لا توجد زيارات مسجلة.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedMember.visits.map((v) => (
                    <div
                      key={v.id}
                      className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850/50 p-3 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-600 dark:text-slate-300 block">{v.purpose}</span>
                        {v.details && <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{v.details}</span>}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(v.date).toLocaleString("ar-EG")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
