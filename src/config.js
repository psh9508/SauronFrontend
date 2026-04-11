// API 설정
const config = {
  get apiBaseUrl() {
    if (import.meta.env.DEV) {
      return '/api'
    }

    return import.meta.env.VITE_API_BASE_URL
  }
}

export default config
