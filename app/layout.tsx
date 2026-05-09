import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import I18nProvider from "@/components/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 代码导航站 - 发现最佳 AI 开源工具",
  description: "AI 代码导航站 — 精选 AI Agent、视频生成、代码辅助、图像生成、大语言模型等优质开源项目。一站式发现、搜索和分类浏览 AI 开发工具。",
  keywords: [
    "AI 工具",
    "人工智能",
    "开源项目",
    "AI Agent",
    "大语言模型",
    "代码辅助",
    "图像生成",
    "视频生成",
    "数据可视化",
    "工作流自动化",
    "智能搜索",
  ],
  authors: [{ name: "AI 代码导航站" }],
  openGraph: {
    title: "AI 代码导航站 - 发现最佳 AI 开源工具",
    description: "精选 AI Agent、视频生成、代码辅助、图像生成、大语言模型等优质开源项目。",
    locale: "zh_CN",
    type: "website",
  },
};

// Detect language from request headers (Accept-Language) or cookie
function detectLocale(): 'zh' | 'en' {
  // This will be enhanced with middleware for better detection
  return 'zh'; // Default to Chinese, can be overridden by client-side preference
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = detectLocale();

  return (
    <html lang={initialLocale === 'zh' ? 'zh-CN' : 'en'} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <I18nProvider initialLocale={initialLocale}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
