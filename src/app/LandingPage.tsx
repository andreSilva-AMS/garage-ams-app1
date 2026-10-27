"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Check,
  FileCheck2,
  Globe2,
  LayoutGrid,
  Smartphone,
  ShieldCheck,
  Wrench,
  Car,
  Repeat,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InstallAppButton } from "@/components/InstallAppButton";
import { ContactForm } from "@/components/ContactForm";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { PhoneStage } from "@/components/landing/PhoneStage";
import { RECEPTION_SCREENS } from "@/components/landing/receptionScreens";
import { CONSIGNMENT_SCREENS } from "@/components/landing/consignmentScreens";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { LANDING_CONTENT, LANG_CODES } from "./landingContent";
import type { Lang } from "@/lib/receptions/i18n";

const INCLUDED_ICONS = [ShieldCheck, Check, FileCheck2, Globe2, LayoutGrid, Smartphone] as const;
const WHO_FOR_ICONS = [Wrench, Car, Repeat] as const;

function NavLink({ href, children, onClick }: { href: string; children: string; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-white/70 transition-colors hover:text-white"
    >
      {children}
    </a>
  );
}

export function LandingPage({ appLocale }: { appLocale: Lang }) {
  const [lang, setLang] = useState<Lang>(appLocale);
  const [menuOpen, setMenuOpen] = useState(false);
  const c = LANDING_CONTENT[lang];

  const navItems: { href: string; label: string }[] = [
    { href: "#fonctionnalites", label: c.navFeatures },
    { href: "#comment", label: c.navHow },
    { href: "#depot-vente", label: c.navConsignment },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: c.navContact },
  ];

  return (
    <main className="bg-[#F7F5F1] text-[#1A1C20]">
      {/* ===== En-tête ===== */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0E0F11]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ReceptCar" width={32} height={32} className="rounded-lg" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher value={lang} onChange={setLang} />
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white">
              {c.navLogin}
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#A87B3F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#BD8F52]"
            >
              {c.navSignup}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0E0F11] px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
              <div className="flex items-center justify-between pt-2">
                <LanguageSwitcher value={lang} onChange={setLang} />
                <Link href="/login" className="text-sm font-medium text-white/70">
                  {c.navLogin}
                </Link>
              </div>
              <Link
                href="/signup"
                className="rounded-xl bg-[#A87B3F] px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {c.navSignup}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-[#0E0F11] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(168,123,63,0.25), transparent 45%), radial-gradient(circle at 85% 75%, rgba(168,123,63,0.15), transparent 50%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
          <div>
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80">
                {c.heroBadge}
              </span>
            </ScrollReveal>
            <ScrollReveal delayMs={100}>
              <h1
                className="mt-6 text-balance font-serif leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(2.25rem, 2rem + 2.2vw, 4.5rem)" }}
              >
                {c.heroTitle}
              </h1>
            </ScrollReveal>
            <ScrollReveal delayMs={180}>
              <p className="mt-6 max-w-lg text-base text-white/70 sm:text-lg">{c.heroSubtitle}</p>
            </ScrollReveal>
            <ScrollReveal delayMs={260}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-[#A87B3F] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#BD8F52]"
                >
                  {c.heroCtaPrimary}
                </Link>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
                >
                  {c.heroCtaSecondary}
                </a>
              </div>
              <p className="mt-5 text-xs text-white/50">{c.heroNote}</p>
            </ScrollReveal>
          </div>

          <ScrollReveal delayMs={200}>
            <PhoneStage screens={RECEPTION_SCREENS} />
          </ScrollReveal>
        </div>
      </section>

      {/* ===== Le problème ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <ScrollReveal>
          <h2 className="max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">{c.problemTitle}</h2>
        </ScrollReveal>
        <ScrollReveal delayMs={100}>
          <p className="mt-6 max-w-2xl text-base text-neutral-600 sm:text-lg">{c.problemBody}</p>
        </ScrollReveal>
      </section>

      {/* ===== Comment ça marche ===== */}
      <section id="comment" className="bg-[#EFEBE3] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl">{c.howTitle}</h2>
          </ScrollReveal>
          <ScrollReveal delayMs={100}>
            <div className="mt-14">
              <HowItWorksSection steps={c.howSteps} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== Pour qui ===== */}
      <section id="pour-qui" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <ScrollReveal>
          <h2 className="font-serif text-3xl sm:text-4xl">{c.whoForTitle}</h2>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {c.whoFor.map((item, i) => {
            const Icon = WHO_FOR_ICONS[i] ?? Wrench;
            return (
              <ScrollReveal key={item.title} delayMs={i * 100}>
                <div className="h-full rounded-2xl border border-black/5 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A87B3F]/10 text-[#A87B3F]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-600">{item.body}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ===== Ce qui est inclus ===== */}
      <section id="fonctionnalites" className="bg-[#EFEBE3] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl">{c.includedTitle}</h2>
          </ScrollReveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {c.includedItems.map((item, i) => {
              const Icon = INCLUDED_ICONS[i] ?? Check;
              return (
                <ScrollReveal key={item} delayMs={(i % 4) * 90}>
                  <div className="flex items-start gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#A87B3F]" aria-hidden="true" />
                    <span className="text-sm text-[#1A1C20]">{item}</span>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
          <ScrollReveal delayMs={300}>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {LANG_CODES.map((code) => (
                <span
                  key={code}
                  className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {code}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== Dépôt-vente ===== */}
      <section id="depot-vente" className="bg-[#0E0F11] px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{c.consignmentTitle}</h2>
            <p className="mt-5 max-w-md text-white/70">{c.consignmentBody}</p>
            <ul className="mt-7 flex flex-col gap-3">
              {c.consignmentBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#A87B3F]" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delayMs={150}>
            <PhoneStage screens={CONSIGNMENT_SCREENS} />
          </ScrollReveal>
        </div>
      </section>

      {/* ===== Le mot du fondateur ===== */}
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="shrink-0">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-black/10 bg-neutral-100">
                <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-neutral-400">
                  AD
                </span>
                <Image
                  src="/images/andre.jpg"
                  alt={c.founderName}
                  fill
                  sizes="96px"
                  className="object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
            <div>
              <p className="font-serif text-xl leading-relaxed sm:text-2xl">&ldquo;{c.founderQuote}&rdquo;</p>
              <p className="mt-5 text-sm font-semibold">{c.founderName}</p>
              <p className="text-sm text-neutral-500">{c.founderRole}</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="bg-[#EFEBE3] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl">{c.faqTitle}</h2>
          </ScrollReveal>
          <ScrollReveal delayMs={120}>
            <div className="mt-10">
              <FaqAccordion items={c.faq} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== Appel final ===== */}
      <section className="bg-[#0E0F11] px-5 py-20 text-center text-white sm:px-8 sm:py-28">
        <ScrollReveal>
          <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            {c.finalTitle}
          </h2>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#A87B3F] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#BD8F52]"
          >
            {c.finalCta}
          </Link>
          <p className="mt-5 text-xs text-white/50">{c.finalNote}</p>
        </ScrollReveal>
      </section>

      {/* ===== Installer l'app ===== */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-5 py-20 text-center sm:px-8">
        <h2 className="text-lg font-semibold">{c.installTitle}</h2>
        <p className="max-w-sm text-sm text-neutral-600">{c.installSubtitle}</p>
        <div className="mt-2">
          <InstallAppButton
            installLabel={c.installLabel}
            installedLabel={c.installedLabel}
            iosInstructions={c.iosInstructions}
          />
        </div>
      </section>

      {/* ===== Contact ===== */}
      <section id="contact" className="mx-auto flex max-w-xl flex-col items-center gap-3 px-5 pb-20 text-center sm:px-8">
        <h2 className="font-serif text-2xl">{c.contactTitle}</h2>
        <p className="max-w-sm text-sm text-neutral-600">{c.contactSubtitle}</p>
        <div className="mt-4 flex w-full justify-center">
          <ContactForm
            nameLabel={c.nameLabel}
            emailLabel={c.emailLabel}
            messageLabel={c.messageLabel}
            sendLabel={c.sendLabel}
            successLabel={c.successLabel}
            missingFieldsError={c.missingFieldsError}
            genericError={c.genericError}
          />
        </div>
        <a href="mailto:info@receptcar.com" className="mt-2 text-sm text-neutral-500 underline">
          info@receptcar.com
        </a>
      </section>

      {/* ===== Pied de page ===== */}
      <footer className="border-t border-black/5 bg-[#F7F5F1] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <Image src="/logo.png" alt="ReceptCar" width={32} height={32} className="rounded-lg" />
          <p className="text-sm text-neutral-500">{c.footerTagline}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
            <a href="#fonctionnalites" className="hover:text-neutral-600">
              {c.navFeatures}
            </a>
            <a href="#comment" className="hover:text-neutral-600">
              {c.navHow}
            </a>
            <a href="#depot-vente" className="hover:text-neutral-600">
              {c.navConsignment}
            </a>
            <a href="#faq" className="hover:text-neutral-600">
              {c.faqTitle}
            </a>
            <Link href="/terms" className="hover:text-neutral-600">
              {c.terms}
            </Link>
            <Link href="/privacy" className="hover:text-neutral-600">
              {c.privacy}
            </Link>
            <a href="mailto:info@receptcar.com" className="hover:text-neutral-600">
              info@receptcar.com
            </a>
          </div>
          <p className="text-xs text-neutral-400">© 2026 ReceptCar. {c.rights}</p>
        </div>
      </footer>
    </main>
  );
}
