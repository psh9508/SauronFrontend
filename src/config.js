// API 설정
const config = {
  api: {
    host: import.meta.env.VITE_API_HOST || 'localhost',
    port: import.meta.env.VITE_API_PORT || '8002',
  },
  get apiBaseUrl() {
    if (import.meta.env.DEV) {
      return '/api'
    }

    return `http://${this.api.host}:${this.api.port}`
  }
}

export default config
