import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import { Select } from 'formik-material-ui'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import ReactLoading from 'react-loading'
import MenuItem from '@material-ui/core/MenuItem'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import Button from '@material-ui/core/Button'
import LinkMui from '@material-ui/core/Link'

import { MessageSnackBar, SubmitButton } from '../helpers'
import styles from './styles'
import validationSchema from './validation_schema'
import { handleUpload, getRotinas } from './api'
import { handleApiError } from '../services'

const AtualizarRotina = withRouter(props => {
  const classes = styles()

  const initialValues = {
    rotina: '',
    file: ''
  }
  const [rotinas, setRotinas] = useState([])

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
      const success = await handleUpload(
        values.file,
        values.rotina
      )
      if (success) {
        resetForm(initialValues)
        setSnackbar({ status: 'success', msg: 'Rotina atualizada com sucesso', date: new Date() })
      }
    } catch (err) {
      document.getElementById('atualizar-rotina').value = ''
      resetForm(initialValues)
      handleApiError(err, setSnackbar)
    }
  }

  return (
    <>
      {loaded ? (
        <Container maxWidth='sm'>
          <Paper className={classes.paper}>
            <div className={classes.formArea}>
              {rotinas.length > 0 ? (
                <>
                  <Typography component='h1' variant='h5'>
                    Atualizar rotina
                  </Typography>
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleForm}
                  >
                    {({ values, isValid, isSubmitting, isValidating, setFieldValue }) => (
                      <Form className={classes.form}>
                        <div>
                          <Field
                            name='rotina'
                            label='Rotina'
                            variant='outlined'
                            component={Select}
                            displayEmpty
                            className={classes.select}
                          >
                            <MenuItem value='' disabled>
                              Selecione a rotina que será atualizada
                            </MenuItem>
                            {rotinas.map(option => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.rotina}
                              </MenuItem>
                            ))}
                          </Field>
                        </div>
                        <div>
                          <input
                            accept='.fmw'
                            className={classes.input}
                            id='atualizar-rotina'
                            type='file'
                            onChange={(event) => {
                              setFieldValue('file', event.currentTarget.files[0])
                            }}
                          />
                          <label htmlFor='atualizar-rotina'>
                            <Button
                              variant='contained'
                              className={classes.button}
                              startIcon={<InsertDriveFileIcon />}
                              component='span'
                            >
                              Selecionar arquivo .fmw
                            </Button>
                          </label>
                          <p>{values.file.name}</p>
                        </div>
                        <SubmitButton
                          type='submit' disabled={isValidating || !isValid} submitting={isSubmitting}
                          fullWidth
                          variant='contained'
                          color='primary'
                          className={classes.submit}
                        >
                          Atualizar
                        </SubmitButton>
                      </Form>
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
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})

export default AtualizarRotina