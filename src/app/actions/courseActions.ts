"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// أنواع البيانات
export type CreateCourseData = {
  title: string;
  topics?: string;
  startDate: string; // ISO string
  startTime?: string;
  endTime?: string;
  trainerName?: string;
  ageFrom?: number;
  ageTo?: number;
  genderTarget?: string;
  maxSeats: number;
};

// 1. إنشاء ورشة جديدة (بواسطة الموظف)
export async function createCourse(data: CreateCourseData) {
  try {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        topics: data.topics || null,
        startDate: new Date(data.startDate),
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        trainerName: data.trainerName || null,
        ageFrom: data.ageFrom || null,
        ageTo: data.ageTo || null,
        genderTarget: data.genderTarget || null,
        maxSeats: data.maxSeats || 50,
      },
    });

    revalidatePath("/reception");
    return { success: true, course };
  } catch (error: unknown) {
    console.error("Error creating course:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل إنشاء الورشة";
    return { success: false, error: errorMessage };
  }
}

// 2. جلب جميع الورش مع عدد المسجلين
export async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { startDate: "asc" },
      include: {
        registrations: {
          include: {
            member: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                specialization: true,
                degree: true,
              },
            },
          },
        },
      },
    });
    return { success: true, courses };
  } catch (error: unknown) {
    console.error("Error fetching courses:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل جلب الورش";
    return { success: false, error: errorMessage };
  }
}

// 3. تسجيل عضو في ورشة
export async function registerForCourse(courseId: string, memberId: string) {
  try {
    // التحقق من عدم تكرار التسجيل
    const existing = await prisma.courseRegistration.findUnique({
      where: {
        courseId_memberId: {
          courseId,
          memberId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "أنت مسجل بالفعل في هذه الورشة" };
    }

    // جلب بيانات الورشة للتحقق من العدد المتاح
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!course) {
      return { success: false, error: "الورشة غير موجودة" };
    }

    if (course._count.registrations >= course.maxSeats) {
      return { success: false, error: "عذراً، الورشة ممتلئة" };
    }

    // إنشاء التسجيل
    await prisma.courseRegistration.create({
      data: {
        courseId,
        memberId,
      },
    });

    // تم جلب بيانات الورشة في الأعلى

    // إضافة نشاط تلقائي في سجل العضو
    await prisma.activity.create({
      data: {
        memberId,
        type: "ورشة",
        title: `التسجيل في ورشة: ${course?.title || "غير معروفة"}`,
        description: `تم التسجيل بنجاح في الورشة التدريبية "${course?.title}"`,
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        location: "المقر الرئيسي",
      },
    });

    revalidatePath(`/member/${memberId}`);
    revalidatePath("/reception");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error registering for course:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل التسجيل في الورشة";
    return { success: false, error: errorMessage };
  }
}

// 4. جلب المسجلين في ورشة معينة
export async function getCourseRegistrants(courseId: string) {
  try {
    const registrations = await prisma.courseRegistration.findMany({
      where: { courseId },
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            specialization: true,
            degree: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, registrations };
  } catch (error: unknown) {
    console.error("Error fetching course registrants:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل جلب المسجلين";
    return { success: false, error: errorMessage };
  }
}

// 5. حذف ورشة
export async function deleteCourse(courseId: string) {
  try {
    await prisma.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/reception");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting course:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل حذف الورشة";
    return { success: false, error: errorMessage };
  }
}
