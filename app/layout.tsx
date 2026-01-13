import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'IT Inventory Dashboard',
  description: 'ระบบบริหารจัดการครุภัณฑ์คอมพิวเตอร์',
  icons: {
    // ใช้ Emoji คอมพิวเตอร์ 🖥️
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🖥️</text></svg>',
  },
  openGraph: {
    title: 'IT Inventory Dashboard',
    description: 'ติดตามสถานะ PC และ Notebook รายหน่วยงาน',
    type: 'website',
    images: [
      {
        // รูปปกสีเขียว Emerald (ตามธีม Green IT)
        url: 'https://placehold.co/1200x630/10b981/ffffff/png?text=IT+Equipment+Status&font=roboto',
        width: 1200,
        height: 630,
        alt: 'IT Inventory Dashboard',
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
