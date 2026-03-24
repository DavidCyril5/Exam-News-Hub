import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { ReactNode } from "react";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              EXAMCORE <span className="text-primary font-black">PULSE</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link href="/category/jamb" className="text-muted-foreground hover:text-primary transition-colors">JAMB</Link>
            <Link href="/category/waec" className="text-muted-foreground hover:text-primary transition-colors">WAEC</Link>
            <Link href="/category/neco" className="text-muted-foreground hover:text-primary transition-colors">NECO</Link>
            <Link href="/category/post-utme" className="text-muted-foreground hover:text-primary transition-colors">POST-UTME</Link>
            <Link href="/admin/login" className="px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
              Admin Portal
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-secondary text-secondary-foreground py-12 border-t border-secondary-foreground/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-serif font-bold text-xl tracking-tight">
                EXAMCORE <span className="text-primary">PULSE</span>
              </span>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed max-w-sm">
              The premier destination for Nigerian examination news, timetables, and academic updates. Stay ahead of the curve with real-time insights.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/category/jamb" className="hover:text-primary transition-colors">JAMB Updates</Link></li>
              <li><Link href="/category/waec" className="hover:text-primary transition-colors">WAEC News</Link></li>
              <li><Link href="/category/neco" className="hover:text-primary transition-colors">NECO Timetables</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4">Connect</h4>
            <p className="text-secondary-foreground/70 text-sm">
              Follow us for the latest updates on exams across Nigeria.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/50">
          © {new Date().getFullYear()} EXAMCORE PULSE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
