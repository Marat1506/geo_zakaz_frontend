export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  readyNow: boolean;
  preparationTime: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}
