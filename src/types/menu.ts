export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  available: boolean;
  readyNow: boolean;
  preparationTime: number;
  zoneId?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}
