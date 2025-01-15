import { requestInterceptor } from '@/services/requestInterceptor'
import { responseInterceptor } from '@/services/responseInterceptor'
import { Snackbar } from '@/utils/notifications'
import { createPatchObject } from '@/services/createPatchObject'
import { useAuthStore } from '@/store/authentication'

async function interceptedFetch(endpoint: string, options: any) {
  const authStore = useAuthStore()
  const opts = requestInterceptor(options, authStore.accessToken)
  try {
    const response = await fetch(endpoint, opts)
    return await responseInterceptor(response, interceptedFetch, endpoint, opts)
  } catch (error: any) {
    if (error instanceof TypeError)
      Snackbar.error('Network error. Please check your connection.')
    throw error
  }
}

export const apiMethods = {
  async fetch(endpoint: string, options: any = {}): Promise<any> {
    options.method = 'GET'
    options.credentials = 'include'
    return await interceptedFetch(endpoint, options)
  },
  async patch(
    endpoint: string,
    body: any,
    originalBody: any = null,
    options: any = {}
  ): Promise<any> {
    options.method = 'PATCH'
    options.credentials = 'include'
    options.body = originalBody ? createPatchObject(originalBody, body) : body
    if (Object.keys(options.body).length === 0) return
    return await interceptedFetch(endpoint, options)
  },
  async post(
    endpoint: string,
    body: any = undefined,
    options: any = {}
  ): Promise<any> {
    options.method = 'POST'
    options.credentials = 'include'
    options.body = body
    return await interceptedFetch(endpoint, options)
  },
  async delete(endpoint: string, options: any = {}): Promise<any> {
    options.method = 'DELETE'
    options.credentials = 'include'
    return await interceptedFetch(endpoint, options)
  },
}
