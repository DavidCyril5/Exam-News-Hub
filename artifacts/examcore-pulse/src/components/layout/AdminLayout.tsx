import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Layers, MessageSquare, LogOut, PlusCircle, Menu, X, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/posts", icon: FileText, label: "Posts" },
    { href: "/admin/posts/new", icon: PlusCircle, label: "New Post" },
    { href: "/admin/categories", icon: Layers, label: "Categories" },
    { href: "/admin/comments", icon: MessageSquare, label: "Comments" },
  ];

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-secondary-foreground/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer" onClick={() => setSidebarOpen(false)}>
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-serif font-bold text-lg tracking-tight">
            EXAMCORE<span className="text-primary"> ADMIN</span>
          </span>
        </Link>
        <button
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-secondary-foreground/70 hover:bg-secondary-foreground/10"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-secondary-foreground/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-secondary-foreground/70 hover:text-white hover:bg-secondary-foreground/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/40 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-secondary text-secondary-foreground flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-secondary text-secondary-foreground flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-serif font-bold text-lg">
            EXAMCORE <span className="text-primary">ADMIN</span>
          </span>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
