import { useUserStore } from '@/store/user'

export async function parseResponseBody(response: Response) {
  try {
    if (response.headers.get('Content-Length') === '0') return null

    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json'))
        return await response.json()
      else if (contentType?.includes('text/csv')) return await response.blob()
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return null
  }
  if (!response.ok) {
    const errorBody = await response.json()
    console.error('API Response Not OK:', errorBody)
    throw new Error(`${response.status}`)
  }
}

export async function responseInterceptor(
  response: Response,
  options: any
): Promise<any> {
  if (response.status === 401 && !options._retry) {
    const { logout } = useUserStore()
    logout()
  }
  return parseResponseBody(response)
}
