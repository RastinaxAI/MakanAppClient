import { uiClass } from '@/components/v5/classes';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import s from './button.module.css';

/** Stable semantic hooks plus the sole local owner of button appearance. */
export function buttonClass(value: string) {
  const names = value.split(/\s+/).filter(Boolean);
  const map: Record<string, string> = {
    button: s.button,
    'button-primary': s.primary,
    'button-outline': s.outline,
    'button-ghost': s.ghost,
    'button-danger': s.danger,
    'button-sm': s.sm,
    'button-icon': s.icon,
  };
  const local = names.flatMap((name) => (map[name] ? [map[name]] : []));
  if (names.includes('btn')) {
    local.push(
      s.button,
      s.legacy,
      names.includes('secondary') || names.includes('ghost')
        ? s.outline
        : names.includes('danger')
          ? s.danger
          : s.primary,
    );
  }
  if (names.includes('ibtn')) local.push(s.button, s.icon, s.ghost);
  return [...new Set([...names, ...local])].join(' ');
}
const variants = cva('button', {
  variants: {
    variant: {
      default: 'button-primary',
      outline: 'button-outline',
      ghost: 'button-ghost',
      destructive: 'button-danger',
    },
    size: { default: '', sm: 'button-sm', icon: 'button-icon' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={uiClass(buttonClass(cn(variants({ variant, size }), className)))} {...props} />
  );
}
