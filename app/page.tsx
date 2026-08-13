"use client";

import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import Game from "@/components/Game";

export default function Home() {
  return (
    <WebAppProvider>
      <Game />
    </WebAppProvider>
  );
}
