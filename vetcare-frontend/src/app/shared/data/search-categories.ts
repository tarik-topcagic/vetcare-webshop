import { ANIMALS } from '../../features/home/data/animals';
import { normalizeSearchText } from '../utils/normalize-search-text';

export interface CategorySuggestion {
  label: string;
  slug: string;
  subtitle: string;
  image: string | null;
  normalizedLabel: string;
}

const SUBTITLES: Record<string, string> = {
  psi: 'Proizvodi za pse',
  macke: 'Proizvodi za mačke',
  krave: 'Proizvodi za krave',
  konji: 'Proizvodi za konje',
  ovce: 'Proizvodi za ovce',
  koze: 'Proizvodi za koze',
  peradarstvo: 'Proizvodi za perad',
  'kreme-gelovi': 'Sve iz kategorije Kreme/Gelovi',
  dezinficijensi: 'Sve iz kategorije Dezinficijensi',
  ostalo: 'Sve iz kategorije Ostalo',
};

const LABELS: { label: string; slug: string }[] = [
  { label: 'Pas', slug: 'psi' },
  { label: 'Mačka', slug: 'macke' },
  { label: 'Krava', slug: 'krave' },
  { label: 'Konj', slug: 'konji' },
  { label: 'Ovca', slug: 'ovce' },
  { label: 'Koza', slug: 'koze' },
  { label: 'Peradarstvo', slug: 'peradarstvo' },
  { label: 'Kreme/Gelovi', slug: 'kreme-gelovi' },
  { label: 'Dezinficijensi', slug: 'dezinficijensi' },
  { label: 'Ostalo', slug: 'ostalo' },
];

export const CATEGORY_SUGGESTIONS: CategorySuggestion[] = LABELS.map(({ label, slug }) => ({
  label,
  slug,
  subtitle: SUBTITLES[slug],
  image: ANIMALS.find((a) => a.slug === slug)?.image ?? null,
  normalizedLabel: normalizeSearchText(label),
}));

export function matchCategories(query: string): CategorySuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  return CATEGORY_SUGGESTIONS.filter((c) => c.normalizedLabel.startsWith(normalizedQuery));
}
