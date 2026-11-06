import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/admin.css";
export const metadata: Metadata = {
  title: "مدیریت وب‌سایت",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
