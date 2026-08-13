import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ПОЛЕ КЭМП",
  description: "Игра самопознания для мужчин сообщества КЭМП",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
      </head>
      <body className="bg-kemp-dark text-white antialiased">{children}</body>
    </html>
  );
}
