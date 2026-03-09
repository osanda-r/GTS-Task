import { ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import type { Ref } from 'vue'

export interface UserProfile {
  uid: string
  name: string
  email: string
  role: string
  status: string
  createdAt?: unknown
}

export default function useUserRole() {
  const userRole: Ref<string | null> = ref(null)
  const userProfile: Ref<UserProfile | null> = ref(null)
  const loading: Ref<boolean> = ref(false)

  const fetchUserRole = async (uid: string): Promise<string | null> => {
    loading.value = true
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile
        userRole.value = data.role
        userProfile.value = data
        return data.role
      }
      return null
    } catch (error) {
      console.error('Error fetching user role:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const hasRole = (requiredRoles: string[]): boolean => {
    if (!userRole.value) return false
    return requiredRoles.includes(userRole.value)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return hasRole(roles)
  }

  const isAdministrator = (): boolean => {
    return userRole.value?.toLowerCase() === 'administrator'
  }

  const clearRole = () => {
    userRole.value = null
    userProfile.value = null
  }

  return {
    userRole,
    userProfile,
    loading,
    fetchUserRole,
    hasRole,
    hasAnyRole,
    isAdministrator,
    clearRole,
  }
}
