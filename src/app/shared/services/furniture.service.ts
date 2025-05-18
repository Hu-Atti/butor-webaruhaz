import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, limit, orderBy, query, QueryConstraint, updateDoc, where } from '@angular/fire/firestore';
import { Furniture } from '../../models/furniture.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FurnitureService {
private readonly COLLECTION_NAME = 'Furnitures';

  constructor(private firestore: Firestore) {}

  async addFurniture(furniture: Omit<Furniture, 'id'>): Promise<Furniture> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const docRef = await addDoc(collectionRef, furniture);
    await updateDoc(docRef, { id: docRef.id });
    return { ...furniture, id: docRef.id };
  }
  getAllFurniture(): Observable<Furniture[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<Furniture[]>;
  }

  async getFurnitureById(id: string): Promise<Furniture | null> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as Furniture;
  }

  async updateFurniture(id: string, data: Partial<Furniture>): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    return updateDoc(docRef, data);
  }
  
  async deleteFurniture(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    return deleteDoc(docRef);
  }

  async decreaseFurnitureQuantity(id: string, amount: number): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const furniture = await this.getFurnitureById(id);
    if (!furniture) throw new Error('Bútor nem található');
    
    const newQuantity = furniture.quantity - amount;
    if (newQuantity < 0) throw new Error('Nincs elég készlet');
    
    return updateDoc(docRef, { quantity: newQuantity });
  }

  
  async increaseFurnitureQuantity(id: string, amount: number): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const furniture = await this.getFurnitureById(id);
    if (!furniture) throw new Error('Bútor nem található');
    
    const newQuantity = furniture.quantity + amount;
    return updateDoc(docRef, { quantity: newQuantity });
  }

  async getFilteredFurniture(
    categoryId?: string,
    sortBy: 'name' | 'price' = 'name',
    sortDirection: 'asc' | 'desc' = 'asc'
  ): Promise<Furniture[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const constraints: QueryConstraint[] = [];

    if (categoryId) {
      constraints.push(where('categoryId', '==', categoryId));
    }

    constraints.push(orderBy(sortBy, sortDirection));
    
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Furniture));
  }

  async getLowStockFurnitures(limitCount: number = 3): Promise<Furniture[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(
      collectionRef,
      where('quantity', '>', 0), 
      orderBy('quantity', 'asc'), 
      limit(limitCount)           
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Furniture));
  }
}
