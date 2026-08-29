import type { Metadata } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { CommandPaletteModal } from "@/components/command-palette/CommandPaletteModal";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";

export const metadata: Metadata = {
  title: "ArchiMate — AI Software Architecture Generator",
  description:
    "Convert plain-English requirements into interactive, editable software architecture diagrams, system health analyses, database schemas, API specs, Docker configs, and project folder structures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#050816] text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <AuthProvider>
          <AdminAuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <ToastContainer />
            <CommandPaletteModal />
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
