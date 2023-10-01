<template>
  <v-container>
    <div v-if="dataSources.dataSourcesLoaded.value">
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
                    <td>{{dataSource.id}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Name</td>
                    <td>{{dataSource.name}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Data Loader</td>
                    <td>{{dataSource.dataLoaderName}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Local File Path</td>
                    <td>{{dataSource.path}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Header Row</td>
                    <td>{{dataSource.headerRow}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Data Start Row</td>
                    <td>{{dataSource.dataStartRow}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Timestamp Column</td>
                    <td>{{dataSource.timestampColumn}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Timestamp Format</td>
                    <td>{{dataSource.timestampFormat === 'iso' ? 'ISO' : dataSource.timestampFormat}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Timezone Offset</td>
                    <td>{{dataSource.timestampOffset ? dataSource.timestampOffset : 'UTC'}}</td>
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
                    <td><DataSourceStatus :status="dataSource.status" :paused="dataSource.paused"/></td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Schedule</td>
                    <td>{{getScheduleString(dataSource)}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Last Synced</td>
                    <td>{{dataSource.lastSynced}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Last Sync Message</td>
                    <td>{{dataSource.lastSyncMessage}}</td>
                  </tr>
                  <tr>
                    <td style="width: 220px">Next Sync</td>
                    <td>{{dataSource.nextSync}}</td>
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
            :items="dataSource.datastreams"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </div>
    <div v-else>Loading...</div>
    <v-dialog v-model="dataSourceFormOpen" :persistent="true">
      <DataSourceForm
        @close-dialog="dataSourceFormOpen = false"
        :dataSourceId="dataSources.selectedDataSource"
      />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDataSources } from '@/composables/useDataSources'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'

const dataSources = useDataSources()

const route = useRoute()
const dataSourceFormOpen = ref(false)

let dataSource

if (dataSources.dataSourcesLoaded) {
  dataSource = dataSources.dataSources.value.find(
    (ds) => ds.id.toString() === route.params.id.toString()
  )
}

function getScheduleString(dataSource) {
  let scheduleString = ''
  if (dataSource.interval) {
    scheduleString = scheduleString.concat(`Every ${dataSource.interval} ${dataSource.intervalUnits}`)
  } else {
    scheduleString = scheduleString.concat(`Crontab: ${dataSource.crontab}`)
  }
  if (dataSource.scheduleStartTime && dataSource.scheduleEndTime) {
    scheduleString = scheduleString.concat(` from ${dataSource.scheduleStartTime} to ${dataSource.scheduleEndTime}`)
  } else if (dataSource.scheduleStartTime) {
    scheduleString = scheduleString.concat(` beginning ${dataSource.scheduleStartTime}`)
  } else if (dataSource.scheduleEndTime) {
    scheduleString = scheduleString.concat(` until ${dataSource.scheduleEndTime}`)
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
</script>

<style scoped></style>
