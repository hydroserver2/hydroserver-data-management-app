import { useAuthStore } from '@/store/authentication'

export function requestInterceptor(options: any) {
  const authStore = useAuthStore()
  let headers = options.headers ? { ...options.headers } : {}

  if (authStore.access_token) {
    headers['Authorization'] = `Bearer ${authStore.access_token}`
  }

  return {
    ...options,
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }
}
