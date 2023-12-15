import { THINGS_BASE, USER_BASE, ACCOUNT_BASE } from '@/services/api'
import { Snackbar } from '@/utils/notifications'

export function toastHandler(response: any, endpoint: string, method: string) {
  const status = response.status
  if (!status) return
  const type = getType(status)
  const message = getMessage(method, status, endpoint)
  if (message) Snackbar.warn(message)
}

function getType(status: number): 'success' | 'error' | 'default' {
  if (status >= 200 && status < 300) {
    return 'success'
  } else if (status >= 400) {
    return 'error'
  }
  return 'default'
}

function getMessage(method: string, status: number, endpoint: string) {
  const messages = getEndpointMessages(endpoint)
  return messages && method in messages && status in messages[method]
    ? messages[method][status]
    : undefined
}

function getEndpointMessages(endpoint: string): any {
  if (endpoint.includes(THINGS_BASE)) {
    if (endpoint.includes('ownership')) {
      return {
        PATCH: {
          404: 'Email address does not have a valid user account. Please input the email for a valid user.',
          422: 'Specified user is already an owner of this site',
          default: true,
        },
      }
    }
  } else if (endpoint.includes(USER_BASE)) {
    if (endpoint == USER_BASE) {
      return {
        GET: { 401: 'Invalid email or password.' },
        POST: {
          409: 'A user with this email already exists.',
        },
      }
    } else if (endpoint.includes('send-password-reset-email')) {
      return {
        POST: {
          404: 'No account was found for the email you specified',
        },
      }
    }
  } else if (endpoint.includes(ACCOUNT_BASE)) {
    if (endpoint.includes(`${ACCOUNT_BASE}/jwt/pair`)) {
      return {
        POST: {
          401: 'No active account found with the given credentials.',
        },
      }
    }
  }
}
