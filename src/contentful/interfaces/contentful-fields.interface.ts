export interface ContentfulProductFields {
  name?: string;
  title?: string;
  category?: string;
  categories?: string[];
  price?: number;
  [key: string]: unknown;
}
