import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAAVaV2IYz1CDmZJljGdvJJa0jJ6BbA-KU',
  authDomain: 'product-management-7f286.firebaseapp.com',
  projectId: 'product-management-7f286',
  storageBucket: 'product-management-7f286.firebasestorage.app',
  messagingSenderId: '35222488166',
  appId: '1:35222488166:web:f0e937bf0f2faab41bd9a7',
  measurementId: 'G-08SKB4HTFB',
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const authReady: Promise<void> = new Promise((resolve) => {
  const unsubscribe = auth.onAuthStateChanged(() => {
    unsubscribe()
    resolve()
  })
})

const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'

export const analyticsPromise: Promise<Analytics | null> =
  analyticsEnabled && typeof window !== 'undefined'
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
        .catch(() => null)
    : Promise.resolve(null)
