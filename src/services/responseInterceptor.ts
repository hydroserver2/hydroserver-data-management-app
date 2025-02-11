import { ApiError } from '@/types'

export async function responseInterceptor(response: Response): Promise<any> {
  if (response.headers.get('Content-Length') === '0') return null
  const contentType = response.headers.get('content-type') || ''

  let parsedBody: any = null
  if (contentType.includes('application/json')) {
    try {
      parsedBody = await response.json()
    } catch (err) {
      console.error('Failed to parse error JSON:', err)
    }
  } else if (contentType.includes('text/csv')) {
    try {
      parsedBody = await response.blob()
    } catch (err) {
      console.error('Failed to parse error JSON:', err)
    }
  }

  // Django AllAuth doesn't consider 401 responses errors but rather an
  // message to put the caller in an unauthenticated flow state.
  // Pass the response to the calling component to handle the returned AllAuth flows.
  if (response.ok || response.status === 401) return parsedBody

  const apiError: ApiError = {
    status: response.status,
    message:
      parsedBody?.detail ||
      parsedBody?.error ||
      JSON.stringify(parsedBody) ||
      'Unknown Error',
  }

  console.error('API response not OK:', apiError.message)
  throw apiError
}
