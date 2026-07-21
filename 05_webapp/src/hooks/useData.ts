import { useState, useEffect } from 'react';
import Papa from 'papaparse';

function parseCsvText(text: string) {
  const tryParse = (delimiter: string) =>
    Papa.parse(text, { header: true, skipEmptyLines: true, delimiter }).data as any[];

  let rows = tryParse(',');
  const firstKey = rows[0] ? Object.keys(rows[0])[0] : '';
  if (firstKey && firstKey.includes(';')) rows = tryParse(';');

  return rows.map((row) => {
    const cleanRow: any = {};
    Object.keys(row).forEach((key) => {
      cleanRow[key.trim().replace(/^"|"$/g, '')] = typeof row[key] === 'string' ? row[key].trim().replace(/^"|"$/g, '') : row[key];
    });
    return cleanRow;
  });
}

export function useCsvData<T>(fileName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(`/data/${fileName}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch ${fileName}`);
        return r.text();
      })
      .then((csvText) => setData(parseCsvText(csvText) as T[]))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [fileName]);

  return { data, loading, error };
}

export function useMarkdownData(fileName: string) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(`/data/markdown/${fileName}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch ${fileName}`);
        return r.text();
      })
      .then(setContent)
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [fileName]);

  return { content, loading, error };
}
