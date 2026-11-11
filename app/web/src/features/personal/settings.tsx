'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import appearance from './appearance.module.css';
import { Button, buttonClass } from '@/components/ui/button';
import { Bell, MonitorSmartphone, UserRound, Wallet } from 'lucide-react';
import { Palette, ShieldCheck, Type, Accessibility, Headphones } from 'lucide-react';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { useThemePreference } from './theme';
import { usePersonal } from './provider';
import { label } from '@/components/ui/states';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
      menu={
        <div className={uiClass('stack')}>
          <Link
            className={uiClass(buttonClass('button button-outline'))}
            href="/personal/settings/reading"
          >
            {uiText.v4Text.reading}
          </Link>
          <Link className={uiClass(buttonClass('button button-outline'))} href="/personal/profile">
            {uiText.navigation_profile}
          </Link>
          <Link
            className={uiClass(buttonClass('button button-outline'))}
            href="/personal/settings/help"
          >
            {uiText.v4Text.support}
          </Link>
        </div>
      }
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
  const [reading, setReading] = useState({ large: false, reduce: false });
  useEffect(
    () =>
      setReading({
        large: document.documentElement.dataset.reading === 'large',
        reduce: document.documentElement.dataset.motion === 'reduce',
      }),
    [],
  );
  useEffect(() => setDraft(theme), [theme]);
  const t = uiText.v5Product;
  return (
    <V5Scene
      id="MK-339"
      title={t.appearance}
      back="/personal/settings"
      kind="form"
      deep
      actions={
        <>
          <Button
            onClick={() => {
              if (changeTheme(draft)) router.push('/personal/settings');
            }}
          >
            {t.saveAppearance}
          </Button>
          <Button variant="outline" onClick={() => router.push('/personal/settings')}>
            {uiText.text_fa7af603d430}
          </Button>
        </>
      }
    >
      <div className={appearance.page}>
        <section className={uiClass('card')}>
          <h3>{uiText.text_11a1d93d127f}</h3>
          <fieldset className={appearance.themeChoices}>
            <legend className={uiClass('sr-only')}>{uiText.text_88619bd1891f}</legend>
            {(
              [
                { value: 'light', title: uiText.text_be9fd3bd1ba1 },
                { value: 'dark', title: uiText.text_9a0be82749f7 },
                { value: 'system', title: uiText.text_09ac966bd1cb },
              ] as const
            ).map(({ value, title }) => (
              <label key={value}>
                <NativeInput
                  type="radio"
                  name="appearance"
                  aria-label={title}
                  value={value}
                  checked={draft === value}
                  onChange={() => setDraft(value)}
                />
                <span>{title}</span>
              </label>
            ))}
          </fieldset>
          <p className={uiClass('policy')}>{t.appearancePolicy}</p>
        </section>
        <section className={uiClass('card')}>
          <h3>{uiText.v4Text.reading}</h3>
          <V4List>
            <V4Row
              href="/personal/settings/reading"
              icon={<Type />}
              title={uiText.v4Text.largerText}
              description={reading.large ? t.preferenceOn : t.preferenceOff}
            />
            <V4Row
              href="/personal/settings/reading"
              icon={<Accessibility />}
              title={uiText.v4Text.reduceMotion}
              description={reading.reduce ? t.preferenceOn : uiText.text_09ac966bd1cb}
            />
          </V4List>
        </section>
        <V4List>
          <V4Row
            href="/personal/settings/notifications"
            icon={<Bell />}
            title={uiText.text_9f2a436a61f3}
          />
          <V4Row
            href="/personal/settings/privacy"
            icon={<ShieldCheck />}
            title={uiText.v5Product.communication}
          />
          <V4Row
            href="/personal/settings/help"
            icon={<Headphones />}
            title={uiText.v4Text.support}
          />
        </V4List>
        {error && (
          <p role="alert" className={uiClass('field-error')}>
            {error}
          </p>
        )}
      </div>
    </V5Scene>
  );
}
