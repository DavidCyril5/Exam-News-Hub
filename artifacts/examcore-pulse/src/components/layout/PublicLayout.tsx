import { Link } from "wouter";
import { BookOpen, Sun, Moon, Palette, Menu, X, ChevronRight } from "lucide-react";
import { ReactNode, useState, useRef, useEffect } from "react";
import { useTheme, ACCENT_COLORS, type AccentColor } from "@/hooks/use-theme";

const NAV_LINKS = [
  { href: "/category/jamb", label: "JAMB" },
  { href: "/category/waec", label: "WAEC" },
  { href: "/category/neco", label: "NECO" },
  { href: "/category/post-utme", label: "POST-UTME" },
  { href: "/category/gce", label: "GCE" },
  { href: "/category/nabteb", label: "NABTEB" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              EXAMCORE <span className="text-primary font-black">PULSE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMode}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              <div ref={paletteRef} className="relative">
                <button
                  onClick={() => setPaletteOpen(v => !v)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  title="Change accent colour"
                >
                  <Palette className="h-4 w-4" />
                </button>

                {paletteOpen && (
                  <div className="absolute right-0 top-11 bg-card border border-border rounded-2xl shadow-xl p-3 flex flex-col gap-2 min-w-[140px] z-50">
                    <p className="text-xs font-semibold text-muted-foreground px-1 mb-1">Accent Colour</p>
                    {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => { setAccent(key); setPaletteOpen(false); }}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          accent === key
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0"
                          style={{ background: val.swatch, boxShadow: accent === key ? `0 0 0 2px ${val.swatch}` : undefined }}
                        />
                        {val.label}
                        {accent === key && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Link href="/admin/login" className="px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
              Admin Portal
            </Link>
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleMode}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground"
            >
              {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-16 right-0 bottom-0 z-40 w-72 bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4">Categories</p>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-4 rounded-xl text-foreground font-medium hover:bg-muted hover:text-primary transition-colors"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4">Appearance</p>
            <div className="flex flex-wrap gap-2 px-1">
              {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setAccent(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    accent === key
                      ? "border-primary bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ background: val.swatch }}
                  />
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-secondary text-secondary-foreground py-10 md:py-12 border-t border-secondary-foreground/10 mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/50">
          © {new Date().getFullYear()} EXAMCORE PULSE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
