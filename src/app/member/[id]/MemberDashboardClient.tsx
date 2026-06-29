"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  History,
  Info,
  X,
  BookOpen,
  Check,
  CalendarDays,
  RefreshCw
} from "lucide-react";
import { getCourses, registerForCourse } from "../../actions/courseActions";

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

type CourseInfo = {
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
};

type Registration = {
  id: string;
  courseId: string;
  memberId: string;
  createdAt: Date;
  course: CourseInfo;
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
  createdAt: Date;
  updatedAt: Date;
  visits: Visit[];
  activities: Activity[];
  registrations: Registration[];
};

type AvailableCourse = {
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
  registrations: { id: string }[];
};

export default function MemberDashboardClient({ member }: { member: MemberData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "activities" | "courses" | "card">("home");

  // تبويبات قائمة الأنشطة (الكل، الزيارات، الورش، الدراسة)
  const [activityFilter, setActivityFilter] = useState<"all" | "زيارة" | "ورشة" | "دراسة">("all");

  // النشاط المحدد لعرض تفاصيله (الصفحة 9)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // ---- حالات الورش ----
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [registeringCourseId, setRegisteringCourseId] = useState<string | null>(null);
  const [courseMsg, setCourseMsg] = useState<{ text: string; success: boolean } | null>(null);

  // حساب الإحصائيات
  const totalVisits = member.visits.length;
  const totalActivities = member.activities.length;
  const lastVisitDate = member.visits[0]
    ? new Date(member.visits[0].date).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "لا يوجد زيارات مسجلة";

  const memberSince = new Date(member.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // تصفية الأنشطة
  const filteredActivities = member.activities.filter((act) => {
    if (activityFilter === "all") return true;
    return act.type === activityFilter;
  });

  // الورش المسجل فيها العضو (IDs)
  const registeredCourseIds = new Set(member.registrations.map((r) => r.courseId));

  // جلب الورش المتاحة
  const fetchCourses = async () => {
    setLoadingCourses(true);
    const result = await getCourses();
    setLoadingCourses(false);
    if (result.success && result.courses) {
      setAvailableCourses(result.courses as AvailableCourse[]);
    }
  };

  useEffect(() => {
    if (activeTab === "courses") {
      fetchCourses();
    }
  }, [activeTab]);

  // تسجيل العضو في ورشة
  const handleRegisterForCourse = async (courseId: string) => {
    setRegisteringCourseId(courseId);
    setCourseMsg(null);

    const result = await registerForCourse(courseId, member.id);

    setRegisteringCourseId(null);
    if (result.success) {
      setCourseMsg({ text: "تم التسجيل في الورشة بنجاح! 🎉", success: true });
      fetchCourses();
      // تحديث الصفحة لتحديث بيانات العضو
      setTimeout(() => router.refresh(), 500);
    } else {
      setCourseMsg({ text: result.error || "فشل التسجيل في الورشة", success: false });
    }

    // إخفاء الرسالة بعد 3 ثواني
    setTimeout(() => setCourseMsg(null), 3000);
  };

  return (
    <main className="min-h-screen pb-24 text-slate-800 dark:text-slate-100 flex flex-col items-center">
      {/* هيدر الترويسة الفخمة */}
      <header className="w-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 py-4 px-6 flex justify-between items-center max-w-4xl">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">المنصة</h1>
          <span className="text-xs text-slate-600 dark:text-slate-400">لوحة تحكم الأعضاء</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-all border border-slate-700/50"
          >
            خروج
          </button>
        </div>
      </header>

      <div className="w-full max-w-4xl px-4 py-6 space-y-6 flex-1">
        {/* التبويب 1: الصفحة الرئيسية للعضو */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-fadeIn">
            {/* بطاقة الترحيب والتعريف السريع */}
            <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl" />
              <div className="w-20 h-20 bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center text-teal-400">
                <User className="w-10 h-10" />
              </div>
              <div className="text-center md:text-right space-y-2 flex-1">
                <div className="text-xs text-teal-400 font-bold">مرحباً بك عضو المنصة 👋</div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{member.fullName}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-teal-500" />
                    <span>تاريخ العضوية: {memberSince}</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                    ID: <span className="font-mono text-teal-400">{member.id}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-md">
                <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold block">إجمالي الزيارات</span>
                <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{totalVisits}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-md">
                <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold block">الأنشطة المنجزة</span>
                <span className="text-2xl md:text-3xl font-black text-teal-400">{totalActivities}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-md">
                <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold block">آخر زيارة مسجلة</span>
                <span className="text-xs md:text-sm font-bold text-cyan-300 truncate block mt-2">{lastVisitDate}</span>
              </div>
            </div>

            {/* بيانات العضوية المفصلة */}
            <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Info className="w-5 h-5 text-teal-400" />
                <span>المعلومات الشخصية والتعليمية</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">رقم الهاتف</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 dir-ltr">{member.phone}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">الجنسية</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{member.nationality}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">السكن الحالي</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{member.address}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">المؤهل الأكاديمي</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{member.degree}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex justify-between items-center col-span-1 md:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">التخصص الدراسي</span>
                  <span className="font-semibold text-teal-400">{member.specialization}</span>
                </div>
              </div>
            </div>

            {/* عرض صورة الهوية إذا كانت مرفوعة */}
            {member.idImage && (
              <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-3 shadow-xl text-center">
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 text-right">صورة الهوية الموثقة</h3>
                <div className="flex justify-center border border-slate-200 dark:border-slate-850 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/40 overflow-hidden">
                  <img src={member.idImage} alt="هوية العضو" className="max-h-48 rounded-xl object-contain" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* التبويب 2: سجل الزيارات والأنشطة */}
        {activeTab === "activities" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-6 h-6 text-teal-400" />
                <span>سجل النشاطات والحضور</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">تابع جميع ورشك التدريبية، وزياراتك اليومية للمركز.</p>
            </div>

            {/* فلتر الأنشطة */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { label: "الكل", value: "all" },
                { label: "الزيارات", value: "زيارة" },
                { label: "الورش", value: "ورشة" },
                { label: "الدراسة", value: "دراسة" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActivityFilter(tab.value as "all" | "زيارة" | "ورشة" | "دراسة")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activityFilter === tab.value
                      ? "bg-teal-500 text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* قائمة الأنشطة */}
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 bg-white/80 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400">
                  لا توجد أنشطة مسجلة ضمن هذا التصنيف حالياً.
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 hover:border-teal-500/50 hover:bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-teal-400 font-bold border border-slate-200 dark:border-slate-800 group-hover:border-teal-500/30">
                        {act.type.slice(0, 2)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-300 transition-colors text-sm md:text-base">
                          {act.title}
                        </h4>
                        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{act.time || "طوال اليوم"}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{act.location || "المقر"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left space-y-1">
                      <span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 group-hover:bg-teal-500 group-hover:text-slate-900 font-semibold transition-all">
                        تفاصيل
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {new Date(act.date).toLocaleDateString("ar-EG", { month: "numeric", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* التبويب 3: الورش التدريبية */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-teal-400" />
                <span>الورش التدريبية</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">تصفّح الورش المتاحة وسجّل فيها مباشرة.</p>
            </div>

            {/* رسالة تسجيل */}
            {courseMsg && (
              <div className={`text-sm font-semibold px-4 py-3 rounded-2xl animate-fadeIn ${
                courseMsg.success
                  ? "bg-teal-950/40 border border-teal-800 text-teal-300"
                  : "bg-rose-950/40 border border-rose-800 text-rose-300"
              }`}>
                {courseMsg.text}
              </div>
            )}

            {/* الورش المسجل فيها */}
            {member.registrations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" />
                  <span>ورشك المسجّلة ({member.registrations.length})</span>
                </h3>
                <div className="space-y-3">
                  {member.registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="bg-teal-950/20 border border-teal-500/30 rounded-2xl p-4 space-y-2 shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{reg.course.title}</h4>
                        <span className="text-[10px] px-2.5 py-1 bg-teal-500/20 rounded-full text-teal-400 font-bold whitespace-nowrap">
                          مسجّل ✓
                        </span>
                      </div>
                      {reg.course.topics && (
                        <p className="text-xs text-slate-600 dark:text-slate-400"><span className="font-semibold">المحاور:</span> {reg.course.topics}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
                          <span>
                            {new Date(reg.course.startDate).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                            {reg.course.startTime && reg.course.endTime && ` (${reg.course.startTime} - ${reg.course.endTime})`}
                          </span>
                        </span>
                        {reg.course.trainerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-cyan-500" />
                            <span>المدرب: {reg.course.trainerName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الورش المتاحة */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>جميع الورش المتاحة</span>
              </h3>

              {loadingCourses ? (
                <div className="text-center py-12 flex justify-center items-center gap-2 text-slate-600 dark:text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
                  <span>جاري تحميل الورش...</span>
                </div>
              ) : availableCourses.length === 0 ? (
                <div className="text-center py-12 bg-white/80 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">لا توجد ورش متاحة حالياً</p>
                  <p className="text-xs">سيتم إضافة ورش جديدة قريباً من قبل إدارة المركز.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableCourses.map((course) => {
                    const isRegistered = registeredCourseIds.has(course.id);
                    return (
                      <div
                        key={course.id}
                        className={`border rounded-2xl p-4 space-y-3 shadow-md transition-all ${
                          isRegistered
                            ? "bg-white/80 dark:bg-slate-900/20 border-slate-800/50 opacity-70"
                            : "bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-teal-500/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{course.title}</h4>
                            {course.topics && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"><span className="font-semibold">المحاور:</span> {course.topics}</p>
                            )}
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap mr-3 border ${
                            course.registrations.length >= course.maxSeats
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}>
                            {course.registrations.length} / {course.maxSeats} مقعد
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
                            <span>
                              {new Date(course.startDate).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                              {course.startTime && course.endTime && ` (${course.startTime} - ${course.endTime})`}
                            </span>
                          </span>
                          {course.trainerName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-cyan-500" />
                              <span>المدرب: {course.trainerName}</span>
                            </span>
                          )}
                          {(course.ageFrom || course.ageTo) && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-amber-500" />
                              <span>العمر: {course.ageFrom || "الكل"} - {course.ageTo || "الكل"}</span>
                            </span>
                          )}
                          {course.genderTarget && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-purple-500" />
                              <span>الجنس: {course.genderTarget}</span>
                            </span>
                          )}
                        </div>

                        <div className="pt-2">
                          {isRegistered ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
                              <Check className="w-4 h-4" />
                              أنت مسجّل في هذه الورشة
                            </span>
                          ) : course.registrations.length >= course.maxSeats ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
                              <X className="w-4 h-4" />
                              الورشة ممتلئة
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRegisterForCourse(course.id)}
                              disabled={registeringCourseId === course.id}
                              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-teal-500/10"
                            >
                              {registeringCourseId === course.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>جاري الحجز...</span>
                                </>
                              ) : (
                                <>
                                  <BookOpen className="w-4 h-4" />
                                  <span>الحجز</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* التبويب 4: الهوية الرقمية الكرت */}
        {activeTab === "card" && (
          <div className="space-y-6 flex flex-col items-center justify-center py-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <CreditCard className="w-6 h-6 text-teal-400" />
                <span>بطاقة العضوية الرقمية</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">أظهر هذه البطاقة لموظف الاستقبال عند دخولك المركز.</p>
            </div>

            {/* البطاقة ذات طابع زجاجي نيون */}
            <div className="w-full max-w-sm bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border-2 border-teal-500/50 rounded-3xl p-6 shadow-2xl shadow-teal-500/5 relative overflow-hidden space-y-6 transform hover:scale-[1.01] transition-all">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] tracking-widest text-teal-400 font-bold block uppercase">Platform</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">بطاقة عضوية معتمدة</span>
                </div>
                <div className="w-8 h-8 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 font-bold border border-teal-500/30">
                  إ
                </div>
              </div>

              <div className="py-2 text-center space-y-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-wide">{member.fullName}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{member.specialization}</div>

                <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 py-3 px-6 rounded-2xl inline-block">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold mb-1">المعرف الرقمي للمسح</span>
                  <span className="text-2xl font-black text-teal-400 font-mono tracking-wider">{member.id}</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                <span>تاريخ الإنشاء: {memberSince}</span>
                <span className="text-teal-400 font-bold">الحالة: نشط</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center">
              💡 يظهر هذا المعرف الرقمي فوراً في لوحة تحكم الاستقبال بمجرد قيام موظف الاستقبال بالبحث عنك.
            </div>
          </div>
        )}
      </div>

      {/* الصفحة 9: تفاصيل النشاط أو الزيارة (تفاصيل كاملة تظهر كمودال منزلق فخم) */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full uppercase">
                {selectedActivity.type}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white pt-2">{selectedActivity.title}</h3>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-teal-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">التاريخ</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {new Date(selectedActivity.date).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-teal-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">الوقت</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedActivity.time || "طوال اليوم"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-teal-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">المكان / القاعة</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedActivity.location || "المقر الرئيسي"}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">الوصف والتفاصيل</span>
                <p className="bg-slate-50 dark:bg-slate-950/60 border border-slate-950 p-4 rounded-2xl text-slate-600 dark:text-slate-300 leading-relaxed text-xs md:text-sm">
                  {selectedActivity.description || "لا توجد تفاصيل إضافية مسجلة لهذا النشاط."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedActivity(null)}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              إغلاق التفاصيل
            </button>
          </div>
        </div>
      )}

      {/* قائمة التنقل السفلية المتجاوبة (Bottom Navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80 px-4 py-3 z-40 flex justify-around max-w-md mx-auto rounded-t-3xl shadow-2xl">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === "home" ? "text-teal-400 scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab("activities")}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === "activities" ? "text-teal-400 scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300"
          }`}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold">الأنشطة</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === "courses" ? "text-teal-400 scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300"
          }`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold">الورش</span>
        </button>

        <button
          onClick={() => setActiveTab("card")}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === "card" ? "text-teal-400 scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300"
          }`}
        >
          <CreditCard className="w-6 h-6" />
          <span className="text-[10px] font-bold">بطاقتي</span>
        </button>
      </nav>
    </main>
  );
}
