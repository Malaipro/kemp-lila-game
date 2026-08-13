"use client";

import { TelegramProvider } from "@vkruglikov/react-telegram-web-app";
import Game from "@/components/Game";

export default function Home() {
  return (
    <TelegramProvider>
      <Game />
    </TelegramProvider>
  );
}
