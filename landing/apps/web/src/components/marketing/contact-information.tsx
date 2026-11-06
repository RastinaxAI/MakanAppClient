import { Mail, Phone, Signpost } from "lucide-react";
import type { CmsSettings } from "@/features/cms/types";
import { contactDetails } from "@/lib/contact-details";

export function ContactInformation({
  general,
  compact = false,
}: {
  general?: CmsSettings["general"];
  compact?: boolean;
}) {
  const phone = general ? general.phone : contactDetails.phone;
  const email = general ? general.email : contactDetails.email;
  return (
    <dl
      className={`contact-information${compact ? " contact-information-compact" : ""}`}
    >
      <div>
        <dt>نشانی دفتر</dt>
        <dd>
          <address>{contactDetails.address}</address>
        </dd>
      </div>
      <div>
        <dt>
          <Phone size={18} aria-hidden="true" /> تلفن‌های تماس
        </dt>
        <dd className="contact-phone-list">
          {phone && (
            <a href={`tel:${phone.replace(/[ ()-]/g, "")}`}>
              <bdi dir="ltr">{phone}</bdi>
            </a>
          )}
          {contactDetails.officePhones.map((item) => (
            <a key={item.href} href={item.href}>
              <bdi dir="ltr">{item.display}</bdi>
            </a>
          ))}
        </dd>
      </div>
      {email && (
        <div>
          <dt>
            <Mail size={18} aria-hidden="true" /> ایمیل
          </dt>
          <dd>
            <a href={`mailto:${email}`}>
              <bdi dir="ltr">{email}</bdi>
            </a>
          </dd>
        </div>
      )}
      <div>
        <dt>
          <Signpost size={18} aria-hidden="true" /> کد پستی
        </dt>
        <dd>
          <bdi dir="ltr">{contactDetails.postalCode}</bdi>
        </dd>
      </div>
    </dl>
  );
}
