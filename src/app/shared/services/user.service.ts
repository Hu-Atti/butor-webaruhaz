import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { from, Observable, of, switchMap } from 'rxjs';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }


  getUserWithOrders(): Observable<{ user: User | null; orders: Order[] }> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of({ user: null, orders: [] });
        }
        return from(this.fetchUserAndOrders(authUser.uid));
      })
    );
  }

  private async fetchUserAndOrders(userId: string): Promise<{ user: User | null; orders: Order[] }> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        return { user: null, orders: [] };
      }
      const userData = userSnap.data() as User;
      const user: User = { ...userData, id: userId };

      if (!user.orderIds || user.orderIds.length === 0) {
        return { user, orders: [] };
      }

      const chunkSize = 10;
      const orders: Order[] = [];
      for (let i = 0; i < user.orderIds.length; i += chunkSize) {
        const chunk = user.orderIds.slice(i, i + chunkSize);
        const ordersCol = collection(this.firestore, 'Orders');
        const q = query(ordersCol, where('id', 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
          const orderData = doc.data() as any;
          orders.push({ 
            ...orderData,
            id: doc.id,
            date: orderData.date.toDate()
          });
        });
      }

      return { user, orders };
    } catch (error) {
      console.error('Hiba a felhasználó és rendelések lekérésekor:', error);
      return { user: null, orders: [] };
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    const userDocRef = doc(this.firestore, 'Users', userId);
    await updateDoc(userDocRef, data);
  }

  async addOrderToUser(userId: string, orderId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'Users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) throw new Error('User not found');

    const userData = userSnap.data() as User;
    const updatedOrderIds = userData.orderIds ? [...userData.orderIds, orderId] : [orderId];
    await updateDoc(userDocRef, { orderIds: updatedOrderIds });
  }

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const orderDocRef = doc(this.firestore, 'Orders', orderId);
    await deleteDoc(orderDocRef);

    const userDocRef = doc(this.firestore, 'Users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;
    const updatedOrderIds = (userData.orderIds || []).filter(id => id !== orderId);
    await updateDoc(userDocRef, { orderIds: updatedOrderIds });
  }

  async deleteUser(userId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'Users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;

    if (userData.orderIds?.length > 0) {
      for (const orderId of userData.orderIds) {
        const orderDocRef = doc(this.firestore, 'Orders', orderId);
        await deleteDoc(orderDocRef);
      }
    }

    await deleteDoc(userDocRef);
    
    await this.authService.deleteUser();
  }
}
