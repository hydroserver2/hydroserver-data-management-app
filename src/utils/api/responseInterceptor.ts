import { handle401 } from '@/utils/api/handle401'
import { sendToast } from './notifications'

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
