export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}
