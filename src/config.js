// API 설정
const config = {
  get apiBaseUrl() {
    // 환경변수가 있으면 우선 사용
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL
    }

    // 로컬 개발 시 프록시 사용
    if (import.meta.env.DEV) {
      return '/api'
    }

    return ''
  }
}

export default config
