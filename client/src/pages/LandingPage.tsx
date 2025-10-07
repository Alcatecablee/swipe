import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Briefcase, Sparkles, Users, Shield, Globe, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { useAuth } from "@/contexts/AuthContext";

const partnerLogos = [
  { name: "Yoco", src: "https://logo.clearbit.com/yoco.com" },
  { name: "Takealot", src: "https://logo.clearbit.com/takealot.com" },
  { name: "Nedbank", src: "https://logo.clearbit.com/nedbank.co.za" },
  { name: "Discovery", src: "https://logo.clearbit.com/discovery.co.za" },
  { name: "TymeBank", src: "https://logo.clearbit.com/tymebank.co.za" },
  { name: "SweepSouth", src: "https://logo.clearbit.com/sweepsouth.com" },
  { name: "Outsurance", src: "https://logo.clearbit.com/outsurance.co.za" },
  { name: "Old Mutual", src: "https://logo.clearbit.com/oldmutual.co.za" },
  { name: "Aerobotics", src: "https://logo.clearbit.com/aerobotics.com" },
  { name: "Clickatell", src: "https://logo.clearbit.com/clickatell.com" },
  { name: "Investec", src: "https://logo.clearbit.com/investec.com" },
  { name: "Standard Bank", src: "https://logo.clearbit.com/standardbank.com" },
];

const stats = [
  {
    label: "Verified opportunities from South African employers",
    value: "12 500+",
  },
  {
    label: "Interviews booked through SwipeJob each month",
    value: "1 800",
  },
  {
    label: "Time saved vs traditional job boards",
    value: "6×",
  },
];

const features = [
  {
    title: "Swipe-worthy opportunities",
    description:
      "Curated tech, digital, retail, and hospitality roles designed for ambitious graduates and career switchers across South Africa.",
    icon: Sparkles,
  },
  {
    title: "Built for hiring teams",
    description:
      "Instantly surface verified candidates, manage shortlists, and send offers with employer tools tailored to local HR workflows.",
    icon: Briefcase,
  },
  {
    title: "Community-first support",
    description:
      "Access weekly masterclasses, interview prep, and mentorship run in partnership with SA incubators and youth programs.",
    icon: Users,
  },
];

const safeguards = [
  {
    title: "Verified employers",
    description: "We manually vet every company and require dedicated HR contacts before jobs go live.",
    icon: Shield,
  },
  {
    title: "Mzansi-focused data",
    description: "Salary ranges in rand, local workplace benefits, and NQF-aligned requirements keep expectations clear.",
    icon: Globe,
  },
];

const testimonials = [
  {
    quote:
      "I matched with a product design internship in 48 hours. SwipeJob felt like it was built for my journey—fast, inclusive, and unapologetically South African.",
    name: "Ayanda Mahlangu",
    title: "Wits graduate turned UX intern",
  },
  {
    quote:
      "Our customer success hires used to take months. Now we shortlist verified talent within a week, complete with cultural fit signals.",
    name: "Sipho Maseko",
    title: "Head of People, Cape Town SaaS startup",
  },
  {
    quote:
      "The community events help me prep for interviews while I'm finishing my final year. It's more than a job board—it's a launchpad.",
    name: "Zanele Nkosi",
    title: "Final-year BCom student, Durban",
  },
];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/app");
    }
  }, [user, loading, setLocation]);

  const handlePrimaryCta = () => setLocation("/signup");
  const handleSecondaryCta = () => setLocation("/login");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-background to-primary/5">
          <div className="absolute inset-0">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
            >
              <source src="https://b4tl0n6j67mfwpvk.public.blob.vercel-storage.com/Web_Option3-U4gbzrLblKzMLrtosGKeMR4oqqDDeI.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/85 to-background/60" aria-hidden />
          </div>
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-24 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-12">
            <div className="max-w-2xl space-y-6 text-left text-balance">
              <Badge className="bg-primary/20 text-primary">Built for South African talent</Badge>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
                Swipe right on your next opportunity in Mzansi.
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                SwipeJob makes hiring and job hunting feel human. Discover vetted companies, pay transparency, and support designed for local graduates, switchers, and hustlers.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 gap-2 px-6 text-base" onClick={handlePrimaryCta}>
                  Get started in minutes
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-12 px-6 text-base" onClick={handleSecondaryCta}>
                  I already have an account
                </Button>
                <Button
                  variant="ghost"
                  className="h-12 px-6 text-base"
                  onClick={() => {
                    const downloadSection = document.querySelector("#download");
                    downloadSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Download the mobile app
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by hiring teams at high-growth startups, established corporates, and social enterprises across South Africa.
              </p>
            </div>
          </div>
        </section>

        <section id="talent" className="border-b border-border/40 bg-background py-16 sm:py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold sm:text-4xl">Where our talent lands interviews</h2>
              <p className="max-w-3xl text-base text-muted-foreground">
                From Sandton fintech giants to Cape Town creatives, SwipeJob candidates show up where innovation lives.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {partnerLogos.map((logo) => (
                <div
                  key={logo.name}
                  className="flex h-28 items-center justify-center rounded-xl border border-border/50 bg-card/70 px-6 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
                >
                  <img
                    src={logo.src}
                    alt={`${logo.name} logo`}
                    className="max-h-12 max-w-full opacity-80 transition-opacity hover:opacity-100"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="employers" className="border-b border-border/40 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold sm:text-4xl">A single swipe brings vetted candidates to your shortlist</h2>
                <p className="text-base text-muted-foreground">
                  Set your hiring preferences, highlight workplace benefits, and chat with excited talent across SA. Employers see personality-rich profiles, availability, and skills in one view.
                </p>
              </div>
              <div className="grid gap-6">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/80 p-6"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm"
                >
                  <p className="text-4xl font-semibold text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="stories" className="border-b border-border/40 bg-background py-16 sm:py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold sm:text-4xl">We protect your hustle</h2>
                <p className="text-base text-muted-foreground">
                  South African candidates navigate scams, ghosting, and wage gaps daily. SwipeJob screens every opportunity, verifies salaries, and equips you to negotiate with confidence.
                </p>
              </div>
              <div className="grid gap-4">
                {safeguards.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-xl border border-border/40 bg-muted/40 p-5"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="flex h-full flex-col justify-between rounded-2xl border border-border/40 bg-card/80 p-6 shadow-sm"
                >
                  <Quote className="h-6 w-6 text-primary" />
                  <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-4 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="border-b border-border/40 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">Level up every week</h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                Weekly live sessions on interview prep, salary negotiation, and navigating B-BBEE learnerships. Curated templates and resource packs in English, isiZulu, and Afrikaans.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "SwipeSchool webinars",
                  description: "Free masterclasses with talent partners from Cape Town, Johannesburg, and Durban.",
                },
                {
                  title: "Employer playbooks",
                  description: "Structured hiring templates for startups and scale-ups hiring their first SA teams.",
                },
                {
                  title: "Community meetups",
                  description: "Hybrid events with coworking hubs and township incubators to match opportunity with talent.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/40 bg-background p-6 text-left"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="download" className="bg-primary/10 py-16 sm:py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <Badge className="bg-white/60 text-primary">Ready when you are</Badge>
            <h2 className="text-3xl font-semibold text-primary sm:text-4xl">
              Recruit or get hired from anywhere in South Africa
            </h2>
            <p className="max-w-2xl text-base text-primary/80">
              Download the SwipeJob beta for Android, or join the waitlist for iOS. Desktop hiring dashboards available for HR teams today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 gap-2 px-6 text-base">
                <a href="https://play.google.com/store/apps/details?id=com.swipejob" target="_blank" rel="noreferrer">
                  Get it on Google Play
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 text-base">
                <a href="https://forms.gle/a1VwSwipeJobWaitlist" target="_blank" rel="noreferrer">
                  Join the iOS waitlist
                </a>
              </Button>
              <Button asChild variant="ghost" className="h-12 px-6 text-base">
                <a href="mailto:hello@swipejob.co.za">Talk to our team</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
