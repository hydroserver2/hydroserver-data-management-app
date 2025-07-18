import { requestInterceptor } from '@/services/requestInterceptor'
import { responseInterceptor } from '@/services/responseInterceptor'
import { Snackbar } from '@/utils/notifications'
import { createPatchObject } from '@/services/createPatchObject'
import pLimit from 'p-limit'

const limit = pLimit(10)
const DEFAULT_PAGE_SIZE = 1000

async function interceptedFetch(endpoint: string, options: any) {
  const opts = requestInterceptor(options)
  try {
    const response = await fetch(endpoint, opts)
    return await responseInterceptor(response)
  } catch (error: any) {
    if (error instanceof TypeError)
      Snackbar.error('Network error. Please check your connection.')
    throw error
  }
}

export const apiMethods = {
  async fetch(endpoint: string, options: any = {}): Promise<any> {
    options.method = 'GET'
    return await limit(() => interceptedFetch(endpoint, options))
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
    return await limit(() => interceptedFetch(endpoint, options))
  },
  async post(
    endpoint: string,
    body: any = undefined,
    options: any = {}
  ): Promise<any> {
    options.method = 'POST'
    options.body = body
    return await limit(() => interceptedFetch(endpoint, options))
  },
  async put(
    endpoint: string,
    body: any = undefined,
    options: any = {}
  ): Promise<any> {
    options.method = 'PUT'
    options.body = body
    return await limit(() => interceptedFetch(endpoint, options))
  },
  async delete(
    endpoint: string,
    body: any = undefined,
    options: any = {}
  ): Promise<any> {
    options.method = 'DELETE'
    options.body = body
    return await limit(() => interceptedFetch(endpoint, options))
  },

  async paginatedFetch<T>(base: string, pageSize?: number): Promise<any> {
    const size = pageSize ?? DEFAULT_PAGE_SIZE
    const sep = base.includes('?') ? '&' : '?'
    const url = `${base}${sep}page_size=${size}&page=1`

    const opts = requestInterceptor({ method: 'GET' })
    const response = await limit(() => fetch(url, opts))
    const totalPages = Number(response.headers.get('x-total-pages')) || 1
    const firstData = await responseInterceptor(response)

    const all = [...firstData]
    for (let p = 2; p <= totalPages; p++) {
      const url = `${base}${sep}page_size=${size}&page=${p}`
      const data = await limit(() => interceptedFetch(url, { method: 'GET' }))
      all.push(...data)
    }

    return all
  },
}
