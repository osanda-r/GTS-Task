/**
 * Utility functions for importing and exporting data via CSV.
 */

/**
 * Export an array of objects to CSV and trigger download.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string = 'export.csv',
  delimiter: string = ','
): void {
  if (!data.length) {
    console.warn('No data provided for CSV export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header
  csvRows.push(headers.join(delimiter));

  // Data rows
  for (const row of data) {
    const values = headers.map(key => {
      let cell = row[key];
      if (cell === null || cell === undefined) {
        cell = '';
      } else {
        try {
          cell = JSON.stringify(cell).replace(/"/g, '""'); // Serialize objects and escape quotes
        } catch {
          cell = '';
        }
      }
      return `"${cell}"`;
    });
    csvRows.push(values.join(delimiter));
  }

  const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse CSV text into array of objects.
 */
function parseCSVText(text: string, delimiter: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  const headers = lines[0].split(delimiter).map(h => h.replace(/(^")|("$)/g, ''));

  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v =>
      v.replace(/(^")|("$)/g, '').replace(/""/g, '"')
    );
    const entry: Record<string, string> = {};
    headers.forEach((header, i) => {
      entry[header] = values[i] ?? '';
    });
    return entry;
  });
}

/**
 * Import CSV file and return parsed data as array of objects.
 */
export function importCSV(file: File, delimiter: string = ','): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      return reject(new Error('Invalid file type. Please upload a .csv file.'));
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = parseCSVText(text, delimiter);
        resolve(data);
      } catch (err) {
        // Ensure rejection reason is always an Error
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    reader.onerror = () => {
      const err = reader.error;
      reject(err instanceof Error ? err : new Error('File read error'));
    };

    reader.readAsText(file);
  });
}

