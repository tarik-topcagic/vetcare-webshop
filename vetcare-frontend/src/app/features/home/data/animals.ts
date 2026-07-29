export interface Animal {
  name: string;
  slug: string;
  /** Root-relative path served from /public. PLACEHOLDER art for now (see public/animals/README.md) - swap for real photos later. */
  image: string;
}

export const ANIMALS: Animal[] = [
  { name: 'Pas', slug: 'psi', image: 'animals/pas.webp' },
  { name: 'Mačka', slug: 'macke', image: 'animals/macka.webp' },
  { name: 'Krava', slug: 'krave', image: 'animals/krava.webp' },
  { name: 'Konj', slug: 'konji', image: 'animals/konj.webp' },
  { name: 'Ovca', slug: 'ovce', image: 'animals/ovca.webp' },
  { name: 'Koza', slug: 'koze', image: 'animals/koza.webp' },
  { name: 'Peradarstvo', slug: 'peradarstvo', image: 'animals/peradarstvo.webp' },
];
