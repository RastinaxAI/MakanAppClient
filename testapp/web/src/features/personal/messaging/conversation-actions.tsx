'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { BarChart3, Clock, Files, Info, ListChecks, MoreHorizontal, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import t from './messaging-theme.module.css';

export function ConversationActions({
  id,
  managed,
  writable = false,
}: {
  id: string;
  managed: boolean;
  writable?: boolean;
}) {
  return (
    <Menu.Root dir="rtl">
      <Menu.Trigger asChild>
        <Button size="icon" variant="ghost" aria-label={uiText.text_1e0263ee04dd}>
          <MoreHorizontal size={22} />
        </Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className={uiClass(`dropdown ${t.theme} ${t.menu}`)}
          sideOffset={8}
          align="end"
        >
          <Menu.Item asChild>
            <Link href={`/personal/messages/${id}/info`}>
              <Info size={20} />
              {uiText.text_3a3510c0ba99}
            </Link>
          </Menu.Item>
          <Menu.Item asChild>
            <Link href={`/personal/messages/${id}/media`}>
              <Files size={20} />
              {uiText.text_563cba00d087}
            </Link>
          </Menu.Item>
          {managed && (
            <Menu.Item asChild>
              <Link href={`/personal/messages/${id}/settings`}>
                <Settings size={20} />
                {uiText.text_ad01ea1c94b6}
              </Link>
            </Menu.Item>
          )}
          {writable &&
            [
              ['poll-new', uiText.v4Text.newPoll, BarChart3],
              ['quiz-new', uiText.v4Text.quiz, BarChart3],
              ['checklist-new', uiText.v4Text.newChecklist, ListChecks],
              ['scheduled', uiText.v4Text.scheduled, Clock],
            ].map(([section, label, Icon]) => {
              const Glyph = Icon as typeof Clock;
              return (
                <Menu.Item asChild key={String(section)}>
                  <Link href={`/personal/messages/${id}/${section}`}>
                    <Glyph size={20} />
                    {String(label)}
                  </Link>
                </Menu.Item>
              );
            })}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
