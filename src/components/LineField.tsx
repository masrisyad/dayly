import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

interface LineFieldProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  multiline?: boolean;
  rows?: number;
  onEnter?: () => void;
}

/**
 * A text field that keeps its own draft while focused and saves on a short debounce and on blur,
 * so live DB updates never fight with the user's typing.
 */
export function LineField({ value, onCommit, placeholder, className, ariaLabel, multiline, rows = 4, onEnter }: LineFieldProps) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef({ draft, value, onCommit });
  latest.current = { draft, value, onCommit };

  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  const flush = () => {
    window.clearTimeout(timer.current);
    const { draft: d, value: v, onCommit: commit } = latest.current;
    if (d !== v) commit(d);
  };

  // Save pending edits if the component unmounts (e.g. navigating away mid-typing).
  useEffect(() => flush, []);

  const change = (next: string) => {
    setDraft(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, 500);
  };

  const common = {
    className: `line-input ${className ?? ''}`,
    value: draft,
    placeholder,
    'aria-label': ariaLabel ?? placeholder,
    onFocus: () => (focused.current = true),
    onBlur: () => {
      focused.current = false;
      flush();
    },
  };

  if (multiline) {
    return <textarea {...common} rows={rows} onChange={(e) => change(e.target.value)} />;
  }
  return (
    <input
      {...common}
      type="text"
      enterKeyHint="done"
      onChange={(e) => change(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          flush();
          if (onEnter) onEnter();
          else e.currentTarget.blur();
        }
      }}
    />
  );
}
