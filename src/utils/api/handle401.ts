import { useAuthStore } from '@/store/authentication'
import { baseUrl } from './baseUrl'

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve()
  })
  failedQueue = []
}

export async function handle401(
  method: Function,
  endpoint: string,
  options: any
) {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
      .then(() => method(endpoint, options))
      .catch((err) => Promise.reject(err))
  }

  options._retry = true
  isRefreshing = true

  const authStore = useAuthStore()
  try {
    await refreshAccessToken()
    processQueue(null)
    return method(endpoint, options)
  } catch (error) {
    processQueue(error)
    console.log('Session Expired. Logging out')
    await authStore.logout()
    return Promise.reject(error)
  } finally {
    isRefreshing = false
  }
}

async function refreshAccessToken() {
  const authStore = useAuthStore()
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: authStore.refresh_token,
    }),
  }
  const response = await fetch(`${baseUrl}/account/jwt/refresh`, options)

  if (response.ok) {
    const data = await response.json()
    authStore.access_token = data.access
    authStore.refresh_token = data.refresh
    console.log('access token successfully refreshed')
  } else {
    throw new Error('Session Expired')
  }
}
