import { useUserStore } from '@/store/user'
import router from '@/router/router'

export async function responseInterceptor(
  response: Response,
  options: any
): Promise<any> {
  if (response.headers.get('Content-Length') === '0') return null
  const contentType = response.headers.get('content-type') || ''

  if (response.ok) {
    if (contentType?.includes('application/json')) return await response.json()
    else if (contentType?.includes('text/csv')) return await response.blob()
  }

  let errorBody: any = null
  if (contentType.includes('application/json')) {
    try {
      errorBody = await response.json()
    } catch (err) {
      console.error('Failed to parse error JSON:', err)
    }
  }

  if (response.status === 401) {
    if (options.method === 'DELETE' && response.url?.endsWith('session')) {
      // Ignore the case where an already logged out user tries to logout.
      // This prevents an infinite logout/401 response loop.
      console.error('User tried to logout when they were already logged out.')
      return
    }

    const flows = errorBody?.data.flows || []
    console.log('errorBody', errorBody)
    console.log('flows', flows)

    const hasVerifyEmail = flows.some((f: any) => f?.id === 'verify_email')

    if (hasVerifyEmail) {
      // User must confirm email
      console.info('User created. Redirecting to verify email page...')
      await router.push({ name: 'VerifyEmail' })
      return errorBody
    }

    // Session expired
    const { logout } = useUserStore()
    logout()
  }

  console.error('API Response Not OK:', errorBody)
  throw new Error(`${response.status}`)
}
