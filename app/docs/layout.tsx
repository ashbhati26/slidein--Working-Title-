// Server component — exports metadata, wraps the client docs page
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Svation",
  description: "Setup guides and documentation for Svation.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
