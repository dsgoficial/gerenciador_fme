import React from 'react'
import { MaterialTable } from '../helpers'
import DateFnsUtils from '@date-io/date-fns'

const dateFns = new DateFnsUtils()

export default ({ data }) => {
  return (
    <>
      <MaterialTable
        title='Últimas execuções'
        loaded
        columns={[
          { title: 'Rotina', field: 'rotina' },
          { title: 'Versão', field: 'versao_rotina' },
          { title: 'Status', field: 'status' },
          { title: 'Data Execução', field: 'data_execucao', render: rowData => { return dateFns.format(dateFns.date(rowData.data_execucao), 'kk:mm dd/MM/yyyy') } }
        ]}
        data={data}
      />
    </>
  )
}
