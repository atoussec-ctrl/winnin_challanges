import type { Metadata } from "next";
import { SiteHeader } from "../components/organisms/site-header";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  description: "Animes via AniList GraphQL e gestao de pedidos via API Nest.js.",
  title: {
    default: "Desafio Winnin",
    template: "%s | Desafio Winnin"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
