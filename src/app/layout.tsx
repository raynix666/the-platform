import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalHeader } from "@/components/GlobalHeader";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "المنصة - إدارة العضويات والزيارات",
  description: "منصة إلكترونية متكاملة لتسجيل عضويات الأعضاء ومتابعة زياراتهم في المركز بسهولة وسرعة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 min-h-screen selection:bg-teal-500 selection:text-slate-900 dark:selection:text-white`}
      >
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {/* خلفية Light Mode */}
            <div
              className="fixed inset-0 -z-10 dark:hidden"
              style={{
                backgroundImage: "url('/bg-light.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.5,
              }}
            />
            {/* خلفية Dark Mode */}
            <div
              className="fixed inset-0 -z-10 hidden dark:block"
              style={{
                backgroundImage: "url('/bg-dark.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.6,
              }}
            />

            {/* الهيدر الموحد – اللوقو + الهامبرغر */}
            <GlobalHeader />

            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
