import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { LoginGate } from "@/components/LoginGate";

export const metadata: Metadata = {
  title: "Network Provisioning SKU Manager",
  description: "SKU Management System for Network Provisioning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <LoginGate>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 pl-56">
                <Header />
                <div className="p-6">{children}</div>
              </main>
            </div>
          </LoginGate>
        </AuthProvider>
      </body>
    </html>
  );
}
