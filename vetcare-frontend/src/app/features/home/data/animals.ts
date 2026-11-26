export interface Animal {
  name: string;
  slug: string;
  image: string;
  image2x: string;
}

export const ANIMALS: Animal[] = [
  { name: 'Pas', slug: 'psi', image: 'animals/pas-1x.webp', image2x: 'animals/pas-2x.webp' },
  { name: 'Mačka', slug: 'macke', image: 'animals/macka-1x.webp', image2x: 'animals/macka-2x.webp' },
  { name: 'Krava', slug: 'krave', image: 'animals/krava-1x.webp', image2x: 'animals/krava-2x.webp' },
  { name: 'Konj', slug: 'konji', image: 'animals/konj-1x.webp', image2x: 'animals/konj-2x.webp' },
  { name: 'Ovca', slug: 'ovce', image: 'animals/ovca-1x.webp', image2x: 'animals/ovca-2x.webp' },
  { name: 'Koza', slug: 'koze', image: 'animals/koza-1x.webp', image2x: 'animals/koza-2x.webp' },
  { name: 'Peradarstvo', slug: 'peradarstvo', image: 'animals/peradarstvo-1x.webp', image2x: 'animals/peradarstvo-2x.webp' },
];
