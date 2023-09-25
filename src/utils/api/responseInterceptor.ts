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
  } else if (response.ok) {
    toastHandler(response, endpoint, options.method)
    return await response.json()
  } else {
    toastHandler(response, endpoint, options.method)
    throw new Error('API call failed')
  }
}
