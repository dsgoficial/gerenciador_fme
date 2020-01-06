import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ReactLoading from 'react-loading'

import { importaUsuarios, getUsuariosAuth, getUsuarios } from './api'
import { SubmitButton } from '../helpers'
import styles from './styles'

const DialogoImporta = ({ open = false, usuario = {}, handleDialog }) => {
  const classes = styles()

  const [listaTurnos, setListaTurnos] = useState([])
  const [listaPostoGrad, setListaPostoGrad] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getUsuariosAuth()
        if (!response || !isCurrent) return

        const { listaPostoGrad, listaTurnos } = response
        setListaPostoGrad(listaPostoGrad)
        setListaTurnos(listaTurnos)
        setLoaded(true)
      } catch (err) {
        handleDialog('error', 'Ocorreu um erro ao se comunicar com o servidor.')
      }
    }
    load()

    return () => {
      isCurrent = false
    }
  }, [handleDialog])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    handleDialog()
  }

  const handleConfirm = async (values, { resetForm }) => {
    try {
      setSubmitting(true)
      const response = await importaUsuarios(
        uuids
      )
      if (!response) return
      setSubmitting(false)
      handleDialog('success', 'Usuários importados com sucesso.')
    } catch (err) {
      setSubmitting(false)
      if (
        'response' in err &&
        'data' in err.response &&
        'message' in err.response.data
      ) {
        handleDialog('error', err.response.data.message)
      } else {
        handleDialog('error', 'Ocorreu um erro ao se comunicar com o servidor.')
      }
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Importar usuários</DialogTitle>
      <DialogContent>
        {loaded ? (
          <>
          </>
        )
          : (
            <div className={classes.loading}>
              <ReactLoading type='bars' color='#F83737' height='40%' width='40%' />
            </div>
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary' disabled={submitting} autoFocus>
          Cancelar
        </Button>
        <SubmitButton onClick={handleConfirm} color='secondary' submitting={submitting}>
          Confirmar
        </SubmitButton>
      </DialogActions>
    </Dialog>
  )
}

export default DialogoImporta
