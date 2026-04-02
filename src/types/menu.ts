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
  zoneId?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}
