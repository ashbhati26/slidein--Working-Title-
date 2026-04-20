// Server component — exports metadata, wraps the client docs page
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — SlideIN",
  description: "Setup guides and documentation for SlideIN.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}