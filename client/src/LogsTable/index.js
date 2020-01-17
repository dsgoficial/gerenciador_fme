import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline'

import { getExecucao } from './api'
import { MessageSnackBar, MaterialTable } from '../helpers'
import { handleApiError } from '../services'
import LogModal from './log_modal'

export default withRouter(props => {
  const [logs, setLogs] = useState([])
  const [openLogDialog, setOpenLogDialog] = useState({})

  const [snackbar, setSnackbar] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getExecucao()
        if (!response || !isCurrent) return
        setLogs(response)
        setLoaded(true)
      } catch (err) {
        if (!isCurrent) return
        handleApiError(err, setSnackbar)
      }
    }
    load()

    return () => {
      isCurrent = false
    }
  }, [])

  const handleLogFME = (event, rowData) => {
    setOpenLogDialog({
      open: true,
      log: rowData.log
    })
  }

  return (
    <>
      <MaterialTable
        title='Logs de execução'
        loaded={loaded}
        columns={[
          { title: 'uuid', field: 'uuid' },
          { title: 'Rotina', field: 'rotina' },
          { title: 'Versão', field: 'versao_rotina' },
          { title: 'Status', field: 'nome' },
          { title: 'Data', field: 'data_execucao' },
          { title: 'Tempo', field: 'tempo_execucao' }
        ]}
        data={logs}
        actions={[
          {
            icon: ViewHeadlineIcon,
            tooltip: 'Log FME',
            onClick: handleLogFME
          }
        ]}
        detailPanel={rowData => {
          return (
            <div style={{ margin: '15px' }}>
              <p><b>Sumário:</b> {rowData.sumario}</p>
              <p><b>Parâmetros:</b> {rowData.parametros}</p>
            </div>
          )
        }}
      />
      {openLogDialog
        ? (
          <LogModal
            open={openLogDialog.open}
            handleDialog={openLogDialog}
          />
        )
        : null}
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})
