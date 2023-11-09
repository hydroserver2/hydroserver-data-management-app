import { createPinia } from 'pinia'
// import { createPersistedState } from 'pinia-plugin-persistedstate'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia()
store.use(piniaPluginPersistedstate)
// store.use(
//   createPersistedState({
//     auto: true,
//   })
// )
export default store
