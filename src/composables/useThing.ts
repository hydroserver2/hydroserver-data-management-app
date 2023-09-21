import { useThingStore } from '@/store/things'
import { Thing } from '@/types'
import { computed, ref, onMounted } from 'vue'

import router from '@/router/router'

export function useThing(thingId: string) {
  const thingStore = useThingStore()

  const deleteInput = ref('')
  const isRegisterModalOpen = ref(false)
  const isDeleteModalOpen = ref(false)
  const isAccessControlModalOpen = ref(false)

  function switchToAccessControlModal() {
    isDeleteModalOpen.value = false
    isAccessControlModalOpen.value = true
  }

  const thing = computed(() => thingStore.things[thingId] as unknown as Thing)

  //TODO: Find a better way to get GoogleMaps to reload on thing change
  const stringThing = computed(
    () => thingStore.things[thingId] as unknown as string
  )

  const mapOptions = computed(() => {
    if (thingStore.things[thingId])
      return {
        center: {
          lat: thingStore.things[thingId].latitude,
          lng: thingStore.things[thingId].longitude,
        },
        zoom: 16,
        mapTypeId: 'satellite',
      }
  })

  const thingProperties = computed(() => {
    if (!thing.value) return []
    const {
      id,
      samplingFeatureCode,
      latitude,
      longitude,
      elevation_m,
      description,
      // samplingFeatureType,
      siteType,
      state,
      county,
      isPrivate,
      owners,
    } = thing.value

    return [
      { icon: 'fas fa-id-badge', label: 'ID', value: id },
      {
        icon: 'fas fa-barcode',
        label: 'Site Code',
        value: samplingFeatureCode,
      },
      { icon: 'fas fa-map', label: 'Latitude', value: latitude },
      { icon: 'fas fa-map', label: 'Longitude', value: longitude },
      { icon: 'fas fa-mountain', label: 'Elevation', value: elevation_m },
      { icon: 'fas fa-file-alt', label: 'Description', value: description },
      // {
      //   icon: 'fas fa-map-marker-alt',
      //   label: 'Sampling Feature Type',
      //   value: samplingFeatureType,
      // },
      { icon: 'fas fa-map-pin', label: 'Site Type', value: siteType },
      { icon: 'fas fa-flag-usa', label: 'State', value: state },
      { icon: 'fas fa-flag-usa', label: 'County', value: county },
      {
        icon: isPrivate ? 'fas fa-lock' : 'fas fa-globe',
        label: 'Privacy',
        value: isPrivate ? 'Private' : 'Public',
      },
      {
        icon: 'fas fa-user',
        label: 'Site Owners',
        value: owners
          .map(
            (owner) =>
              (owner.firstName + ' ' + owner.lastName + (owner.organizationName ? `: ${owner.organizationName}` : ''))
          )
          .join(', '),
      },
    ]
  })

  async function deleteThing() {
    if (!thing.value) {
      console.error('Site could not be found.')
      return
    }
    if (deleteInput.value !== thing.value.name) {
      console.error('Site name does not match.')
      return
    }
    await thingStore.deleteThing(thingId)
    await router.push('/sites')
  }

  async function toggleSitePrivacy() {
    await thingStore.updateThingPrivacy(thingId, thing.value.isPrivate)
  }

  onMounted(async () => {
    await thingStore.fetchThingById(thingId)
  })

  return {
    toggleSitePrivacy,
    thing,
    mapOptions,
    deleteInput,
    deleteThing,
    thingProperties,
    isRegisterModalOpen,
    isDeleteModalOpen,
    isAccessControlModalOpen,
    switchToAccessControlModal,
    stringThing,
  }
}
