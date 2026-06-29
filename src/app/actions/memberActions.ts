"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";

// توليد معرف عضوية فريد (مثال: 1001)
async function generateMembershipId(): Promise<string> {
  const count = await prisma.member.count();
  const nextNumber = 1000 + count + 1;
  return `${nextNumber}`;
}

export type MemberRegistrationData = {
  fullName: string;
  age: number;
  gender: string;
  nationality: string;
  phone: string;
  address: string;
  degree: string;
  specialization: string;
  nationalId: string;
  idImage?: string; // Base64
  purpose: string;
  details?: string;
};

// 1. تسجيل عضو جديد مع الزيارة الأولى والأنشطة الافتراضية
export async function registerMember(data: MemberRegistrationData) {
  try {
    const memberId = await generateMembershipId();

    // رفع الصورة إلى السحابة إن وجدت
    let idImageUrl = null;
    if (data.idImage) {
      idImageUrl = await uploadImage(data.idImage);
    }

    // إنشاء العضو في قاعدة البيانات
    const member = await prisma.member.create({
      data: {
        id: memberId,
        fullName: data.fullName,
        age: Number(data.age),
        gender: data.gender,
        nationality: data.nationality,
        phone: data.phone,
        address: data.address,
        degree: data.degree,
        specialization: data.specialization,
        nationalId: data.nationalId,
        idImage: idImageUrl,
      },
    });

    // إنشاء أول زيارة للعضو
    await prisma.visit.create({
      data: {
        memberId: member.id,
        purpose: data.purpose,
        details: data.details || "الزيارة الأولى عند التسجيل",
      },
    });

    // إضافة نشاط افتراضي (التسجيل في المنصة)
    await prisma.activity.create({
      data: {
        memberId: member.id,
        type: "زيارة",
        title: "التسجيل في المنصة",
        description: `تم إنشاء العضوية بنجاح واختيار سبب الزيارة: ${data.purpose}`,
        time: new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' }),
        location: "الاستقبال الرئيسي",
      },
    });

    // إضافة نشاطات تجريبية أخرى لتبدو لوحة التحكم غنية
    await prisma.activity.create({
      data: {
        memberId: member.id,
        type: "دراسة",
        title: "جلسة دراسة حرة في القاعة",
        description: "استخدام قاعة التطوير والابتكار للدراسة الفردية",
        time: "10:30 ص",
        location: "القاعة المشتركة A",
      },
    });

    await prisma.activity.create({
      data: {
        memberId: member.id,
        type: "ورشة",
        title: "ورشة أساسيات ريادة الأعمال",
        description: "مقدمة عامة في ريادة الأعمال والتفكير الإبداعي",
        time: "02:00 م",
        location: "مسرح المنصة الرئيسي",
      },
    });

    return { success: true, memberId };
  } catch (error: unknown) {
    console.error("Error registering member:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل تسجيل العضو";
    return { success: false, error: errorMessage };
  }
}

// 2. تعديل سبب الزيارة للعضو من قبل موظف الاستقبال
export async function updateVisitPurpose(memberId: string, purpose: string, details?: string) {
  try {
    // تحديث أو إنشاء زيارة جديدة
    const visit = await prisma.visit.create({
      data: {
        memberId,
        purpose,
        details: details || "تم التعديل بواسطة موظف الاستقبال",
      },
    });

    // إضافة نشاط للزيارة المحدثة
    await prisma.activity.create({
      data: {
        memberId,
        type: "زيارة",
        title: "تحديث سبب الزيارة",
        description: `تم تعديل الغرض من الزيارة إلى: ${purpose}`,
        time: new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' }),
        location: "الاستقبال",
      },
    });

    revalidatePath(`/member/${memberId}`);
    revalidatePath("/reception");
    return { success: true, visit };
  } catch (error: unknown) {
    console.error("Error updating visit purpose:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل تحديث سبب الزيارة";
    return { success: false, error: errorMessage };
  }
}

// 3. البحث عن الأعضاء بالـ ID أو بالاسم
export async function searchMembers(query: string) {
  try {
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { id: { contains: query } },
          { fullName: { contains: query } },
          { nationalId: { contains: query } },
        ],
      },
      include: {
        visits: {
          orderBy: { date: "desc" },
        },
      },
    });
    return { success: true, members };
  } catch (error: unknown) {
    console.error("Error searching members:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل البحث عن الأعضاء";
    return { success: false, error: errorMessage };
  }
}

// 4. جلب جميع بيانات العضو بالتفصيل
export async function getMemberDetails(memberId: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        visits: {
          orderBy: { date: "desc" },
        },
        activities: {
          orderBy: { date: "desc" },
        },
      },
    });
    return { success: true, member };
  } catch (error: unknown) {
    console.error("Error getting member details:", error);
    const errorMessage = error instanceof Error ? error.message : "فشل جلب تفاصيل العضو";
    return { success: false, error: errorMessage };
  }
}
