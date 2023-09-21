import { useAuthStore } from '@/store/authentication'

export function requestInterceptor(options: any) {
  const authStore = useAuthStore()
  let headers = options.headers ? { ...options.headers } : {}

  if (authStore.access_token) {
    headers['Authorization'] = `Bearer ${authStore.access_token}`
  }

  let body: string | undefined = undefined
  if (options.body !== undefined) {
    body =
      typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
  }
  // TODO: Test the order here to make sure we're not overriding
  return {
    ...options,
    headers: headers,
    body: body,
  }
}
