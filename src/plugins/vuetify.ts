

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Composable
import { createVuetify } from 'vuetify'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#239D60',
          'on-primary': '#F7F39A',
          secondary: '#F7F39A',
          surface: '#FFFFFF',
          background: '#FFFFFF',
          error: '#ff2306ff',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#e5e8e3ff',
          secondary: '#ffffffff',
          surface: '#000000ff',
          background: '#a0ad6cff',
          error: '#ce2626ff',
        },
      },
    },
  },
  defaults: {
    // Text input
    VTextField: {
      class: 'cf-input narrow-input',
      variant: 'outlined',
      density: 'comfortable',
      bgColor: '#FFFFFF',
      hideDetails: 'auto',
    },
    // Multiline
    VTextarea: {
      class: 'cf-input narrow-input',
      variant: 'outlined',
      density: 'comfortable',
      bgColor: '#FFFFFF',
      hideDetails: 'auto',
    },
    // Selects
    VSelect: {
      class: 'cf-input narrow-input',
      variant: 'outlined',
      density: 'comfortable',
      bgColor: '#FFFFFF',
      hideDetails: 'auto',
    },
    // Autocomplete
    VAutocomplete: {
      class: 'cf-input narrow-input',
      variant: 'outlined',
      density: 'comfortable',
      bgColor: '#FFFFFF',
      hideDetails: 'auto',
    },
    // Combobox
    VCombobox: {
      class: 'cf-input narrow-input',
      variant: 'outlined',
      density: 'comfortable',
      bgColor: '#FFFFFF',
      hideDetails: 'auto',
    },
    // Buttons (so Submit/Cancel match the same width)
    VBtn: {
      class: 'narrow-input',
      color: 'primary',
      variant: 'elevated',
    },
  },
})
