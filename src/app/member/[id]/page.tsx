import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import MemberDashboardClient from "./MemberDashboardClient";

export const revalidate = 0; // لضمان جلب البيانات فوراً دون كاشينج قديم

export default async function MemberDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const memberId = resolvedParams.id.toUpperCase();

  // جلب بيانات العضو مع الزيارات والأنشطة والورش المسجل فيها
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      visits: {
        orderBy: { date: "desc" },
      },
      activities: {
        orderBy: { date: "desc" },
      },
      registrations: {
        include: {
          course: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!member) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4">
          <div className="text-rose-400 font-bold text-5xl">404</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">العضوية غير موجودة</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            عذراً، لم نتمكن من العثور على أي ملف عضوية برقم المعرف <span className="font-mono text-rose-400 font-semibold">{memberId}</span>.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition-all inline-block"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // تمرير البيانات للمكون العميل لإضفاء التفاعلية والسرعة والتحكم في التنقل
  return <MemberDashboardClient member={member} />;
}
