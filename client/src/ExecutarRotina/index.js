import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import { TextField, Select } from 'formik-material-ui'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import ReactLoading from 'react-loading'
import MenuItem from '@material-ui/core/MenuItem'
import LinkMui from '@material-ui/core/Link'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Backdrop from '@material-ui/core/Backdrop'

import { MessageSnackBar, SubmitButton } from '../helpers'
import styles from './styles'
import validationSchema from './validation_schema'
import { handleExecute, getRotinas } from './api'
import { handleApiError } from '../services'

const ExecutarRotina = withRouter(props => {
  const classes = styles()

  const initialValues = {
    rotinaId: '',
    parametros: {}
  }

  const [rotinas, setRotinas] = useState([])
  const [resultDialog, setResultDialog] = useState({
    open: false,
    log: '',
    sumario: []
  })
  const [snackbar, setSnackbar] = useState('')
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
        if (!isCurrent) return
        handleApiError(err, setSnackbar)
      }
    }
    load()

    return () => {
      isCurrent = false
    }
  }, [])

  const handleForm = async (values, { resetForm }) => {
    try {
      const result = await handleExecute(
        values.rotinaId,
        values.parametros
      )
      if (result) {
        resetForm(initialValues)
        if (result.status === 'Erro') {
          return setSnackbar({ status: 'error', msg: 'Erro na execução da rotina', date: new Date() })
        }
        setSnackbar({ status: 'success', msg: 'Rotina executada com sucesso', date: new Date() })
        setResultDialog({ open: true, log: result.log, sumario: result.sumario })
      }
    } catch (err) {
      resetForm(initialValues)
      handleApiError(err, setSnackbar)
    }
  }

  const closeLogDialog = () => {
    setResultDialog({
      open: false,
      log: '',
      sumario: []
    })
  }

  return (
    <>
      {loaded ? (
        <Container maxWidth='sm'>
          <Paper className={classes.paper}>
            <div className={classes.formArea}>
              {rotinas.length > 0 ? (
                <>
                  <Typography variant='h5'>
                    Executar rotina
                  </Typography>
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleForm}
                  >
                    {({ values, isValid, isSubmitting, isValidating, setFieldValue }) => (
                      <>
                        <Backdrop className={classes.backdrop} open={isSubmitting}>
                          <ReactLoading type='spin' color='#147814' height='7%' width='7%' />
                        </Backdrop>
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
                                Selecione a rotina que deseja executar
                              </MenuItem>
                              {rotinas.map(option => (
                                <MenuItem key={option.id} value={option.id}>
                                  {option.rotina}
                                </MenuItem>
                              ))}
                            </Field>
                          </div>
                          {rotinas.filter(r => {
                            return r.id === values.rotinaId
                          }).map(r => {
                            if (r.parametros && r.parametros.length > 0) {
                              return r.parametros.map((p, i) => {
                                values.parametros[p] = values.parametros[p] || ''
                                if (p !== 'LOG_FILE') {
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
                          <SubmitButton
                            type='submit' disabled={isValidating || !isValid} submitting={isSubmitting}
                            fullWidth
                            variant='contained'
                            color='primary'
                            className={classes.submit}
                          >
                            Executar
                          </SubmitButton>
                        </Form>
                      </>
                    )}
                  </Formik>
                </>
              )
                : (
                  <div className={classes.root}>
                    <Typography component='h1' variant='body1'>
                      Sem rotinas cadastradas
                    </Typography>
                    <LinkMui to='/adicionar_rotina' variant='body1' component={Link}>
                      Cadastrar rotina
                    </LinkMui>
                  </div>
                )}
            </div>
          </Paper>
        </Container>
      )
        : (
          <div className={classes.loading}>
            <ReactLoading type='bars' color='#F83737' height='5%' width='5%' />
          </div>
        )}
      <Dialog open={resultDialog.open} onClose={closeLogDialog}>
        <DialogTitle>Sumário execução</DialogTitle>
        <DialogContent>
          <div style={{ margin: '15px' }}>
            <Typography variant='h6' gutterBottom>Sumário</Typography>
            {resultDialog.sumario.map((s, i) => (
              <p key={i}><b>{s.classes}</b> {s.feicoes}</p>
            ))}
          </div>
          <div style={{ margin: '15px' }}>
            <Typography variant='h6' gutterBottom>Log de Execução</Typography>
            <div>{resultDialog.log}</div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogDialog} color='primary'>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})

export default ExecutarRotina