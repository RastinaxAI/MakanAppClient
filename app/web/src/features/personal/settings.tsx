'use client';
import { Input as NativeInput, Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import appearance from './appearance.module.css';
import { buttonClass } from '@/components/ui/button';
import { Bell, MonitorSmartphone, ContactRound, Phone, Download, UserRoundX } from 'lucide-react';
import { Palette, ShieldCheck, Headphones } from 'lucide-react';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { useThemePreference } from './theme';
import { applyReadingPreference } from '@/lib/reading-preference';
import { useState, useEffect } from 'react';
export function ProfilePreferences() {
  return <PersonalSettings />;
}
export function PersonalSettings() {
  const t = uiText.v5Product;

  return (
    <V5Scene
      id="MK-338"
      title={uiText.navigation_settings}
      back="/personal/profile"
      kind="list"
      subtitle={uiText.v6Ui.personalIdentity}
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
            href: '/personal/settings/appearance',
            title: uiText.v6Ui.settingsAppearance,
            description: uiText.v6Ui.settingsAppearanceHint,
            Icon: Palette,
          },
          {
            href: '/personal/settings/notifications',
            title: uiText.text_9f2a436a61f3,
            description: t.notificationsDescription,
            Icon: Bell,
          },
          {
            href: '/personal/settings/privacy',
            title: uiText.v6Ui.settingsPrivacy,
            description: uiText.v6Ui.settingsPrivacyHint,
            Icon: ShieldCheck,
          },
          {
            href: '/personal/settings/devices',
            title: uiText.v6Ui.settingsDevices,
            description: t.devicesDescription,
            Icon: MonitorSmartphone,
          },
          {
            href: '/personal/contacts?view=sync',
            title: uiText.v6Ui.syncContacts,
            description: uiText.v6Ui.syncHint,
            Icon: ContactRound,
          },
        ].map(({ Icon, ...item }) => (
          <V4Row key={item.href} {...item} icon={<Icon />} />
        ))}
      </V4List>
      <V4List>
        <V4Row href="/personal/settings/phone" title={uiText.v4Text.phoneChange} icon={<Phone />} />
        <V4Row href="/personal/settings/help" title={uiText.v4Text.support} icon={<Headphones />} />
        <V4Row
          href="/personal/settings/install"
          title={uiText.v6Ui.installApp}
          icon={<Download />}
        />
        <V4Row
          href="/personal/settings/delete-account"
          title={uiText.v4Text.deleteAccount}
          icon={<UserRoundX />}
        />
      </V4List>
    </V5Scene>
  );
}
export function AppearanceSettings() {
  const { theme, changeTheme, error } = useThemePreference();
  const [draft, setDraft] = useState(theme);
  const [reading, setReading] = useState({ size: 'system', reduce: false });
  const [readingError, setReadingError] = useState('');
  function changeReading(key: 'makan-reading' | 'makan-motion', value: string) {
    try {
      localStorage.setItem(key, value);
      applyReadingPreference();
      setReading({
        size: document.documentElement.dataset.reading ?? 'standard',
        reduce: document.documentElement.dataset.motion === 'reduce',
      });
      setReadingError('');
    } catch {
      setReadingError(uiText.v5Product.readingStorageError);
    }
  }
  useEffect(
    () =>
      setReading({
        size: document.documentElement.dataset.reading ?? 'standard',
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
      menu={
        <Link
          href="/personal/settings/reading"
          className={uiClass(buttonClass('button button-outline'))}
        >
          {uiText.v4Text.reading}
        </Link>
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
                  onChange={() => {
                    setDraft(value);
                    changeTheme(value);
                  }}
                />
                <span>
                  <b>{title}</b>
                  <small>{uiText.v6Ui.themeHints[value]}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <p className={uiClass('policy')}>{t.appearancePolicy}</p>
        </section>
        <section className={uiClass('card')}>
          <h3>{uiText.v4Text.reading}</h3>
          <label className={appearance.size}>
            {uiText.v6Ui.textSize}
            <NativeSelect
              aria-label={uiText.v6Ui.textSize}
              value={reading.size}
              onChange={(event) => changeReading('makan-reading', event.target.value)}
            >
              <option value="standard">{uiText.v6Ui.textStandard}</option>
              <option value="comfortable">{uiText.v6Ui.textComfortable}</option>
              <option value="large">{uiText.v6Ui.textVeryLarge}</option>
            </NativeSelect>
          </label>
          <label className={appearance.motion}>
            <NativeInput
              type="checkbox"
              role="switch"
              aria-label={uiText.v4Text.reduceMotion}
              checked={reading.reduce}
              onChange={(event) =>
                changeReading('makan-motion', event.target.checked ? 'reduce' : 'system')
              }
            />
            <span>
              <b>{uiText.v4Text.reduceMotion}</b>
              <small>{uiText.v5Product.readingMotionHint}</small>
            </span>
          </label>
        </section>
        <p className={uiClass('policy')}>{uiText.v6Ui.preferenceKeepsDraft}</p>
        {readingError && (
          <p role="alert" className={uiClass('field-error')}>
            {readingError}
          </p>
        )}
        {error && (
          <p role="alert" className={uiClass('field-error')}>
            {error}
          </p>
        )}
      </div>
    </V5Scene>
  );
}
