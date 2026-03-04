import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Kulash Halal Market",
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