'use client';
import * as uiText from '@/content/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { ErrorState } from '@/components/ui/states';
import { V4Page, V4Field } from '@/components/v4/page';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { usePersonal } from './provider';
import { ProfilePhotoEditor } from './profile-photo';
import { localToday, profilePatch } from './profile-model';
export function PersonalProfileEdit() {
  const { session, call, reload } = usePersonal(),
    router = useRouter();
  const [values, setValues] = useState({
    firstName: session.user.firstName ?? '',
    lastName: session.user.lastName ?? '',
    displayName: session.user.displayName ?? '',
    username: session.user.username ?? '',
    dateOfBirth: session.user.dateOfBirth ?? '',
  });
  const [busy, setBusy] = useState(false),
    [photoBusy, setPhotoBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const dirty = Object.entries(values).some(
    ([key, value]) => value !== (session.user[key as keyof typeof values] ?? ''),
  );
  useUnsavedChanges(dirty);
  return (
    <V4Page
      id="MK-335"
      title={uiText.text_7f941e8233a2}
      subtitle={`${uiText.text_d034f3bcfe7f} · ${session.user.firstName ?? session.user.displayName ?? ''}`}
      back="/personal/profile"
      menu={<ProfilePhotoEditor disabled={busy || dirty} onBusyChange={setPhotoBusy} />}
      actions={
        <Button form="profile-edit" type="submit" disabled={busy || photoBusy}>
          {busy ? uiText.text_b5ef00b1806f : uiText.v5Product.savedProfile}
        </Button>
      }
    >
      <form
        id="profile-edit"
        data-profile-form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy || photoBusy) return;
          setBusy(true);
          setError(undefined);
          try {
            await call('/api/v1/me/profile', {
              method: 'PATCH',
              body: JSON.stringify(profilePatch(values)),
            });
            await reload();
            router.replace('/personal/profile');
          } catch (e) {
            setError(e);
          } finally {
            setBusy(false);
          }
        }}
      >
        {(
          [
            { key: 'firstName', label: uiText.text_69c1e5b1fe20, autoComplete: 'given-name' },
            { key: 'lastName', label: uiText.text_3fe7ba4a2131, autoComplete: 'family-name' },
            { key: 'displayName', label: uiText.text_5903c1c121cb, autoComplete: 'nickname' },
          ] as const
        ).map((field) => (
          <V4Field key={field.key} label={field.label}>
            <input
              disabled={busy || photoBusy}
              autoComplete={field.autoComplete}
              value={values[field.key]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            />
          </V4Field>
        ))}
        <V4Field label={uiText.text_173fec6019a6}>
          <input
            disabled={busy || photoBusy}
            dir="ltr"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={values.username}
            onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))}
          />
        </V4Field>
        <V4Field
          label={uiText.text_7bc42d578dfb}
          hint={
            uiText.text_9329e1335db1 +
            (session.user.dateOfBirth && !values.dateOfBirth ? uiText.text_79778d4644fa : '')
          }
        >
          <JalaliDateInput
            value={values.dateOfBirth}
            max={localToday()}
            disabled={busy || photoBusy}
            onValueChange={(dateOfBirth) => setValues((v) => ({ ...v, dateOfBirth }))}
          />
        </V4Field>
        {!!error && <ErrorState error={error} />}
      </form>
    </V4Page>
  );
}
