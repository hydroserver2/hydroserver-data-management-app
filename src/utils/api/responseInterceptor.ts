import { handle401 } from '@/utils/api/handle401'
import { toastHandler } from '@/utils/api/toastHandler'

export async function responseInterceptor(
  response: Response,
  method: Function,
  endpoint: string,
  options: any
): Promise<any> {
  if (response.status === 401 && !options._retry) {
    const clonedResponse = response.clone()
    const jsonResponse = await clonedResponse.json()
    if (
      jsonResponse.detail ===
      'No active account found with the given credentials'
    ) {
      toastHandler(response, endpoint, options.method)
      throw new Error('Invalid Credentials')
    } else {
      return await handle401(method, endpoint, options)
    }
  } else {
    toastHandler(response, endpoint, options.method)
    if (response.status === 204) {
      return null
    } else if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else if (contentType && contentType.includes('text/csv')) {
        return await response.blob()
      } else {
        throw new Error('Unknown response type')
      }
    } else {
      throw new Error('API call failed')
    }
  }
}
