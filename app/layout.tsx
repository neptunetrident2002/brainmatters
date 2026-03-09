import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrainMatters — Train Your Brain. Earn Your AI.",
  description: "Rebuild cognitive independence in an age of AI dependence. Complete daily challenges, earn AI Credits, and track your confidence over time.",
  keywords: ["AI dependence", "brain training", "cognitive independence", "focus", "productivity"],
  openGraph: {
    title: "BrainMatters",
    description: "Train Your Brain. Earn Your AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
