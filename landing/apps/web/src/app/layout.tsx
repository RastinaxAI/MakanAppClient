import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "@/styles/globals.css";

const vazirmatn = localFont({
  src: "../../public/fonts/vazirmatn-arabic-wght-normal.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "ماکان | ارتباط و مدیریت آموزش", template: "%s | ماکان" },
  description:
    "ماکان؛ آموزشگاه، کلاس مستقل، پیام‌ها، تکلیف، آزمون، گزارش و دستیار هوش مصنوعی در یک فضای یکپارچه برای یادگیری و ارتباط.",
  robots: { index: false, follow: false },
  icons: {
    icon: { url: "/brand/makan-icon.svg", type: "image/svg+xml", sizes: "any" },
    apple: "/brand/makan-logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
