'use client';
import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { Bell, MonitorSmartphone, UserRound, Wallet } from 'lucide-react';
import { Moon, Palette, ShieldCheck, Sun } from 'lucide-react';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { useThemePreference } from './theme';
import { usePersonal } from './provider';
import { label } from '@/components/ui/states';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
export function ProfilePreferences() {
  return <PersonalSettings />;
}
export function PersonalSettings() {
  const { session } = usePersonal();
  const t = uiText.v5Product;

  return (
    <V5Scene
      id="MK-338"
      title={uiText.navigation_settings}
      back="/personal/profile"
      kind="list"
      subtitle={[label(session.context.activeRole ?? 'Personal'), session.user.firstName]
        .filter(Boolean)
        .join(' · ')}
      deep={false}
    >
      <V4List>
        {[
          {
            href: '/personal/profile/edit',
            title: t.account,
            description: t.accountSettingsDescription,
            Icon: UserRound,
          },
          {
            href: '/personal/settings/privacy',
            title: t.communication,
            description: t.communicationDescription,
            Icon: ShieldCheck,
          },
          {
            href: '/personal/settings/notifications',
            title: uiText.text_9f2a436a61f3,
            description: t.notificationsDescription,
            Icon: Bell,
          },
          {
            href: '/personal/settings/appearance',
            title: t.appearance,
            description: t.appearanceSettingsDescription,
            Icon: Palette,
          },
          {
            href: '/personal/settings/devices',
            title: t.security,
            description: t.devicesDescription,
            Icon: MonitorSmartphone,
          },
          {
            href: '/personal/subscription',
            title: t.billing,
            description: t.billingDescription,
            Icon: Wallet,
          },
        ].map(({ Icon, ...item }) => (
          <V4Row key={item.href} {...item} icon={<Icon />} />
        ))}
      </V4List>
    </V5Scene>
  );
}
export function AppearanceSettings() {
  const { theme, changeTheme, error } = useThemePreference(),
    router = useRouter();
  const [draft, setDraft] = useState(theme);
  useEffect(() => setDraft(theme), [theme]);
  const t = uiText.v5Product;
  return (
    <>
      <PersonalSettings />
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) router.push('/personal/settings');
        }}
      >
        <DialogContent
          title={uiText.text_11a1d93d127f}
          description={t.appearancePolicy}
          className="v5-appearance-dialog"
        >
          <fieldset className="v5-appearance-choices">
            <legend className="sr-only">{uiText.text_88619bd1891f}</legend>
            {(
              [
                {
                  value: 'system',
                  title: uiText.text_a11180341c26,
                  description: t.systemDescription,
                  Icon: MonitorSmartphone,
                },
                {
                  value: 'light',
                  title: uiText.text_be9fd3bd1ba1,
                  description: t.lightDescription,
                  Icon: Sun,
                },
                {
                  value: 'dark',
                  title: uiText.text_9a0be82749f7,
                  description: t.darkDescription,
                  Icon: Moon,
                },
              ] as const
            ).map(({ value, title, description, Icon }) => (
              <label key={value}>
                <Icon size={24} />
                <span className="grow">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <input
                  type="radio"
                  aria-label={title}
                  name="appearance"
                  value={value}
                  checked={draft === value}
                  onChange={() => setDraft(value)}
                />
              </label>
            ))}
          </fieldset>
          <p className="policy">{t.appearancePolicy}</p>
          <div className="confirm-actions">
            <Button
              onClick={() => {
                changeTheme(draft);
                router.push('/personal/settings');
              }}
            >
              {t.saveAppearance}
            </Button>
            <Button variant="outline" onClick={() => router.push('/personal/settings')}>
              {uiText.text_fa7af603d430}
            </Button>
          </div>
          <Link href="/personal/settings/reading">{uiText.v4Text.reading}</Link>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
