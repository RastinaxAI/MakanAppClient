import { getSettings } from "@/lib/public-api";
import { ContactInformation } from "./contact-information";

export async function ContactChannels() {
  const siteConfig = (await getSettings()).general;
  return (
    <aside className="public-contact-channels rounded-2xl border border-border bg-secondary p-6">
      <h2 className="text-xl font-semibold">راه‌های ارتباطی رسمی</h2>
      <ContactInformation general={siteConfig} />
    </aside>
  );
}
