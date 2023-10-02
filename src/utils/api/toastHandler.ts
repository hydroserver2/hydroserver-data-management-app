import { ENDPOINTS } from '@/constants'
import Notification from '@/store/notifications'

export function toastHandler(response: any, endpoint: string, method: string) {
  if (response instanceof TypeError) {
    Notification.toast({
      message: response.message,
      type: 'error',
    })
    return
  }
  const status = response.status
  if (!status) return
  const type = getType(status)
  const message = getMessage(method, status, endpoint)
  if (message) Notification.toast({ type: type, message: message })
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

// const THINGS_ID_PATTERN = new RegExp(`${ENDPOINTS.THINGS}/[a-zA-Z0-9]+`)

function getEndpointMessages(endpoint: string): any {
  if (endpoint.includes(ENDPOINTS.THINGS)) {
    // if (endpoint == ENDPOINTS.THINGS) {
    // } else if (THINGS_ID_PATTERN.test(endpoint)) {}
    // else if (endpoint.includes('metadata')) {
    // } else
    if (endpoint.includes('ownership')) {
      return {
        PATCH: {
          200: 'Successfully modified site ownership!',
          404: 'Email address does not have a valid user account. Please input the email for a valid user.',
          422: 'Specified user is already an owner of this site',
          403: "Only the primary owner can modify other users' ownership",
          default: true,
        },
      }
    }
    // else if (endpoint.includes('privacy')) {
    // }
  } else if (endpoint.includes(ENDPOINTS.USER)) {
    if (endpoint == ENDPOINTS.USER) {
      return {
        GET: { 200: 'You have logged in!', 401: 'Invalid email or password.' },
        POST: {
          200: 'Account successfully created.',
          400: 'A user with this email already exists.',
        },
      }
    } else if (endpoint.includes('send-password-reset-email')) {
      return {
        POST: {
          404: 'No account was found for the email you specified',
          // TODO 'Account activation failed. Token incorrect or expired.'
        },
      }
    } else if (endpoint.includes('reset-password')) {
      return {
        POST: {
          200: 'Successfully reset password!',
          // TODO 'Account activation failed. Token incorrect or expired.'
        },
      }
    }
  } else if (endpoint.includes(ENDPOINTS.ACCOUNT)) {
    if (endpoint == ENDPOINTS.USER) {
      return {
        DELETE: {
          200: 'Your account has been deleted',
          //TODO: 'Error occurred while deleting your account. Please try again.'
        },
      }
    } else if (endpoint.includes('send-verification-email')) {
      return {
        POST: {
          200: 'Verification email sent successfully.',
          //TODO: 'Failed to send verification email.'
        },
      }
    } else if (endpoint.includes('activate')) {
      return {
        POST: {
          200: 'Your HydroServer account has been activated.',
          // TODO 'Account activation failed. Token incorrect or expired.'
        },
      }
    }
  }
}
