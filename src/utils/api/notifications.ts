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

// Login
//   if (tokenResponse.status === 200) {
//     if (userResponse.status === 200) {
//       Notification.toast({
//         message: 'You have logged in!',
//         type: 'success',
//       })
//     } else if (userResponse.status === 401) {
//       Notification.toast({
//         message: 'Invalid email or password.',
//         type: 'error',
//       })
//     } else {
//       Notification.toast({
//         message: 'Server error. Please try again later.',
//         type: 'error',
//       })
//     }
//   } else if (tokenResponse.status === 401) {
//     Notification.toast({
//       message: 'Invalid email or password.',
//       type: 'error',
//     })
//   } else {
//     Notification.toast({
//       message: 'Server error. Please try again later.',
//       type: 'error',
//     })
//   }
// } catch (error: any) {
//   if (!error.response) {
//     Notification.toast({
//       message: 'Network error. Please check your connection.',
//       type: 'error',
//     })
//   } else {
//     this.resetState()
//     if (error.response.status === 401) {
//       Notification.toast({
//         message: 'Invalid email or password.',
//         type: 'error',
//       })
//     } else {
//       Notification.toast({
//         message: 'Something went wrong',
//         type: 'error',
//       })
//     }
//   }
//   console.error('Error Logging in', error)
// } finally {
//   this.loggingIn = false
// }

// CreateUser
//   if (response.status === 200) {
//     Notification.toast({
//       message: 'Account successfully created.',
//       type: 'success',
//     })
//   }
// } catch (error: any) {
// if (!error.response) {
//   Notification.toast({
//     message: 'Network error. Please check your connection.',
//     type: 'error',
//   })
// } else if (
//   error.response.status === 400 &&
//   error.response.data.detail === 'EmailAlreadyExists'
// ) {
//   Notification.toast({
//     message: 'A user with this email already exists.',
//     type: 'error',
//   })
// } else {
//   Notification.toast({
//     message: 'Something went wrong.',
//     type: 'error',
//   })
// }
// console.error('Error creating user', error)
// }

// SendVerificationEmail
// if (response.status === 200) {
//   Notification.toast({
//     message: 'Verification email sent successfully.',
//     type: 'info',
//   })
// } else {
//   Notification.toast({
//     message: 'Failed to send verification email.',
//     type: 'error',
//   })
// }

// activateAccount
// Notification.toast({
//   message: 'Your HydroServer account has been activated.',
//   type: 'success',
// })
// } else {
//   Notification.toast({
//     message: 'Account activation failed. Token incorrect or expired.',
//     type: 'error',
//   })
// }

// deleteAccount
//   Notification.toast({
//     message: 'Your account has been deleted',
//     type: 'info',
//   })
// } catch (error) {
//   console.error('Error deleting account:', error)
//   Notification.toast({
//     message:
//       'Error occurred while deleting your account. Please try again.',
//     type: 'error',
//   })
// }

// requestPasswordReset
// } catch (error: any) {
//   if (!error.response) {
//     Notification.toast({
//       message: 'Network error. Please check your connection.',
//       type: 'error',
//     })
//   } else if (error.response.status === 404) {
//     Notification.toast({
//       message: 'No account was found for the email you specified',
//       type: 'error',
//     })
//   } else {
//     Notification.toast({
//       message:
//         'Error occurred while requesting your password reset email. Please try again.',
//       type: 'error',
//     })
//   }
//   console.error('Error requesting password reset:', error)
// }

// resetPassword
// if (response.status === 200) {
//   Notification.toast({
//     message: 'Successfully reset password!',
//     type: 'success',
//   })
// }
// } catch (error: any) {
//   if (!error.response) {
//     Notification.toast({
//       message: 'Network error. Please check your connection.',
//       type: 'error',
//     })
//   } else {
//     Notification.toast({
//       message:
//         'Error occurred while requesting your password reset email. Please try again.',
//       type: 'error',
//     })
//   }
//   console.error('Error requesting password reset:', error.response.status)
// }
