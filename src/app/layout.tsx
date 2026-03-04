import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kulash Halal Market",
  description:
    "Kulash Halal Market — доставка халяльных продуктов в Алматы. Свежие продукты, молочные товары, мясо и многое другое.",
  verification: {
    google: "6JuxN9FeXtNswnWD6Tx5kUxzRbRb1Zzheo2MxSxHGUo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <header className="header">
          <Link href="/" className="brand">
            <img
              src="https://res.cloudinary.com/dxp5bumsf/image/upload/v1772041656/Halal_ljatzs.png"
              alt="Kulash Halal Market"
              className="logo"
            />
            <span className="brandText">Kulash Halal Market</span>
          </Link>
        </header>

        {children}
      </body>
    </html>
  );
}