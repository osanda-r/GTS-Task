import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from '@/plugins/firebase'
import router from '@/router'
import type { User } from 'firebase/auth'
import type { Ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Custom hook to manage authentication
export default function useAuth() {
  const user: Ref<User | null> = ref(null)
  const token: Ref<string | null> = ref(null)
  let unsubscribeAuth: (() => void) | null = null

  const setUser = async (firebaseUser: User) => {
    user.value = firebaseUser
    try {
      token.value = await firebaseUser.getIdToken()
    } catch (error) {
      console.error('Token Error:', error)
      token.value = null
    }
  }

  const refreshToken = async () => {
    try {
      if (auth.currentUser) {
        const refreshedToken = await auth.currentUser.getIdToken(true)
        token.value = refreshedToken
      } else {
        console.error('No current user to refresh token.')
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
    }
  }

  const logout = async () => {
    await auth.signOut()
    user.value = null
    token.value = null
    await router.push({ name: 'Login' })
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      setUser(result.user)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: message }
    }
  }

  const handleAuthStateChanged = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      await setUser(firebaseUser)
    } else {
      user.value = null
      token.value = null
    }
  }

  onMounted(() => {
    unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      void handleAuthStateChanged(firebaseUser)
    })
  })

  onUnmounted(() => {
    unsubscribeAuth?.()
    unsubscribeAuth = null
  })

  return {
    user,
    token,
    refreshToken,
    logout,
    login,
  }
}
