export interface Category {
  label: string;
  /** Empty string means "no filter" (links to /proizvodi with no query param). */
  slug: string;
}

// Hardcoded for now - will be replaced by a call to the category API once
// the backend catalog work starts.
export const CATEGORIES: Category[] = [
  { label: 'Svi proizvodi', slug: '' },
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
  { label: 'Akcije', slug: 'akcije' },
];

export function categoryHref(slug: string): string {
  return slug ? `/proizvodi?category=${slug}` : '/proizvodi';
}
