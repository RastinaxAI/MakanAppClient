import { clsx, type ClassValue } from 'clsx';
import styles from './foundations.module.css';

/**
 * Local shared-component classes, with stable semantic hooks for connected forms,
 * DOM inspection and existing feature slots. Hooks carry no global stylesheet.
 */
export function uiClass(...values: ClassValue[]) {
  const names = clsx(values).split(/\s+/).filter(Boolean);
  return [
    ...new Set(
      names
        .flatMap((name) => [name, Object.hasOwn(styles, name) ? styles[name] : ''])
        .filter(Boolean),
    ),
  ].join(' ');
}
