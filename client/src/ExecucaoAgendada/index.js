import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'

import { getExecucao } from './api'
import { MessageSnackBar, MaterialTable } from '../helpers'
import { handleApiError } from '../services'

export default withRouter(props => {
  const [execucaoCron, setExecucaoCron] = useState([])
  const [execucaoData, setExecucaoData] = useState([])

  const [openLogDialog, setOpenLogDialog] = useState({
    open: false,
    log: ''
  })

  const [snackbar, setSnackbar] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getExecucao()
        if (!response || !isCurrent) return
        setExecucaoCron(response.cron)
        setExecucaoData(response.data)
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

  const closeLogDialog = () => {
    setOpenLogDialog({
      open: false,
      log: ''
    })
  }

  return (
    <>
      <MaterialTable
        title='Logs de execução - CRON'
        loaded={loaded}
        columns={[
          { title: 'Agendamento UUID', field: 'agendamento_uuid' },
          { title: 'Agendamento', field: 'agendamento' },
          { title: 'Rotina', field: 'rotina' },
          { title: 'Versão', field: 'versao_rotina' },
          { title: 'Status', field: 'status' },
          { title: 'Data', field: 'data_execucao' },
          { title: 'Tempo', field: 'tempo_execucao' }
        ]}
        data={execucaoCron}
        actions={[
          {
            icon: ViewHeadlineIcon,
            tooltip: 'Log FME',
            onClick: handleLogFME
          }
        ]}
        detailPanel={rowData => {
          return (
            <>
              <div style={{ margin: '15px' }}>
                <Typography variant='h6' gutterBottom>Sumário</Typography>
                {Object.keys(rowData.sumario).map((key, i) => (
                  <p key={i}><b>{key}</b> {rowData.sumario[key]}</p>
                ))}
              </div>
              <div style={{ margin: '15px' }}>
                <Typography variant='h6' gutterBottom>Parâmetros</Typography>
                {Object.keys(rowData.parametros).map((key, i) => (
                  <p key={i}><b>{key}</b> {rowData.parametros[key]}</p>
                ))}
              </div>
            </>
          )
        }}
      />
      <MaterialTable
        title='Logs de execução - Data'
        loaded={loaded}
        columns={[
          { title: 'Agendamento UUID', field: 'agendamento_uuid' },
          { title: 'Agendamento', field: 'agendamento' },
          { title: 'Rotina', field: 'rotina' },
          { title: 'Versão', field: 'versao_rotina' },
          { title: 'Status', field: 'status' },
          { title: 'Data', field: 'data_execucao' },
          { title: 'Tempo', field: 'tempo_execucao' }
        ]}
        data={execucaoData}
        actions={[
          {
            icon: ViewHeadlineIcon,
            tooltip: 'Log FME',
            onClick: handleLogFME
          }
        ]}
        detailPanel={rowData => {
          return (
            <>
              <div style={{ margin: '15px' }}>
                <Typography variant='h6' gutterBottom>Sumário</Typography>
                {Object.keys(rowData.sumario).map((key, i) => (
                  <p key={i}><b>{key}</b> {rowData.sumario[key]}</p>
                ))}
              </div>
              <div style={{ margin: '15px' }}>
                <Typography variant='h6' gutterBottom>Parâmetros</Typography>
                {Object.keys(rowData.parametros).map((key, i) => (
                  <p key={i}><b>{key}</b> {rowData.parametros[key]}</p>
                ))}
              </div>
            </>
          )
        }}
      />
      <Modal
        open={openLogDialog.open}
        onClose={closeLogDialog}
      >
        <Card>
          <Typography variant='h6' gutterBottom>Log de Execução</Typography>
          <CardContent>
            {openLogDialog.log}
          </CardContent>
        </Card>
      </Modal>
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})
