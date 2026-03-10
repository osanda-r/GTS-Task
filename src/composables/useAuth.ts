import { ref, onMounted } from 'vue'
import { auth } from '@/plugins/firebase'
import router from '@/router'
import type { User } from 'firebase/auth'
import type { Ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Custom hook to manage authentication
export default function useAuth() {
  const user: Ref<User | null> = ref(null)
  const token: Ref<string | null> = ref(null)

  const setUser = (firebaseUser: User) => {
    user.value = firebaseUser
    firebaseUser
      .getIdToken(true) // Force refresh the token to get a fresh one
      .then((idToken) => {
        token.value = idToken
        localStorage.setItem('firebaseToken', idToken) // Save token in localStorage
      })
      .catch((error) => console.error('Token Error: ', error))
  }

  const refreshToken = async () => {
    try {
      if (auth.currentUser) {
        const refreshedToken = await auth.currentUser.getIdToken(true)
        token.value = refreshedToken
        localStorage.setItem('firebaseToken', refreshedToken)
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
    localStorage.removeItem('firebaseToken')
    await router.push({ name: 'Login' }) // Redirect to Login
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

  const handleAuthStateChanged = (firebaseUser: User | null) => {
    if (firebaseUser) {
      setUser(firebaseUser)
    } else {
      user.value = null
      token.value = null
      localStorage.removeItem('firebaseToken')
    }
  }

  onMounted(() => {
    // Listen for user authentication state changes
    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChanged)

    // Clean up the subscription on component unmount
    return () => unsubscribe()
  })

  return {
    user,
    token,
    refreshToken,
    logout,
    login,
  }
}
