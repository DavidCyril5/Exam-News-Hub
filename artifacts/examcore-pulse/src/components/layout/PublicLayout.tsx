import { Link } from "wouter";
import { BookOpen, Sun, Moon, Palette, Menu, X, ChevronRight, Send } from "lucide-react";
import { ReactNode, useState, useRef, useEffect } from "react";
import { useTheme, ACCENT_COLORS, type AccentColor } from "@/hooks/use-theme";
import { NotificationButton } from "@/components/shared/NotificationButton";

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
              <NotificationButton />
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
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-3 px-4 rounded-xl text-foreground font-medium hover:bg-muted hover:text-primary transition-colors"
          >
            Home
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4 pt-2">Categories</p>
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

          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-3">Follow Us</p>
            <a
              href="https://whatsapp.com/channel/0029VbBFb083wtb9weJlrE3r"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              WhatsApp Channel
            </a>
            <a
              href="https://t.me/examcore42webio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0">
                <Send className="w-3.5 h-3.5 text-white" />
              </span>
              Telegram Channel
            </a>
          </div>

          <div className="pt-2 border-t border-border">
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
            <p className="text-secondary-foreground/70 text-sm mb-4">
              Follow us for the latest updates on exams across Nigeria.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://whatsapp.com/channel/0029VbBFb083wtb9weJlrE3r"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-medium text-secondary-foreground/80 hover:text-primary transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                WhatsApp Channel
              </a>
              <a
                href="https://t.me/examcore42webio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-medium text-secondary-foreground/80 hover:text-primary transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4 text-white" />
                </span>
                Telegram Channel
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/50">
          © {new Date().getFullYear()} EXAMCORE PULSE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
