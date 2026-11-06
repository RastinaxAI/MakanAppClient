import { Container } from "@/components/layout/container";
import { ContactChannels } from "@/components/marketing/contact-channels";
import { RequestForm } from "./request-form-lazy";

// Keep form validation and its client bundle in the two routes that render a form.
export function PublicRequestSection({ kind }: { kind: "demo" | "contact" }) {
  return (
    <section
      className={`public-request-layout section-space${kind === "contact" ? " public-info-page public-contact-page" : ""}`}
    >
      <Container
        className={`grid items-start gap-8 ${kind === "contact" ? "desktop:grid-cols-2" : "desktop:grid-cols-[1.35fr_1fr]"}`}
      >
        <RequestForm kind={kind} />
        <ContactChannels />
      </Container>
    </section>
  );
}
