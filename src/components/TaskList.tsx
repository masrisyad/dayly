import { useState } from 'react';
import type { Task } from '../db/db';
import { deleteTask, updateTask } from '../db/repo';
import { useI18n } from '../i18n';
import { HeartCheck } from './HeartCheck';
import { LineField } from './LineField';

export function TaskList({ tasks, onAdd, minRows = 0 }: { tasks: Task[]; onAdd: (text: string) => void; minRows?: number }) {
  const { t } = useI18n();
  return (
    <div>
      {tasks.map((task) => (
        <div className="line" key={task.id}>
          <HeartCheck checked={task.done} onChange={(done) => updateTask(task.id, { done })} label={task.text} />
          <LineField
            value={task.text}
            className={task.done ? 'is-done' : ''}
            onCommit={(text) => (text.trim() ? updateTask(task.id, { text }) : deleteTask(task.id))}
          />
          <button type="button" className="icon-btn" aria-label={t.task.delete} onClick={() => deleteTask(task.id)}>
            <CrossIcon />
          </button>
        </div>
      ))}
      <AddLine placeholder={t.task.placeholder} onAdd={onAdd} />
      {Array.from({ length: Math.max(0, minRows - tasks.length - 1) }, (_, i) => (
        <div className="line" key={`pad-${i}`} aria-hidden="true" />
      ))}
    </div>
  );
}

/** The always-empty last row; Enter adds the item and keeps focus for the next one. */
export function AddLine({ placeholder, onAdd }: { placeholder: string; onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  const submit = () => {
    if (text.trim()) onAdd(text.trim());
    setText('');
  };
  return (
    <div className="line">
      <span className="heart-check" aria-hidden="true">
        <PlusIcon />
      </span>
      <input
        className="line-input"
        type="text"
        enterKeyHint="enter"
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        onBlur={submit}
      />
    </div>
  );
}

/** Editable list of plain strings (reminders, achievements). */
export function StringList({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const { t } = useI18n();
  return (
    <div>
      {items.map((item, i) => (
        <div className="line" key={i}>
          <span className="heart-check" aria-hidden="true">
            <Dot />
          </span>
          <LineField
            value={item}
            onCommit={(text) => onChange(text.trim() ? items.map((x, j) => (j === i ? text : x)) : items.filter((_, j) => j !== i))}
          />
          <button type="button" className="icon-btn" aria-label={t.common.delete} onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <CrossIcon />
          </button>
        </div>
      ))}
      <AddLine placeholder={placeholder} onAdd={(text) => onChange([...items, text])} />
    </div>
  );
}

export const CrossIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="9" r="8" fill="none" stroke="#e2aab5" strokeWidth="1.4" strokeDasharray="3 2" />
    <path d="M9 5.5v7M5.5 9h7" stroke="#d98b9c" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Dot = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="4" fill="var(--pink)" />
  </svg>
);
