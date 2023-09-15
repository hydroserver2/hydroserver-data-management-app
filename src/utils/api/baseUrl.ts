export const baseUrl = `${
  import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:8000'
    : import.meta.env.VITE_APP_PROXY_BASE_URL
}/api`
