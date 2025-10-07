import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Talent", href: "#talent" },
  { label: "Employers", href: "#employers" },
  { label: "Stories", href: "#stories" },
  { label: "Resources", href: "#resources" },
];

export function MarketingHeader({ className }: { className?: string }) {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleNavigate = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setLocation(href);
    }
    setOpen(false);
  };

  const DownloadButton = (
    <Button
      variant="secondary"
      size="sm"
      className="gap-2"
      onClick={() => handleNavigate("#download")}
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
            SJ
          </span>
          <span className="hidden sm:inline-flex">SwipeJob South Africa</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavigate(link.href)}
              className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("/login")}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => handleNavigate("/signup")}
          >
            Join for free
          </Button>
          {DownloadButton}
        </div>

        <div className="flex md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle className="text-left text-lg font-semibold text-primary">
                  SwipeJob South Africa
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                <div className="flex flex-col gap-3 text-base font-medium text-muted-foreground">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => handleNavigate(link.href)}
                      className="text-left transition-colors hover:text-primary"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/login")}
                  >
                    Sign in
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleNavigate("/signup")}
                  >
                    Join for free
                  </Button>
                  {DownloadButton}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
