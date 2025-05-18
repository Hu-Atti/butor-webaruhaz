import { Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Order } from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
 private readonly COLLECTION_NAME = 'Orders';

  constructor(private firestore: Firestore) {}

  async addOrder(order: Omit<Order, 'id' | 'date'>): Promise<Order> {
    const orderWithDate = {
      ...order,
      date: new Date()
    };
    
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const docRef = await addDoc(collectionRef, orderWithDate);
    await updateDoc(docRef, { id: docRef.id });
    return { ...orderWithDate, id: docRef.id };
  }

  public async getOrderById(id: string): Promise<Order | null> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { 
      ...docSnap.data() as any,
      date: (docSnap.data() as any).date.toDate() 
    } : null;
  }

  async getAllOrders(): Promise<Order[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({
      ...doc.data() as any,
      id: doc.id,
      date: (doc.data() as any).date.toDate()
    }));
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    return updateDoc(docRef, data);
  }

  async deleteOrder(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    return deleteDoc(docRef);
  }

  async getUnconfirmedOrder(userId: string): Promise<Order | null> {
    const ordersCol = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(
      ordersCol, 
      where('userId', '==', userId),
      where('confirmed', '==', false)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    return { 
        ...(snapshot.docs[0].data() as any),
        id: snapshot.docs[0].id,
        date: (snapshot.docs[0].data() as any).date.toDate()
      };
  }
}
