"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Building2,
  CreditCard,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/lib/supabase/actions";

interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: "dashboard" | "newReception" | "history" | "billing" | "settings" | "help";
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/receptions/new", icon: PlusCircle, labelKey: "newReception" },
  { href: "/receptions", icon: History, labelKey: "history" },
  { href: "/billing", icon: CreditCard, labelKey: "billing" },
  { href: "/settings", icon: Settings, labelKey: "settings" },
  { href: "/help", icon: HelpCircle, labelKey: "help" },
];

function GarageBadge({ garageName, logoUrl }: { garageName: string; logoUrl: string | null }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo du garage (Supabase Storage), taille variable
        <img src={logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-contain" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
          <Building2 className="h-5 w-5 text-neutral-400" aria-hidden="true" />
        </div>
      )}
      <span className="truncate font-medium leading-none">{garageName}</span>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-black/5"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {t(labelKey)}
          </Link>
        );
      })}
    </>
  );
}

function SignOutButton({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  return (
    <form
      action={async () => {
        onNavigate?.();
        await signOut();
      }}
    >
      <button
        type="submit"
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-black/5"
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
        {t("signOut")}
      </button>
    </form>
  );
}

export function AppShell({
  garageName,
  logoUrl,
  children,
}: {
  garageName: string;
  logoUrl: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !toggleRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="min-h-full md:flex">
      {/* Bannière repliable — téléphone uniquement (< md). */}
      <header className="border-b border-border-color bg-surface md:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link href="/dashboard" className="min-w-0">
            <GarageBadge garageName={garageName} logoUrl={logoUrl} />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="app-mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-color"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        <div
          id="app-mobile-menu"
          ref={panelRef}
          className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <nav aria-label={t("menu")} className="border-t border-border-color px-3 py-3">
              <div className="flex flex-col gap-1">
                <NavLinks onNavigate={() => setOpen(false)} />
                <SignOutButton onNavigate={() => setOpen(false)} />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Menu latéral — tablette et plus (>= md), toujours visible. */}
      <aside className="hidden w-60 shrink-0 border-r border-border-color bg-surface md:flex md:flex-col md:gap-4 md:p-4">
        <Link href="/dashboard" className="px-1">
          <GarageBadge garageName={garageName} logoUrl={logoUrl} />
        </Link>
        <nav aria-label={t("menu")} className="flex flex-1 flex-col gap-1">
          <NavLinks />
        </nav>
        <SignOutButton />
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
