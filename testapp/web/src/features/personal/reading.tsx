'use client';
import { useEffect, useState } from 'react';
import { v4Text as t } from '@/content/fa';
import { V4List } from '@/components/v4/page';
import { V5Scene } from '@/components/v5/scene';
import { applyReadingPreference } from '@/lib/reading-preference';
export function ReadingOptions() {
  const [large, setLarge] = useState(false),
    [reduce, setReduce] = useState(false);
  useEffect(() => {
    applyReadingPreference();
    setLarge(document.documentElement.dataset.reading === 'large');
    setReduce(document.documentElement.dataset.motion === 'reduce');
  }, []);
  function change(key: string, value: boolean) {
    try {
      localStorage.setItem(key, value ? (key === 'makan-reading' ? 'large' : 'reduce') : 'system');
      applyReadingPreference();
    } catch {}
  }
  return (
    <section style={{ marginTop: 24 }} aria-label={t.reading} data-v4-view="MK-340">
      <h2 style={{ fontSize: 16, marginBottom: 12 }}>{t.reading}</h2>
      <V4List>
        <label className="v4-check">
          <span>
            {t.largerText}
            <small>{t.largerTextHint}</small>
          </span>
          <input
            type="checkbox"
            checked={large}
            onChange={(e) => {
              setLarge(e.target.checked);
              change('makan-reading', e.target.checked);
            }}
          />
        </label>
        <label className="v4-check">
          <span>
            {t.reduceMotion}
            <small>{t.reduceMotionHint}</small>
          </span>
          <input
            type="checkbox"
            checked={reduce}
            onChange={(e) => {
              setReduce(e.target.checked);
              change('makan-motion', e.target.checked);
            }}
          />
        </label>
      </V4List>
    </section>
  );
}

export function ReadingSettings() {
  return (
    <V5Scene id="MK-340" title={t.reading} back="/personal/settings">
      <ReadingOptions />
    </V5Scene>
  );
}
