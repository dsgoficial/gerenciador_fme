import React from 'react'
import { MaterialTable } from '../helpers'
import { format } from 'date-fns'

const UltimasExecucoes = ({ data }) => {
  return (
    <>
      <MaterialTable
        title='Últimas execuções'
        loaded
        columns={[
          { title: 'Rotina', field: 'rotina' },
          { title: 'Versão', field: 'versao_rotina' },
          { title: 'Status', field: 'status' },
          { title: 'Data Execução', field: 'data_execucao', render: rowData => format(new Date(rowData.data_execucao), "yyyy-MM-dd -- HH:mm:ss") }
        ]}
        data={data}
      />
    </>
  )
}

export default UltimasExecucoes