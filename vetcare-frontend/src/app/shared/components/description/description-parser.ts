export type DescriptionBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] };

const KNOWN_HEADINGS = new Set([
  'sastav',
  'indikacije',
  'kontraindikacije',
  'doziranje',
  'dozacija',
  'način primjene',
  'uputstvo',
  'djelovanje',
  'prednosti',
  'pakovanje',
  'karenca',
  'nuspojave',
  'čuvanje',
  'rok trajanja',
  'napomena',
  'aktivna supstanca',
  'ciljne vrste',
  'upozorenje',
]);

function isHeading(trimmedLine: string): boolean {
  if (trimmedLine.length === 0 || trimmedLine.length > 40) return false;
  if (trimmedLine.endsWith('.')) return false;
  const normalized = trimmedLine.replace(/[:–]\s*$/, '').trim().toLowerCase();
  return KNOWN_HEADINGS.has(normalized);
}

function headingText(trimmedLine: string): string {
  return trimmedLine.replace(/[:–]\s*$/, '').trim();
}

export function parseDescription(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', lines: paragraphLines });
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  for (const rawLine of text.split('\n')) {
    const trimmed = rawLine.trim();

    if (trimmed.length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      flushParagraph();
      listItems.push(trimmed.slice(2).trim());
      continue;
    }

    flushList();

    if (isHeading(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'heading', text: headingText(trimmed) });
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}
