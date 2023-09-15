import { requestInterceptor } from '@/utils/api/requestInterceptor'
import { responseInterceptor } from '@/utils/api/responseInterceptor'
import { baseUrl } from '@/utils/api/baseUrl'
import { sendToast } from '@/utils/api/notifications'
import { createPatchObject } from '@/utils/api/createPatchObject'

async function interceptedFetch(
  endpoint: string,
  options: any,
  method: Function
) {
  const opts = requestInterceptor(options)

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, opts)
    return await responseInterceptor(response, method, endpoint, opts)
  } catch (error: any) {
    if (error instanceof TypeError) sendToast(error, endpoint, true)
    return null
  }
}

export const api = {
  async fetch(endpoint: string, options: any = {}): Promise<any> {
    options.method = 'GET'
    return await interceptedFetch(endpoint, options, this.fetch.bind(this))
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
    return await interceptedFetch(endpoint, options, this.patch.bind(this))
  },
  async post(endpoint: string, body: any, options: any = {}): Promise<any> {
    options.method = 'POST'
    options.body = body
    return await interceptedFetch(endpoint, options, this.post.bind(this))
  },
  async delete(endpoint: string, options: any = {}): Promise<any> {
    options.method = 'DELETE'
    return await interceptedFetch(endpoint, options, this.delete.bind(this))
  },
}
