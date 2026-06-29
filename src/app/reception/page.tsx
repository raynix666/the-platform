import React from "react";
import { redirect } from "next/navigation";
import { getLoggedInEmployee } from "../actions/employeeActions";
import ReceptionDashboardClient from "./ReceptionDashboardClient";

export default async function ReceptionDashboardPage() {
  // التحقق من تسجيل دخول الموظف لمنع دخول المستخدمين العاديين
  const employee = await getLoggedInEmployee();

  if (!employee) {
    redirect("/employee/login");
  }

  // إذا كان الموظف مسجلاً، يتم عرض شاشة الاستقبال
  return <ReceptionDashboardClient employee={employee} />;
}
