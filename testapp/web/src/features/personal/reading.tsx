'use client';
import { uiClass } from '@/components/v5/classes';

import { useEffect, useId, useMemo, useState } from 'react';
import { v4Text as t, v5Product as v5 } from '@/content/fa';
import { V4Hero, V4List, V4SwitchRow } from '@/components/v4/page';
import { V5Scene } from '@/components/v5/scene';
import { Button } from '@/components/ui/button';
import { useSceneFormAction, useSceneContextSummary } from '@/components/v5/form-actions';
import { applyReadingPreference } from '@/lib/reading-preference';
export function ReadingOptions() {
  const formId = useId();
  const [large, setLarge] = useState(false),
    [reduce, setReduce] = useState(false);
  const [error, setError] = useState(''),
    [saved, setSaved] = useState(false);
  const action = useMemo(
    () => (
      <Button type="submit" form={formId}>
        {v5.saveReading}
      </Button>
    ),
    [formId],
  );
  const lifted = useSceneFormAction(action);
  useSceneContextSummary([
    { label: t.largerText, value: large ? v5.preferenceOn : v5.preferenceOff },
    { label: t.reduceMotion, value: reduce ? v5.preferenceOn : v5.preferenceOff },
  ]);
  useEffect(() => {
    applyReadingPreference();
    setLarge(document.documentElement.dataset.reading === 'large');
    setReduce(document.documentElement.dataset.motion === 'reduce');
  }, []);
  function change(key: string, value: boolean) {
    setSaved(false);
    try {
      localStorage.setItem(key, value ? (key === 'makan-reading' ? 'large' : 'reduce') : 'system');
      applyReadingPreference();
      setError('');
      return true;
    } catch {
      setError(v5.readingStorageError);
      return false;
    }
  }
  return (
    <form
      id={formId}
      aria-label={t.reading}
      data-v4-view="MK-340"
      onSubmit={(event) => {
        event.preventDefault();
        if (change('makan-reading', large) && change('makan-motion', reduce)) setSaved(true);
      }}
    >
      <V4List>
        <V4SwitchRow
          title={t.largerText}
          description={v5.readingLargeHint}
          checked={large}
          onCheckedChange={(checked) => {
            if (change('makan-reading', checked)) setLarge(checked);
          }}
        />
        <V4SwitchRow
          title={t.reduceMotion}
          description={v5.readingMotionHint}
          checked={reduce}
          onCheckedChange={(checked) => {
            if (change('makan-motion', checked)) setReduce(checked);
          }}
        />
      </V4List>
      <V4Hero title={v5.readingPreview}>{v5.readingPreviewText}</V4Hero>
      {saved && <p role="status">{v5.readingSaved}</p>}
      {error && (
        <p role="alert" className={uiClass('field-error')}>
          {error}
        </p>
      )}
      {!lifted && action}
    </form>
  );
}

export function ReadingSettings() {
  return (
    <V5Scene id="MK-340" title={t.reading} back="/personal/settings">
      <ReadingOptions />
    </V5Scene>
  );
}
