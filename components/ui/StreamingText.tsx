'use client';
import { useEffect, useState } from 'react';

export function StreamingText({ value }: { value: string }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{display}</pre>;
}
