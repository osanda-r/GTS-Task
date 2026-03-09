import { doc, getDoc, runTransaction } from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export const getNextGRN = async (): Promise<string> => {
  const counterRef = doc(db, 'counters', 'goodsReceived')

  const newCount = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef)

    let currentCount = 0
    if (counterDoc.exists()) {
      currentCount = counterDoc.data().count || 0
    }

    const nextCount = currentCount + 1
    transaction.set(counterRef, { count: nextCount })

    return nextCount
  })

  return `GR-${String(newCount).padStart(5, '0')}`
}

export const initializeGRNCounter = async (): Promise<void> => {
  const counterRef = doc(db, 'counters', 'goodsReceived')
  const counterDoc = await getDoc(counterRef)

  if (!counterDoc.exists()) {
    await runTransaction(db, async (transaction) => {
      transaction.set(counterRef, { count: 0 })
    })
  }
}
