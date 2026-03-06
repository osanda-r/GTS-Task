import { ref } from 'vue'

export const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
})

export function showSnackbar(message: string, color: string = 'success') {
  snackbar.value.text = message
  snackbar.value.color = color
  snackbar.value.show = true
}
