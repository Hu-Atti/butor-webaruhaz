export interface User {
  id: string;
  email: string;
  name: {
    firstname: string;
    lastname: string;
  }
  address: string;
  isAdmin: boolean;
  orderIds: string[];
}