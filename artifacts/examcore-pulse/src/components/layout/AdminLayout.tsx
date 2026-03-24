import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Layers, MessageSquare, LogOut, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/posts", icon: FileText, label: "Posts" },
    { href: "/admin/posts/new", icon: PlusCircle, label: "New Post" },
    { href: "/admin/categories", icon: Layers, label: "Categories" },
    { href: "/admin/comments", icon: MessageSquare, label: "Comments" },
  ];

  return (
    <div className="min-h-screen bg-muted/40 flex">
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="font-serif font-bold text-xl tracking-tight">
              EXAMCORE<span className="text-primary block">ADMIN</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-secondary-foreground/10">
          <Button variant="ghost" className="w-full justify-start text-secondary-foreground/70 hover:text-white hover:bg-secondary-foreground/10" onClick={logout}>
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
