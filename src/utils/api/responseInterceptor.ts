import { handle401 } from '@/utils/api/handle401'
import { toastHandler } from '@/utils/api/toastHandler'

export async function responseInterceptor(
  response: Response,
  method: Function,
  endpoint: string,
  options: any
): Promise<any> {
  if (response.status === 401 && !options._retry) {
    return await handle401(method, endpoint, options)
  } else if (response.status === 204) {
    toastHandler(response, endpoint, options.method)
    return null
  } else if (response.ok) {
    toastHandler(response, endpoint, options.method)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else if (contentType && contentType.includes('text/csv')) {
      return await response.blob()
    } else {
      throw new Error('Unknown response type')
    }
  } else {
    toastHandler(response, endpoint, options.method)
    throw new Error('API call failed')
  }
}
