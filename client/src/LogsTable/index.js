import React, { useState, useMemo } from 'react'
import { withRouter } from 'react-router-dom'

import { getExecucaoPaginacao } from './api'
import { MessageSnackBar, DataTable } from '../helpers'
import { handleApiError } from '../services'

export default withRouter(props => {
  const [snackbar, setSnackbar] = useState('')

  const fetchData = useMemo(() => async (page, perPage, column, sortDirection, filterText) => {
    try {
      const response = await getExecucaoPaginacao(page, perPage, column, sortDirection, filterText)
      if (!response) return

      return response
    } catch (err) {
      handleApiError(err, setSnackbar)
      return { data: [], total: 0 }
    }
  }, [])

  return (
    <>
      <DataTable
        title='Logs de execução'
        columns={[
          { name: 'uuid', selector: 'uuid' },
          { name: 'Rotina', selector: 'rotina' },
          { name: 'Versão', selector: 'versao_rotina' },
          { name: 'Status', selector: 'nome' },
          { name: 'Data', selector: 'data_execucao' },
          { name: 'Tempo', selector: 'tempo_execucao' },
          { name: 'Log', selector: 'log' },
          { name: 'Parametros', selector: 'parametros' }

        ]}
        fetchData={fetchData}
      />
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})
