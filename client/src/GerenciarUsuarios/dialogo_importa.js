import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ReactLoading from 'react-loading'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Checkbox from '@material-ui/core/Checkbox'

import { importaUsuarios, getUsuariosAuth } from './api'
import { SubmitButton } from '../helpers'
import styles from './styles'

const DialogoImporta = ({ open = false, handleDialog }) => {
  const classes = styles()

  const [usuarios, setUsuarios] = useState([])
  const [usuariosSelected, setUsuariosSelected] = useState({})

  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleChange = uuid => event => {
    setUsuariosSelected({ ...usuariosSelected, [uuid]: event.target.checked })
  }

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getUsuariosAuth()
        if (!response || !isCurrent) return

        setUsuarios(response)
        const aux = {}
        response.forEach(u => {
          aux[u.uuid] = false
        })
        setUsuariosSelected(aux)
        setLoaded(true)
      } catch (err) {
        handleDialog('error', 'Ocorreu um erro ao se comunicar com o servidor.')
      }
    }
    load()

    return () => {
      isCurrent = false
    }
  }, [handleDialog, open])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    handleDialog()
  }

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      const response = await importaUsuarios(
        Object.keys(usuariosSelected).filter(k => usuariosSelected[k])
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

  const error = Object.values(usuariosSelected).filter(v => v).length === 0

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Importar usuários</DialogTitle>
      <DialogContent>
        {loaded ? (
          usuarios.length > 0 ? (
            <FormControl required error={error} component='fieldset' className={classes.formControl}>
              <FormLabel component='legend'>Selecione um ou mais usuários para importar</FormLabel>
              <FormGroup>
                {usuarios.map(u => (
                  <FormControlLabel
                    key={u.uuid}
                    control={<Checkbox checked={usuariosSelected[u.uuid]} onChange={handleChange(u.uuid)} value={u.uuid} />}
                    label={`${u.tipo_posto_grad} ${u.nome_guerra}`}
                  />
                ))}
              </FormGroup>
              <FormHelperText>Selecione um ou mais usuários.</FormHelperText>
            </FormControl>
          )
            : (
              <FormControl component='fieldset' className={classes.formControl}>
                <FormLabel component='legend'>Não existem usuários para serem importados.</FormLabel>
              </FormControl>
            )
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
        <SubmitButton onClick={handleConfirm} color='secondary' disabled={!loaded || error || usuarios.length === 0} submitting={submitting}>
          Confirmar
        </SubmitButton>
      </DialogActions>
    </Dialog>
  )
}

export default DialogoImporta
