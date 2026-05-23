import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your AI Spend Audit — SpendScope",
};

export default function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
