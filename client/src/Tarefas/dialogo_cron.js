import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ReactLoading from 'react-loading'
import { Formik, Form, Field } from 'formik'
import { TextField, Select } from 'formik-material-ui'
import MenuItem from '@material-ui/core/MenuItem'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { DateTimePicker } from 'material-ui-formik-components/DateTimePicker'
import ptLocale from 'date-fns/locale/pt-BR'

import { getRotinas, criaTarefaCron } from './api'
import { cronSchema } from './validation_schema'
import { SubmitButton } from '../helpers'
import styles from './styles'

const DialogoAdiciona = ({ open = false, handleDialog }) => {
  const classes = styles()

  const initialValues = {
    rotinaId: '',
    nome: '',
    configuracao: '',
    parametros: {},
    dataInicio: null,
    dataFim: null
  }

  const [rotinas, setRotinas] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true

    const load = async () => {
      try {
        const response = await getRotinas()
        if (!response || !isCurrent) return

        setRotinas(response)
        setLoaded(true)
      } catch (err) {
        handleDialog && handleDialog('error', 'Ocorreu um erro ao se comunicar com o servidor.')
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
    handleDialog && handleDialog()
  }

  const handleForm = async (values, { resetForm }) => {
    try {
      setSubmitting(true)
      const response = await criaTarefaCron(
        values.rotinaId,
        values.nome,
        values.configuracao,
        values.parametros,
        values.dataInicio,
        values.dataFim
      )
      if (!response) return
      setSubmitting(false)
      handleDialog && handleDialog('success', 'Tarefa agendada com sucesso.')
    } catch (err) {
      setSubmitting(false)
      resetForm(initialValues)
      if (
        'response' in err &&
        'data' in err.response &&
        'message' in err.response.data
      ) {
        handleDialog && handleDialog('error', err.response.data.message)
      } else {
        handleDialog && handleDialog('error', 'Ocorreu um erro ao se comunicar com o servidor.')
      }
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Agendar tarefa - Cron</DialogTitle>
      <DialogContent>
        {loaded ? (
          <>
            <Formik
              initialValues={initialValues}
              validationSchema={cronSchema}
              onSubmit={handleForm}
            >
              {({ values, isValid, isSubmitting, isValidating }) => (
                <Form className={classes.form}>
                  <div>
                    <Field
                      name='rotinaId'
                      label='Rotina'
                      variant='outlined'
                      component={Select}
                      displayEmpty
                      className={classes.select}
                    >
                      <MenuItem value='' disabled>
                        Selecione a rotina
                      </MenuItem>
                      {rotinas.map(option => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.rotina}
                        </MenuItem>
                      ))}
                    </Field>
                  </div>
                  <Field
                    name='nome'
                    component={TextField}
                    variant='outlined'
                    margin='normal'
                    fullWidth
                    label='Nome'
                  />
                  {rotinas.filter(r => {
                    return r.id === values.rotinaId
                  }).map(r => {
                    if (r.parametros && r.parametros.length > 0) {
                      return r.parametros.map((p, i) => {
                        if(p !== 'LOG_FILE'){
                          values.parametros[p] = values.parametros[p] || ''
                          return (
                            <Field
                              key={i}
                              name={`parametros.${p}`}
                              component={TextField}
                              variant='outlined'
                              margin='normal'
                              fullWidth
                              label={p}
                            />
                          )
                        }
                        return null
                      })
                    }
                    return null
                  })}
                  <Field
                    name='configuracao'
                    component={TextField}
                    variant='outlined'
                    margin='normal'
                    fullWidth
                    label='Cron'
                  />
                  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ptLocale}>
                    <Field
                      name='dataInicio'
                      component={DateTimePicker}
                      inputVariant='outlined'
                      margin='normal'
                      fullWidth
                      label='Data/hora de início'
                      format='dd/MM/yyyy HH:mm'
                      autoOk
                      clearable
                      disablePast
                    />
                    <Field
                      name='dataFim'
                      component={DateTimePicker}
                      inputVariant='outlined'
                      margin='normal'
                      fullWidth
                      label='Data/hora de fim'
                      format='dd/MM/yyyy HH:mm'
                      autoOk
                      clearable
                      disablePast
                    />
                  </MuiPickersUtilsProvider>
                  <SubmitButton
                    type='submit' disabled={isValidating || !isValid} submitting={isSubmitting}
                    fullWidth
                    variant='contained'
                    color='primary'
                    className={classes.submit}
                  >
                    Agendar
                  </SubmitButton>
                </Form>
              )}
            </Formik>
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
      </DialogActions>
    </Dialog>
  )
}

export default DialogoAdiciona
