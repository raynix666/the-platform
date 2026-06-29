import React from "react";
import { redirect } from "next/navigation";
import { getLoggedInEmployee } from "../actions/employeeActions";
import EmployeeDashboardClient from "./EmployeeDashboardClient";

export default async function EmployeeDashboardPage() {
  // التحقق من تسجيل دخول الموظف
  const employee = await getLoggedInEmployee();

  // إذا لم يكن الموظف مسجلاً، نقوم بتحويله إلى صفحة تسجيل الدخول
  if (!employee) {
    redirect("/employee/login");
  }

  // تمرير بيانات الموظف إلى المكون العميل
  return <EmployeeDashboardClient employee={employee} />;
}
