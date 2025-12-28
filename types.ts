
export interface Category {
  id: string;
  name: string;
  subItems: string[];
  description: string;
  color: string;
}

export interface Restaurant {
  id: string;
  name: string;
  categoryId: string;
  rating: number;
  priceLevel: number; // 1-3 ($ to $$$)
  cpValue: number; // 1-10
  address: string;
  reviews: Review[];
  imageUrl: string;
}

export interface Review {
  userName: string;
  comment: string;
  rating: number;
}

export type Screen = 'HOME' | 'RESULT' | 'RANKING';
