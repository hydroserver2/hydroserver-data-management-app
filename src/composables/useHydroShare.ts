import { Snackbar } from '@/utils/notifications'
import hs from '@hydroserver/client'
import { ref, computed, onMounted } from 'vue'

interface ConnectedProvider {
  provider: {
    id: string
    name: string
    flows?: any[]
    client_id?: string
  }
  uid: string
  display?: string
}

export function useHydroShare() {
  const { oAuthProviders } = hs.session

  const connectedProviders = ref([])
  const isLoaded = ref(false)

  const hydroShareProvider = computed<ConnectedProvider | null>(
    () =>
      connectedProviders.value.find(
        (item: any) => item.provider.id === 'hydroshare'
      ) || null
  )

  const isConnected = computed(() => !!hydroShareProvider.value)

  const isConnectionEnabled = computed(() =>
    oAuthProviders.some((p) => p.id === 'hydroshare' && p.connectEnabled)
  )

  async function connectHydroShare() {
    const callbackUrl = '/profile'
    hs.session.providerRedirect('hydroshare', callbackUrl, 'connect')
  }

  async function disconnectHydroShare() {
    try {
      if (!hydroShareProvider.value) {
        Snackbar.error('Cannot disconnect: no HydroShare provider found.')
        return
      }

      const providerResponse = await hs.session.deleteProvider(
        'hydroshare',
        hydroShareProvider.value.uid
      )

      connectedProviders.value = providerResponse.data
      Snackbar.info('Your HydroShare account has been disconnected.')
    } catch (error) {
      console.error('Error disconnecting HydroShare account', error)
      Snackbar.error('Error disconnecting HydroShare account')
    }
  }

  onMounted(async () => {
    try {
      const connectedProvidersResponse =
        await hs.session.fetchConnectedProviders()
      connectedProviders.value = connectedProvidersResponse.data
      isLoaded.value = true
    } catch (error) {
      console.error('Error fetching 3rd party providers', error)
    }
  })

  return {
    isLoaded,
    isConnected,
    isConnectionEnabled,
    connectHydroShare,
    disconnectHydroShare,
  }
}
