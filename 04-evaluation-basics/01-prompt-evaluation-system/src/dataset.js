export function validateDataset(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 200) throw new Error('Dataset must contain 1–200 questions');
  const ids = new Set();
  return value.map((row, i) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`Row ${i+1} must be an object`);
    for (const key of ['id','question','expectedOutput']) if (typeof row[key] !== 'string' || !row[key].trim() || row[key].length > 3000) throw new Error(`Row ${i+1}: invalid ${key}`);
    if (ids.has(row.id)) throw new Error(`Duplicate id: ${row.id}`); ids.add(row.id);
    if (row.keywords !== undefined && (!Array.isArray(row.keywords) || row.keywords.length > 30 || row.keywords.some(k=>typeof k !== 'string' || !k.trim() || k.length > 100))) throw new Error(`Row ${i+1}: invalid keywords`);
    if (row.actualOutput !== undefined && (typeof row.actualOutput !== 'string' || row.actualOutput.length > 10000)) throw new Error(`Row ${i+1}: invalid actualOutput`);
    return { id: row.id, question: row.question, expectedOutput: row.expectedOutput, keywords: row.keywords ?? [], ...(row.actualOutput !== undefined ? {actualOutput:row.actualOutput}: {}) };
  });
}
