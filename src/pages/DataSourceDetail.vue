<template>
  <v-container>
    <div v-if="dataSource">
      <v-row>
        <v-col>
          <h4 class="text-h4 mb-4">{{ dataSource.name }}</h4>
        </v-col>
        <v-spacer />
        <v-col class="text-right">
          <v-tooltip text="Back to Data Sources" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                icon="mdi-arrow-left"
                :to="{ name: 'DataSources' }"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Edit Data Source" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                color="secondary"
                icon="mdi-pencil"
                @click="dataSourceFormOpen = true"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Delete Data Source" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" color="delete" icon="mdi-delete" />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-spacer />
      <v-row>
        <v-col>
          <v-row>
            <v-col>
              <h5 class="text-h5">Data Source Configuration</h5>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-table class="elevation-2">
                <tbody>
                  <tr>
                    <td style="width: 220px">ID</td>
                    <td>{{ dataSource.id }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Name</td>
                    <td>{{ dataSource.name }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Data Loader</td>
                    <td>{{ dataLoader?.name }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Local File Path</td>
                    <td>{{ dataSource.path }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Header Row</td>
                    <td>{{ dataSource.headerRow }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Data Start Row</td>
                    <td>{{ dataSource.dataStartRow }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Timestamp Column</td>
                    <td>{{ dataSource.timestampColumn }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Timestamp Format</td>
                    <td>
                      {{
                        dataSource.timestampFormat === 'iso'
                          ? 'ISO'
                          : dataSource.timestampFormat
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Timezone Offset</td>
                    <td>
                      {{
                        dataSource.timestampOffset
                          ? dataSource.timestampOffset
                          : 'UTC'
                      }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-row>
            <v-col>
              <h5 class="text-h5">Data Source Status</h5>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-table class="elevation-2">
                <tbody>
                  <tr>
                    <td style="width: 220px">Status</td>
                    <td>
                      <DataSourceStatus
                        :status="status"
                        :paused="dataSource.paused"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Schedule</td>
                    <td>{{ scheduleString }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Last Synced</td>
                    <td>{{ dataSource.lastSynced }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Last Sync Message</td>
                    <td>{{ dataSource.lastSyncMessage }}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Next Sync</td>
                    <td>{{ dataSource.nextSync }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <h5 class="text-h5">Linked Datastreams</h5>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            class="elevation-2"
            :headers="linkedDatastreamColumns"
            :items="datastreams"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </div>
    <div v-else>Loading...</div>
    <v-dialog v-model="dataSourceFormOpen" :persistent="true">
      <DataSourceForm
        @close-dialog="dataSourceFormOpen = false"
        :dataSourceId="dataSource.id"
      />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DataLoader, DataSource, Datastream } from '@/types'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { api } from '@/services/api'
import { computed } from 'vue'
import { getStatus } from '@/utils/dataSourceUtils'

const route = useRoute()
const dataSourceFormOpen = ref(false)
const datastreams = ref<Datastream[]>([])
const dataLoader = ref<DataLoader>(new DataLoader())
const dataSource = ref<DataSource>(new DataSource())

const status = computed(() =>
  dataSource.value ? getStatus(dataSource.value) : 'pending'
)

const scheduleString = computed(() => {
  if (!dataSource.value) return ''
  const ds = dataSource.value
  let string = ''

  if (ds.interval) string += `Every ${ds.interval} ${ds.intervalUnits}`
  else string += `Crontab: ${ds.crontab}`

  if (ds.startTime && ds.endTime)
    string += ` from ${ds.startTime} to ${ds.endTime}`
  else if (ds.startTime) string += ` beginning ${ds.startTime}`
  else if (ds.endTime) string += ` until ${ds.endTime}`

  return string
})

const linkedDatastreamColumns = [
  {
    title: 'ID',
    key: 'name',
  },
  {
    title: 'Name',
    key: 'description',
  },
  {
    title: 'Status',
    key: 'status',
  },
  {
    title: 'Last Loaded Timestamp',
    key: 'phenomenonEndTime',
  },
  {
    title: 'Data Source Column',
    key: 'dataSourceColumn',
  },
] as const

onMounted(async () => {
  try {
    const [data, source] = await Promise.all([
      api.fetchDatastreams(),
      api.fetchDataSource(route.params.id.toString()),
    ])

    dataSource.value = source
    dataLoader.value = await api.fetchDataLoader(dataSource.value.dataLoaderId)
    datastreams.value = (data as Datastream[]).filter(
      (d) => d.dataSourceId === dataSource.value.id
    )
  } catch (e) {
    console.log('error fetching dataSource', e)
  }
})
</script>
