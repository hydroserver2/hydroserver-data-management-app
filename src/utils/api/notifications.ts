import Notification, { IToast } from '@/store/notifications'

export function sendToast(response: any, endpoint: string, isError = false) {
  // TODO: Add the remaining notifications and find a better way to organize everything
  let toast: IToast = { message: '', type: 'default' }

  if (isError) {
    toast.type = 'error'

    if (response instanceof TypeError) {
      toast.message = 'Network error. Please check your connection.'
    } else {
      console.log('status', response.status)
      switch (response.status) {
        case 404:
          toast.message =
            'Email address does not have a valid user account. Please input the email for a valid user.'
          break
        case 422:
          toast.message = 'Specified user is already an owner of this site'
          toast.type = 'info'
          break
        case 403:
          if (response.data.error === 'NotPrimaryOwner') {
            toast.message =
              "Only the primary owner can modify other users' ownership"
          } else {
            toast.message =
              'Primary owner cannot edit their own ownership. Transfer ownership to another if you no longer wish to be the primary owner'
          }
          break
        default:
          toast.message = 'An unexpected error occurred.'
      }
    }

    Notification.toast(toast)
    return
  }

  if (response.status >= 200 && response.status < 300) {
    toast.type = 'success'
  } else if (response.status >= 400) {
    toast.type = 'error'
  }

  if (endpoint.includes(`/data/things/`) && endpoint.includes(`/ownership`)) {
    switch (response.status) {
      case 200:
        toast.message = 'Successfully added secondary owner!'
        // message: `Successfully transferred ownership!`
        // message: `Successfully removed owner`
        break
      case 404:
        toast.message =
          'Email address does not have a valid user account. Please input the email for a valid user.'
        break
      case 422:
        toast.message = 'Specified user is already an owner of this site'
        break
      case 403:
        if (response.data && response.data.error === 'NotPrimaryOwner') {
          toast.message =
            "Only the primary owner can modify other users' ownership"
        } else {
          toast.message =
            'Primary owner cannot edit their own ownership. Transfer ownership to another if you no longer wish to be the primary owner'
        }
        break
      default:
        break
    }
    Notification.toast(toast)
  }
}
