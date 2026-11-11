'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { dismissJalaliPickerWithin } from '@/lib/jalali-picker-state';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from './button';
import s from './dialog.module.css';
const dialogClass = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((name) => [name, s[name] ?? ''])
    .join(' ');
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export function DialogHero({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <section className={uiClass(dialogClass('v5-dialog-hero'))}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </section>
  );
}
const DialogFormAction = createContext<((action: ReactNode) => void) | null>(null);
export function useDialogFormAction(action: ReactNode, enabled = true) {
  const publish = useContext(DialogFormAction);
  useEffect(() => {
    if (!enabled || !publish) return;
    publish(action);
    return () => publish(undefined);
  }, [publish, action, enabled]);
  return enabled && !!publish;
}
export function DialogContent({
  title,
  description,
  descriptionHidden = false,
  children,
  side = false,
  onCloseAutoFocus,
  className = '',
  scenario,
  footer,
}: {
  title: string;
  description?: string;
  descriptionHidden?: boolean;
  children: React.ReactNode;
  side?: boolean;
  onCloseAutoFocus?: React.ComponentProps<typeof DialogPrimitive.Content>['onCloseAutoFocus'];
  className?: string;
  scenario?: string;
  footer?: ReactNode;
}) {
  const content = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [componentActions, setComponentActions] = useState<ReactNode>();
  const generatedFormId = 'dialog-form-' + useId();
  type ChildProps = {
    className?: string;
    children?: ReactNode;
    id?: string;
    asChild?: boolean;
    form?: string;
  };
  const actions: ReactNode[] = [];
  const isActions = (node: ReactNode) =>
    isValidElement<ChildProps>(node) &&
    (node.props.className?.split(/\s+/).includes('confirm-actions') ||
      Object.hasOwn(node.props, 'data-dialog-actions'));
  function bindForm(node: ReactNode, form: string): ReactNode {
    if (!isValidElement<ChildProps>(node)) return node;
    return cloneElement(node, {
      ...((node.type === 'button' || node.type === Button) && !node.props.asChild ? { form } : {}),
      ...(node.props.children
        ? { children: Children.map(node.props.children, (child) => bindForm(child, form)) }
        : {}),
    });
  }
  const body = Children.map(children, (node) => {
    if (isActions(node)) {
      actions.push(node);
      return null;
    }
    if (isValidElement<ChildProps>(node) && node.type === 'form') {
      const form = node.props.id || generatedFormId;
      let extracted = false;
      const fields = Children.map(node.props.children, (child) => {
        if (!isActions(child)) return child;
        extracted = true;
        actions.push(bindForm(child, form));
        return null;
      });
      if (extracted) return cloneElement(node, { id: form, children: fields });
    }
    return node;
  });
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={uiClass(dialogClass('dialog-overlay'))} />
      <DialogPrimitive.Content
        ref={content}
        dir="rtl"
        data-v4-sheet
        data-design-scenario={scenario}
        className={uiClass(
          dialogClass(`dialog-content ${side ? 'sheet-content' : ''} ${className}`),
        )}
        onOpenAutoFocus={() => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          const previous = returnFocus.current;
          if (
            !event.defaultPrevented &&
            previous?.isConnected &&
            previous !== document.body &&
            previous.getBoundingClientRect().height
          ) {
            event.preventDefault();
            previous.focus();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (dismissJalaliPickerWithin(content.current)) event.preventDefault();
        }}
      >
        <div className={uiClass(dialogClass('dialog-heading'))}>
          <div>
            <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          </div>
          <DialogPrimitive.Close asChild>
            <Button aria-label={uiText.text_313cbecb4dd3} size="icon" variant="ghost">
              <X size={19} />
            </Button>
          </DialogPrimitive.Close>
        </div>
        <div className={uiClass(dialogClass('dialog-body'))}>
          <DialogPrimitive.Description
            className={uiClass(
              description && !descriptionHidden ? dialogClass('dialog-description') : 'sr-only',
            )}
          >
            {description ?? uiText.text_ac2d64a54b28}
          </DialogPrimitive.Description>
          <DialogFormAction.Provider value={setComponentActions}>{body}</DialogFormAction.Provider>
        </div>
        {(footer || componentActions || actions.length > 0) && (
          <footer className={uiClass(dialogClass('dialog-actions'))}>
            {footer || componentActions || actions}
          </footer>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
