import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "butor-webaruhaz", appId: "1:513690915809:web:7c08af28e56653de0ef8a0", storageBucket: "butor-webaruhaz.firebasestorage.app", apiKey: "AIzaSyDx_EASKYEw71-7NUa-WHk4ft8SwYYTDxQ", authDomain: "butor-webaruhaz.firebaseapp.com", messagingSenderId: "513690915809" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
