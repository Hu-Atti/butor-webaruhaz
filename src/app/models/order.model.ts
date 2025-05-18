export interface Order {
  id: string;
  userId: string;
  furnitureIds: string[];
  quantitys: number[];
  total: number;
  confirmed: boolean;
  date: Date; 
}

export interface CartItem {
  furnitureId: string;
  quantity: number;
  price: number;
}
