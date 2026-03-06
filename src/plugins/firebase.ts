import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA9SowGSw_n2FzrhgmRSQr43rAzYKb04Z0',
  authDomain: 'gts-task-c0ed1.firebaseapp.com',
  projectId: 'gts-task-c0ed1',
  storageBucket: 'gts-task-c0ed1.firebasestorage.app',
  messagingSenderId: '658085115229',
  appId: '1:658085115229:web:f097d1f1f49adfa5b7e4b4',
  measurementId: 'G-Q1BHQVE8WP',
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'

export const analyticsPromise: Promise<Analytics | null> =
  analyticsEnabled && typeof window !== 'undefined'
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
        .catch(() => null)
    : Promise.resolve(null)
