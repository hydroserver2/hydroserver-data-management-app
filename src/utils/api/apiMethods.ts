import { requestInterceptor } from '@/utils/api/requestInterceptor'
import { responseInterceptor } from '@/utils/api/responseInterceptor'
import { toastHandler } from '@/utils/api/toastHandler'
import { createPatchObject } from '@/utils/api/createPatchObject'
import { useAuthStore } from '@/store/authentication'

async function interceptedFetch(endpoint: string, options: any) {
  const authStore = useAuthStore()
  const opts = requestInterceptor(options, authStore.accessToken)
  try {
    const response = await fetch(endpoint, opts)
    return await responseInterceptor(response, interceptedFetch, endpoint, opts)
  } catch (error: any) {
    if (error instanceof TypeError)
      toastHandler(error, endpoint, options.method)
    throw error
  }
}

export const api = {
  async fetch(endpoint: string, options: any = {}): Promise<any> {
    options.method = 'GET'
    return await interceptedFetch(endpoint, options)
  },
  async patch(
    endpoint: string,
    body: any,
    originalBody: any = null,
    options: any = {}
  ): Promise<any> {
    options.method = 'PATCH'
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
    options.body = body
    return await interceptedFetch(endpoint, options)
  },
  async delete(endpoint: string, options: any = {}): Promise<any> {
    options.method = 'DELETE'
    return await interceptedFetch(endpoint, options)
  },
}
