"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

// 0. تهيئة مدير افتراضي إذا لم يكن هناك أي موظف
async function ensureDefaultAdmin() {
  try {
    const count = await prisma.employee.count();
    if (count === 0) {
      await prisma.employee.create({
        data: {
          fullName: "مدير النظام",
          employeeCode: "Al-Riyati",
          role: "ADMIN",
          canExportWorkshops: true,
          canExportVisitors: true,
        },
      });
    } else {
      // تحديث رمز الدخول القديم تلقائياً إن وجد
      await prisma.employee.updateMany({
        where: { employeeCode: "ADMIN123" },
        data: { employeeCode: "Al-Riyati" },
      });
    }
  } catch (err) {
    console.error("Error seeding default admin:", err);
  }
}

// 1. تسجيل دخول الموظف
export async function loginEmployee(code: string) {
  try {
    await ensureDefaultAdmin();

    const employee = await prisma.employee.findUnique({
      where: { employeeCode: code },
    });

    if (!employee) {
      return { success: false, error: "رمز الموظف غير صحيح أو غير مسجل في النظام" };
    }

    const cookieStore = await cookies();
    cookieStore.set("employee_session", employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 ساعات
      path: "/",
    });

    return { success: true, employee };
  } catch (error: unknown) {
    console.error("Error login employee:", error);
    return { success: false, error: "حدث خطأ غير متوقع أثناء تسجيل الدخول" };
  }
}

// 2. تسجيل خروج الموظف
export async function logoutEmployee() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("employee_session");
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false };
  }
}

// 3. جلب الموظف المسجل دخوله حالياً
export async function getLoggedInEmployee() {
  try {
    await ensureDefaultAdmin();

    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("employee_session")?.value;

    if (!sessionVal) return null;

    const employee = await prisma.employee.findUnique({
      where: { id: sessionVal },
    });

    return employee;
  } catch (error) {
    console.error("Error checking employee session:", error);
    return null;
  }
}

// 4. إنشاء موظف جديد
export async function createEmployee(
  data: { fullName: string; employeeCode: string; role: string; canExportWorkshops?: boolean; canExportVisitors?: boolean },
  confirmCode: string
) {
  try {
    // التحقق من الصلاحيات
    const caller = await getLoggedInEmployee();
    if (!caller || caller.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بإنشاء موظفين" };
    }

    if (!data.fullName.trim()) {
      return { success: false, error: "الرجاء إدخال الاسم الكامل للموظف" };
    }

    if (!data.employeeCode.trim()) {
      return { success: false, error: "الرجاء إدخال رمز الموظف" };
    }

    if (data.employeeCode !== confirmCode) {
      return { success: false, error: "رمزا الموظف غير متطابقين" };
    }

    // التحقق من تفرد الرمز
    const existing = await prisma.employee.findUnique({
      where: { employeeCode: data.employeeCode },
    });

    if (existing) {
      return { success: false, error: "رمز الموظف هذا مستخدم بالفعل لموظف آخر" };
    }

    const employee = await prisma.employee.create({
      data: {
        fullName: data.fullName,
        employeeCode: data.employeeCode,
        role: data.role,
        canExportWorkshops: data.canExportWorkshops || false,
        canExportVisitors: data.canExportVisitors || false,
      },
    });

    revalidatePath("/employee");
    return { success: true, employee };
  } catch (error: unknown) {
    console.error("Error creating employee:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل إنشاء حساب الموظف";
    return { success: false, error: errorMessage };
  }
}

// 5. تعديل بيانات موظف
export async function updateEmployee(
  id: string,
  data: { fullName: string; employeeCode?: string; role: string; canExportWorkshops?: boolean; canExportVisitors?: boolean },
  confirmCode?: string
) {
  try {
    // التحقق من الصلاحيات
    const caller = await getLoggedInEmployee();
    if (!caller || caller.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بتعديل بيانات الموظفين" };
    }

    if (!data.fullName.trim()) {
      return { success: false, error: "الرجاء إدخال الاسم الكامل" };
    }

    const updateData: { fullName: string; role: string; employeeCode?: string; canExportWorkshops?: boolean; canExportVisitors?: boolean } = {
      fullName: data.fullName,
      role: data.role,
      canExportWorkshops: data.canExportWorkshops,
      canExportVisitors: data.canExportVisitors,
    };

    if (data.employeeCode) {
      if (data.employeeCode !== confirmCode) {
        return { success: false, error: "رمزا الموظف غير متطابقين" };
      }

      // التحقق من تكرار الرمز
      const existing = await prisma.employee.findFirst({
        where: {
          employeeCode: data.employeeCode,
          NOT: { id },
        },
      });

      if (existing) {
        return { success: false, error: "رمز الموظف هذا مستخدم لموظف آخر" };
      }

      updateData.employeeCode = data.employeeCode;
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/employee");
    return { success: true, employee };
  } catch (error: unknown) {
    console.error("Error updating employee:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل تعديل حساب الموظف";
    return { success: false, error: errorMessage };
  }
}

// 6. حذف موظف
export async function deleteEmployee(id: string) {
  try {
    const caller = await getLoggedInEmployee();
    if (!caller || caller.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بحذف موظفين" };
    }

    if (caller.id === id) {
      return { success: false, error: "لا يمكنك حذف حسابك الشخصي أثناء تسجيل الدخول" };
    }

    await prisma.employee.delete({
      where: { id },
    });

    revalidatePath("/employee");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "فشل حذف الموظف" };
  }
}

// 7. عرض قائمة الموظفين
export async function listEmployees() {
  try {
    const caller = await getLoggedInEmployee();
    if (!caller || caller.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بعرض الموظفين" };
    }

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, employees };
  } catch (error) {
    console.error("Error listing employees:", error);
    return { success: false, error: "فشل تحميل قائمة الموظفين" };
  }
}

// 8. جلب وتصفية بيانات الأعضاء (جدول لوحة البيانات والتصدير)
export async function getFilteredMembers(filterType: string, searchQuery?: string) {
  try {
    const caller = await getLoggedInEmployee();
    if (!caller) {
      return { success: false, error: "غير مصرح لك بالوصول إلى هذه البيانات" };
    }

    const whereClause: Prisma.MemberWhereInput = {};

    // 1. تطبيق فلترة التاريخ
    if (filterType === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      whereClause.createdAt = { gte: startOfToday };
    } else if (filterType === "week") {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      whereClause.createdAt = { gte: startOfWeek };
    }

    // 2. تطبيق فلترة البحث بالاسم أو الرمز أو الهوية
    if (searchQuery && searchQuery.trim() !== "") {
      const trimmedSearch = searchQuery.trim();
      whereClause.OR = [
        { id: { contains: trimmedSearch } },
        { fullName: { contains: trimmedSearch } },
        { phone: { contains: trimmedSearch } },
        { nationalId: { contains: trimmedSearch } },
      ];
    }

    const members = await prisma.member.findMany({
      where: whereClause,
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, members };
  } catch (error) {
    console.error("Error getting filtered members:", error);
    return { success: false, error: "فشل جلب وتصفية بيانات المستخدمين" };
  }
}

// 9. إضافة أو إزالة عضو من القائمة السوداء
export async function toggleBlacklistStatus(memberId: string, status: boolean) {
  try {
    const caller = await getLoggedInEmployee();
    if (!caller || caller.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بتعديل القائمة السوداء" };
    }

    const member = await prisma.member.update({
      where: { id: memberId },
      data: { isBlacklisted: status },
    });

    revalidatePath("/employee");
    revalidatePath("/reception");
    return { success: true, isBlacklisted: member.isBlacklisted };
  } catch (error) {
    console.error("Error toggling blacklist status:", error);
    return { success: false, error: "فشل تعديل حالة القائمة السوداء" };
  }
}
