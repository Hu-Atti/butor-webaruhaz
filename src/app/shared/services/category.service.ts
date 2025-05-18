import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly COLLECTION_NAME = 'Categories';

  constructor(private firestore: Firestore) {}

  getAllCategories(): Observable<Category[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<Category[]>;
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const collectionRef = collection(this.firestore, this.COLLECTION_NAME);
    const docRef = await addDoc(collectionRef, category);
    await updateDoc(docRef, { id: docRef.id });
    return { ...category, id: docRef.id };
  }

  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
    return deleteDoc(docRef);
  }
}
