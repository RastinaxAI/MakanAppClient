'use client';
import { useRef, useState } from 'react';
import { Bell, Check, Info } from 'lucide-react';
import Link from 'next/link';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/min';
import { v6Ui as t, text_c068733f39cf, text_9f2a436a61f3 } from '@/content/fa';
import { V5Scene } from '@/components/v5/scene';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { ErrorState } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { latinDigits, persianDigits } from '@/lib/formatting';
import { ApiError } from '@/lib/api/errors';
import { usePersonal } from '../provider';
import type { components } from '@/generated/api/schema';
import s from './directory.module.css';
type S = components['schemas'];
const names = new Intl.DisplayNames(['fa'], { type: 'region' });
const countries = getCountries().sort((a, b) =>
  (names.of(a) ?? a).localeCompare(names.of(b) ?? b, 'fa'),
);
export function ContactPhoneForm({
  onBack,
  onSaved,
}: {
  onBack: () => void;
  onSaved: () => Promise<void>;
}) {
  const { session, call } = usePersonal();
  const submitting = useRef(false);
  const [name, setName] = useState(''),
    [country, setCountry] = useState<CountryCode>('IR'),
    [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [invalid, setInvalid] = useState(''),
    [saved, setSaved] = useState(false);
  useUnsavedChanges(!saved && !!(name || phone));
  return (
    <V5Scene
      id="CON-02"
      title={t.addContact}
      subtitle={t.personalIdentity}
      back="/personal/contacts"
      onBack={onBack}
      backWithinPage
      deep
      kind="form"
      headerTools={
        <Button variant="ghost" size="icon" asChild>
          <Link href="/personal/notifications" aria-label={text_9f2a436a61f3}>
            <Bell size={20} />
          </Link>
        </Button>
      }
      actions={
        <Button
          form="phone-contact"
          type="submit"
          disabled={busy || !name.trim() || !phone.trim()}
          aria-busy={busy}
        >
          <Check size={20} />
          {t.saveContact}
        </Button>
      }
    >
      <form
        className={s.phoneForm}
        id="phone-contact"
        data-contact-phone-form
        onSubmit={async (event) => {
          event.preventDefault();
          if (submitting.current) return;
          const normalized = parsePhoneNumberFromString(latinDigits(phone).trim(), country);
          if (!name.trim() || !normalized?.isValid()) {
            setInvalid(t.invalidPhone);
            return;
          }
          submitting.current = true;
          setBusy(true);
          setError(undefined);
          setInvalid('');
          try {
            const resolved = await call<S['PeopleResolveResult']>('/api/v1/people/resolve', {
              method: 'POST',
              body: JSON.stringify({
                phoneNumber: normalized.number,
                username: null,
              } satisfies S['ResolvePersonCommand']),
            });
            const person = resolved.isDiscoverable ? resolved.profile : null;
            if (!person) {
              setInvalid(t.contactNotFound);
              return;
            }
            if (person.userId === session.user.id) {
              setInvalid(text_c068733f39cf);
              return;
            }
            const result = await call<S['UserContactResult']>('/api/v1/contacts', {
              method: 'POST',
              body: JSON.stringify({
                contactUserId: person.userId,
                savedName: name.trim(),
              } satisfies S['SaveUserContactCommand']),
            });
            if (result.contactUserId !== person.userId)
              throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
            setSaved(true);
            await onSaved();
          } catch (e) {
            setError(e);
          } finally {
            submitting.current = false;
            setBusy(false);
          }
        }}
      >
        <div className={s.phoneLead}>
          <h2>{t.contactLead}</h2>
          <p>{t.contactHint}</p>
        </div>
        <label className={s.phoneField}>
          <span>
            {t.contactName}{' '}
            <span className={s.required} aria-hidden="true">
              *
            </span>
          </span>
          <Input
            aria-label={t.contactName}
            autoComplete="name"
            required
            maxLength={200}
            value={name}
            disabled={busy}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={s.phoneField}>
          {t.country}
          <Select
            aria-label={t.country}
            autoComplete="country"
            disabled={busy}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value as CountryCode);
              setInvalid('');
            }}
          >
            {countries.map((code) => (
              <option key={code} value={code}>
                {names.of(code)} +{persianDigits(getCountryCallingCode(code))}
              </option>
            ))}
          </Select>
        </label>
        <label className={s.phoneField}>
          <span>
            {t.contactPhone}{' '}
            <span className={s.required} aria-hidden="true">
              *
            </span>
          </span>
          <Input
            aria-label={t.contactPhone}
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel-national"
            required
            value={phone}
            disabled={busy}
            aria-invalid={!!invalid}
            aria-describedby="contact-phone-help"
            onChange={(e) => {
              setPhone(e.target.value);
              setInvalid('');
            }}
          />
          <small id="contact-phone-help" role={invalid ? 'alert' : undefined}>
            {invalid || t.contactExample}
          </small>
        </label>
        <div className={s.phoneNotice}>
          <Info size={20} aria-hidden="true" />
          <p>{t.contactPrivacy}</p>
        </div>
        <p className={s.cloudHint}>{t.contactCloud}</p>
        {!!error && <ErrorState error={error} />}
      </form>
    </V5Scene>
  );
}
