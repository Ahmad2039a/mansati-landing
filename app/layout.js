import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "إدارة الالتزامات الحكومية | منصة SaaS",
  description:
    "منصة متكاملة لإدارة السجلات التجارية، الرخص، وإقامات الموظفين في المملكة العربية السعودية. تنبيهات ذكية وحاسبة نطاقات.",
  keywords: "إدارة الالتزامات، السجلات التجارية، نطاقات، السعودية، SaaS",
  openGraph: {
    title: "إدارة الالتزامات الحكومية | منصة SaaS",
    description:
      "منصة متكاملة لإدارة السجلات التجارية، الرخص، وإقامات الموظفين.",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${notoKufi.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
