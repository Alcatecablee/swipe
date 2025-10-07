import { Link } from "wouter";
import { Mail, Linkedin, Instagram, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";

const footerLinks = [
  { label: "Passport", href: "#talent" },
  { label: "Case Studies", href: "#stories" },
  { label: "Blog", href: "#resources" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const socials = [
  {
    label: "Email",
    href: "mailto:hello@swipejob.co.za",
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/swipejob-sa",
    icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/swipejob_sa",
    icon: Instagram,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/swipejob_sa",
    icon: Twitter,
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-primary">SwipeJob South Africa</p>
            <p className="max-w-xl text-sm text-muted-foreground">
              Tinder-style job matching built for South Africa’s next generation of builders,
              marketers, and makers. Swipe into paid opportunities from verified employers
              across Jozi, Cape Town, Durban, and beyond.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <Button
                  key={label}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="px-3"
                >
                  <a href={href} target="_blank" rel="noreferrer" className="gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground sm:grid-cols-3 md:text-right">
            {footerLinks.map(({ label, href }) => (
              href.startsWith("/") ? (
                <Link key={label} href={href} className="transition-colors hover:text-primary">
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="transition-colors hover:text-primary"
                >
                  {label}
                </a>
              )
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SwipeJob South Africa. Made for Mzansi talent.</p>
          <p>Built in partnership with local incubators and youth employment initiatives.</p>
        </div>
      </div>
    </footer>
  );
}
