import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export function useCsvData<T>(fileName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/data/${fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileName}`);
        }
        const csvText = await response.text();

        // Detect delimiter: check if semicolon exists and if it produces more columns than comma
        const semiCount = (csvText.match(/;/g) || []).length;
        const commaCount = (csvText.match(/,/g) || []).length;
        const delimiter = semiCount > commaCount ? ";" : ",";

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          delimiter: delimiter,
          complete: (results) => {
            // Clean keys of any potential whitespace
            const cleanedData = results.data.map((row: any) => {
               const cleanRow: any = {};
               Object.keys(row).forEach(key => {
                  cleanRow[key.trim()] = row[key];
               });
               return cleanRow;
            });
            setData(cleanedData as T[]);
            setLoading(false);
          },
          error: (err: any) => {
            setError(err);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }
    fetchData();
  }, [fileName]);

  return { data, loading, error };
}

export function useMarkdownData(fileName: string) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/data/markdown/${fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileName}`);
        }
        const text = await response.text();
        setContent(text);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }
    fetchData();
  }, [fileName]);

  return { content, loading, error };
}
