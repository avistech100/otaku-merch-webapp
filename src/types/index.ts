export interface Creator {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  bio: string;
  followers: number;
  socials: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export type Category = 'Crypto Brands' | 'Anime Series' | 'Limited Edition' | 'Creator Spotlight';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  category: Category;
  creatorId: string;
  creatorName: string;
  creatorBadge: string;
  sizes: string[];
  colors?: { name: string; hex: string }[];
  isLimited: boolean;
  hypeLevel: 'Low' | 'Medium' | 'High' | 'Legendary';
  chain?: 'Ethereum' | 'Solana' | 'Polygon';
  anime?: string;
  reviews: Review[];
  details: {
    materials: string;
    designStory: string;
  };
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedColor?: { name: string; hex: string };
  quantity: number;
}
