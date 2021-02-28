import React, { useState, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import SyncIcon from '@material-ui/icons/Sync'
import Add from '@material-ui/icons/Add'

import { getUsuarios, atualizaUsuario, deletaUsuario, sincronizaUsuarios } from './api'
import { MessageSnackBar, MaterialTable, DialogoConfirmacao } from '../helpers'
import DialogoImporta from './dialogo_importa'
import { handleApiError } from '../services'

const GerenciarUsuarios = withRouter(props => {
  const [usuarios, setUsuarios] = useState([])
  const [snackbar, setSnackbar] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [openAdicionaDialog, setOpenAdicionaDialog] = useState({})
  const [openSincronizaDialog, setOpenSincronizaDialog] = useState({})

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getUsuarios()
        if (!response || !isCurrent) return
        setUsuarios(response)
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

  const handleUpdateUsuario = async (newData, oldData) => {
    try {
      const response = await atualizaUsuario(newData.uuid, newData.administrador, newData.ativo)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Usuário atualizado com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  const handleDeletarUsuario = async oldData => {
    try {
      const response = await deletaUsuario(oldData.uuid)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Usuário deletado com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  const handleSincronizarUsuarios = (event, rowData) => {
    setOpenSincronizaDialog({
      open: true,
      title: 'Sincronizar informações dos usuários',
      msg: 'Deseja sincronizar as informações dos usuários com o serviço de autenticação?',
      handleDialog: executeSincronizaDialog
    })
  }

  const handleImportarUsuario = (event, rowData) => {
    setOpenAdicionaDialog({
      open: true
    })
  }

  const executeSincronizaDialog = async (confirm) => {
    if (confirm) {
      try {
        const success = await sincronizaUsuarios()
        if (success) {
          setRefresh(new Date())
          setSnackbar({ status: 'success', msg: 'Usuários sincronizados com sucesso.', date: new Date() })
        }
      } catch (err) {
        setRefresh(new Date())
        handleApiError(err, setSnackbar)
      } finally {
        setOpenSincronizaDialog({})
      }
    } else {
      setOpenSincronizaDialog({})
    }
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
        title='Usuários'
        loaded={loaded}
        columns={[
          { title: 'Login', field: 'login', editable: 'never' },
          { title: 'Posto/Graducao', field: 'tipo_posto_grad', editable: 'never' },
          { title: 'Nome Guerra', field: 'nome_guerra', editable: 'never' },
          { title: 'Nome completo', field: 'nome', editable: 'never' },
          { title: 'Ativo', field: 'ativo', type: 'boolean' },
          { title: 'Administrador', field: 'administrador', type: 'boolean' }
        ]}
        data={usuarios}
        actions={[
          {
            icon: SyncIcon,
            tooltip: 'Sincronizar informações',
            isFreeAction: true,
            onClick: handleSincronizarUsuarios
          },
          {
            icon: Add,
            tooltip: 'Importar usuário',
            isFreeAction: true,
            onClick: handleImportarUsuario
          }
        ]}
        editable={{
          onRowUpdate: handleUpdateUsuario,
          onRowDelete: handleDeletarUsuario
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
      {openSincronizaDialog ? (
        <DialogoConfirmacao
          open={openSincronizaDialog.open}
          title={openSincronizaDialog.title}
          msg={openSincronizaDialog.msg}
          onClose={openSincronizaDialog.handleDialog}
        />
      ) : null}
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})

export default GerenciarUsuarios