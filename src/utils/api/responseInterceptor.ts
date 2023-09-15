import { useAuthStore } from '@/store/authentication'
import { baseUrl } from './baseUrl'
import { sendToast } from './notifications'

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token = '') => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

export async function responseInterceptor(
  response: Response,
  method: Function,
  endpoint: string,
  options: any
): Promise<any> {
  if (response.status === 401 && !options._retry) {
    return await handle401(method, endpoint, options)
  } else if (response.ok) {
    sendToast(response, endpoint)
    return await response.json()
  } else {
    sendToast(response, endpoint, true)
    throw new Error('API call failed')
  }
}

async function handle401(method: Function, endpoint: string, options: any) {
  options._retry = true

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
      .then((token) => {
        options.headers['Authorization'] = `Bearer ${token}`
        return method(endpoint, options)
      })
      .catch((err) => Promise.reject(err))
  }

  isRefreshing = true
  const success = await refreshAccessToken()
  isRefreshing = false

  if (success) {
    const authStore = useAuthStore()
    processQueue(null, authStore.access_token)
    options.headers['Authorization'] = `Bearer ${authStore.access_token}`
    return method(endpoint, options)
  } else {
    processQueue(new Error('SessionExpired'))
    console.log('Session Expired. Logging out')
    await useAuthStore().logout()
    throw new Error('SessionExpired')
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
    console.log('access token successfully refreshed')
    const data = await response.json()
    authStore.access_token = data.access
    authStore.refresh_token = data.refresh
    return true
  } else {
    return false
  }
}
