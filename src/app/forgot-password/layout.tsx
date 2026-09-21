import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return { title: t("forgotPasswordTitle") };
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
