import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
    title: "Conversor e Histórico de Câmbio",
    description: "Converta valores entre moedas, consulte o histórico de cotações e monitore pares",
};

export default function RootLayout ({ children }: { children: ReactNode }) {
    return (
        <html lang="pt-BR">
            <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
                <a
                 href="#main-content"
                 className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-white focus:px-4 focus:py-2"
                 >
                    Pular para o conteúdo
                 </a>
                <Header />
                <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
