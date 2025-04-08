import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <main className="flex w-full min-h-screen">
        <AppSidebar />
        {children}
      </main>
    </SidebarProvider>
  );
}
