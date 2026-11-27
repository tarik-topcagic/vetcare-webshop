export interface SuggestionRow {
  kind: 'history' | 'category' | 'product';
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string | null;
  icon?: boolean;
  routerLink?: string[];
  queryParams?: Record<string, string>;
}
