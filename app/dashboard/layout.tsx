import type { ReactNode } from "react";
import { DashboardClientLayout } from "./dashboard-client-layout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // put any server-side wrappers here if you have them (sidebar providers, etc.)
  return (
    <DashboardClientLayout>
      {children}
    </DashboardClientLayout>
  );
}
