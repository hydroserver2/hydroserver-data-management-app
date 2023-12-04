<template>
  <v-container>
    <div v-if="dataSourcesLoaded && dataSource">
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
                    <td>{{ dataSource.dataLoaderName }}</td>
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
                        :status="dataSource.status"
                        :paused="dataSource.paused"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Schedule</td>
                    <td>{{ getScheduleString(dataSource) }}</td>
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
        :dataSourceId="selectedDataSource"
      />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDataSources } from '@/composables/useDataSources'
import { DataSource, Datastream } from '@/types'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { api } from '@/services/api'
import { computed } from 'vue'

const { dataSourcesLoaded, selectedDataSource, dataSources } = useDataSources()

const route = useRoute()
const dataSourceFormOpen = ref(false)
const datastreams = ref<Datastream[]>([])

const dataSource = computed(() =>
  dataSources.value.find(
    (ds) => ds.id.toString() === route.params.id.toString()
  )
)

function getScheduleString(ds: DataSource) {
  let scheduleString = ''
  if (ds.interval) {
    scheduleString = scheduleString.concat(
      `Every ${ds.interval} ${ds.intervalUnits}`
    )
  } else {
    scheduleString = scheduleString.concat(`Crontab: ${ds.crontab}`)
  }

  if (ds.startTime && ds.endTime) {
    scheduleString = scheduleString.concat(
      ` from ${ds.startTime} to ${ds.endTime}`
    )
  } else if (ds.startTime) {
    scheduleString = scheduleString.concat(` beginning ${ds.startTime}`)
  } else if (ds.endTime) {
    scheduleString = scheduleString.concat(` until ${ds.endTime}`)
  }
  return scheduleString
}

const linkedDatastreamColumns = [
  {
    title: 'ID',
    align: 'start',
    sortable: true,
    key: 'name',
  },
  {
    title: 'Name',
    align: 'start',
    sortable: true,
    key: 'description',
  },
  {
    title: 'Status',
    align: 'start',
    sortable: true,
    key: 'status',
  },
  {
    title: 'Last Loaded Timestamp',
    align: 'start',
    sortable: true,
    key: 'phenomenonEndTime',
  },
  {
    title: 'Data Source Column',
    align: 'start',
    sortable: true,
    key: 'dataSourceColumn',
  },
] as const

onMounted(async () => {
  const data: Datastream[] = await api.fetchDatastreams()
  datastreams.value = data.filter(
    (ds) => ds.dataSourceId === dataSource.value?.id
  )
})
</script>
