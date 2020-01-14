import React, { useState, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import Add from '@material-ui/icons/Add'

import { getTarefas, deletaTarefa } from './api'
import { MessageSnackBar, MaterialTable } from '../helpers'
import DialogoImporta from './dialogo_importa'
import { handleApiError } from '../services'

export default withRouter(props => {
  const [tarefas, setTarefas] = useState([])
  const [snackbar, setSnackbar] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [openAdicionaDialog, setOpenAdicionaDialog] = useState({})

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getTarefas()
        if (!response || !isCurrent) return
        setTarefas(response)
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

  const handleDeletarTarefa = async oldData => {
    try {
      const response = await deletaTarefa(oldData.uuid)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Tarefa deletada com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  const handleAgendarTarefa = (event, rowData) => {
    setOpenAdicionaDialog({
      open: true
    })
  }

  const executeAdicionaDialog = useMemo(() => (status, msg) => {
    setOpenAdicionaDialog({})
    setRefresh(new Date())
    if (status && msg) {
      setSnackbar({ status, msg, date: new Date() })
    }
  }, [])

  return (
    <>
      <MaterialTable
        title='Tarefas Agendadas'
        loaded={loaded}
        columns={[
          { title: 'UUID', field: 'uuid' },
          { title: 'Rotina', field: 'rotina' },
          { title: 'Próxima execução', field: 'proxima_execucao' },
          { title: 'Configuracao', field: 'configuracao' },
          { title: 'Usuário', field: 'usuario' },
          { title: 'Data agendamento', field: 'data_agendamento' }
        ]}
        data={tarefas}
        actions={[
          {
            icon: Add,
            tooltip: 'Agendar tarefa',
            isFreeAction: true,
            onClick: handleAgendarTarefa
          }
        ]}
        editable={{
          onRowDelete: handleDeletarTarefa
        }}
        detailPanel={rowData => {
          return (
            <div style={{ margin: '15px' }}>
              {Object.keys(rowData.parametros).forEach((key, i) => (
                <p key={i}><b>{key}:</b> {rowData.parametros[key]}</p>
              ))}
            </div>
          )
        }}
      />
      {openAdicionaDialog
        ? (
          <DialogoImporta
            open={openAdicionaDialog.open}
            handleDialog={executeAdicionaDialog}
          />
        )
        : null}
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})
