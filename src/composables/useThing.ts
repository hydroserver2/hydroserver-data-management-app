import { useThingStore } from '@/store/things'
import { Thing } from '@/types'
import { computed, ref, onMounted } from 'vue'

import router from '@/router/router'
import { storeToRefs } from 'pinia'

export function useThing(thingId: string) {
  const { things } = storeToRefs(useThingStore())
  const { deleteThing, fetchThingById, updateThingPrivacy } = useThingStore()

  const deleteInput = ref('')
  const isRegisterModalOpen = ref(false)
  const isDeleteModalOpen = ref(false)
  const isAccessControlModalOpen = ref(false)

  function switchToAccessControlModal() {
    isDeleteModalOpen.value = false
    isAccessControlModalOpen.value = true
  }

  const thing = computed(() => things.value[thingId] as unknown as Thing)

  const mapOptions = computed(() => {
    if (things.value[thingId])
      return {
        center: {
          lat: things.value[thingId].latitude,
          lng: things.value[thingId].longitude,
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
              owner.firstName +
              ' ' +
              owner.lastName +
              (owner.organizationName ? `: ${owner.organizationName}` : '')
          )
          .join(', '),
      },
    ]
  })

  async function OnDeleteThing() {
    if (!thing.value) {
      console.error('Site could not be found.')
      return
    }
    if (deleteInput.value !== thing.value.name) {
      console.error('Site name does not match.')
      return
    }
    await deleteThing(thingId)
    await router.push('/sites')
  }

  async function toggleSitePrivacy() {
    await updateThingPrivacy(thingId, thing.value.isPrivate)
  }

  onMounted(async () => {
    await fetchThingById(thingId)
  })

  return {
    toggleSitePrivacy,
    thing,
    mapOptions,
    deleteInput,
    OnDeleteThing,
    thingProperties,
    isRegisterModalOpen,
    isDeleteModalOpen,
    isAccessControlModalOpen,
    switchToAccessControlModal,
  }
}
