import React, { useState, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import Add from '@material-ui/icons/Add'
import Typography from '@material-ui/core/Typography'

import { getTarefas, deletaTarefaCron, deletaTarefaData } from './api'
import { MessageSnackBar, MaterialTable } from '../helpers'
import DialogoAdicionaCron from './dialogo_cron'
import DialogoAdicionaData from './dialogo_data'
import { handleApiError } from '../services'

const Tarefas = withRouter(props => {
  const [tarefasCron, setTarefasCron] = useState([])
  const [tarefasData, setTarefasData] = useState([])
  const [snackbar, setSnackbar] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [openAdicionaCronDialog, setOpenAdicionaCronDialog] = useState({})
  const [openAdicionaDataDialog, setOpenAdicionaDataDialog] = useState({})

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getTarefas()
        if (!response || !isCurrent) return
        setTarefasCron(response.cron)
        setTarefasData(response.data)
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
  }, [refresh])

  const handleDeletarTarefaCron = async oldData => {
    try {
      const response = await deletaTarefaCron(oldData.uuid)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Tarefa deletada com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  const handleDeletarTarefaData = async oldData => {
    try {
      const response = await deletaTarefaData(oldData.uuid)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Tarefa deletada com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  const handleAgendarTarefaCron = (event, rowData) => {
    setOpenAdicionaCronDialog({
      open: true
    })
  }

  const executeAdicionaCronDialog = useMemo(() => (status, msg) => {
    setOpenAdicionaCronDialog({})
    setRefresh(new Date())
    if (status && msg) {
      setSnackbar({ status, msg, date: new Date() })
    }
  }, [])

  const handleAgendarTarefaData = (event, rowData) => {
    setOpenAdicionaDataDialog({
      open: true
    })
  }

  const executeAdicionaDataDialog = useMemo(() => (status, msg) => {
    setOpenAdicionaDataDialog({})
    setRefresh(new Date())
    if (status && msg) {
      setSnackbar({ status, msg, date: new Date() })
    }
  }, [])

  return (
    <>
      <MaterialTable
        title='Tarefas Agendadas - Cron'
        loaded={loaded}
        columns={[
          { title: 'Nome', field: 'nome' },
          { title: 'Rotina', field: 'rotina' },
          { title: 'Próxima execução', field: 'proxima_execucao' },
          { title: 'Data início', field: 'data_inicio' },
          { title: 'Data fim', field: 'data_fim' },
          { title: 'Configuracao', field: 'configuracao' },
          { title: 'Usuário', field: 'usuario' },
          { title: 'Data agendamento', field: 'data_agendamento' }
        ]}
        data={tarefasCron}
        actions={[
          {
            icon: Add,
            tooltip: 'Agendar tarefa - Cron',
            isFreeAction: true,
            onClick: handleAgendarTarefaCron
          }
        ]}
        editable={{
          onRowDelete: handleDeletarTarefaCron
        }}
        detailPanel={rowData => {
          return (
            <div style={{ margin: '15px' }}>
              <Typography variant='h6' gutterBottom>Parâmetros</Typography>
              {Object.keys(rowData.parametros).map((key, i) => (
                <p key={i}><b>{key}</b>: {rowData.parametros[key]}</p>
              ))}
            </div>

          )
        }}
      />
      <MaterialTable
        title='Tarefas Agendadas - Data'
        loaded={loaded}
        columns={[
          { title: 'Nome', field: 'nome' },
          { title: 'Rotina', field: 'rotina' },
          { title: 'Data execução', field: 'data_execucao' },
          { title: 'Usuário', field: 'usuario' },
          { title: 'Data agendamento', field: 'data_agendamento' }
        ]}
        data={tarefasData}
        actions={[
          {
            icon: Add,
            tooltip: 'Agendar tarefa - Data',
            isFreeAction: true,
            onClick: handleAgendarTarefaData
          }
        ]}
        editable={{
          onRowDelete: handleDeletarTarefaData
        }}
        detailPanel={rowData => {
          return (
            <div style={{ margin: '15px' }}>
              <Typography variant='h6' gutterBottom>Parâmetros</Typography>
              {Object.keys(rowData.parametros).map((key, i) => (
                <p key={i}><b>{key}</b>: {rowData.parametros[key]}</p>
              ))}
            </div>

          )
        }}
      />
      {openAdicionaCronDialog
        ? (
          <DialogoAdicionaCron
            open={openAdicionaCronDialog.open}
            handleDialog={executeAdicionaCronDialog}
          />
        )
        : null}
      {openAdicionaDataDialog
        ? (
          <DialogoAdicionaData
            open={openAdicionaDataDialog.open}
            handleDialog={executeAdicionaDataDialog}
          />
        )
        : null}
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})

export default Tarefas