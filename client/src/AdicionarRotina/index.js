import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import { TextField, Select } from 'formik-material-ui'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import ReactLoading from 'react-loading'
import MenuItem from '@material-ui/core/MenuItem'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import Button from '@material-ui/core/Button'

import { MessageSnackBar, SubmitButton } from '../helpers'
import styles from './styles'
import validationSchema from './validation_schema'
import { handleUpload, getCategorias } from './api'
import { handleApiError } from '../services'

export default withRouter(props => {
  const classes = styles()

  const initialValues = {
    nome: '',
    descricao: '',
    categoria: '',
    file: ''
  }
  const [categorias, setCategorias] = useState([])

  const [snackbar, setSnackbar] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getCategorias()
        if (!response || !isCurrent) return

        setCategorias(response)
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
        values.nome,
        values.descricao,
        values.categoria
      )
      if (success) {
        resetForm(initialValues)
        setSnackbar({ status: 'success', msg: 'Rotina cadastrada com sucesso', date: new Date() })
      }
    } catch (err) {
      document.getElementById('adicionar-rotina').value = ''
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
              {categorias.length > 0 ? (
                <>
                  <Typography variant='h5'>
                    Cadastar nova rotina
                  </Typography>
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleForm}
                  >
                    {({ values, isValid, isSubmitting, isValidating, setFieldValue }) => (
                      <Form className={classes.form}>
                        <Field
                          name='nome'
                          component={TextField}
                          variant='outlined'
                          margin='normal'
                          fullWidth
                          label='Nome completo'
                        />
                        <Field
                          name='descricao'
                          component={TextField}
                          variant='outlined'
                          margin='normal'
                          fullWidth
                          multiline
                          rows='3'
                          rowsMax='8'
                          label='Descrição'
                        />
                        <div>
                          <Field
                            name='categoria'
                            label='Categoria'
                            variant='outlined'
                            component={Select}
                            displayEmpty
                            className={classes.select}
                          >
                            <MenuItem value='' disabled>
                              Selecione a categoria da rotina
                            </MenuItem>
                            {categorias.map(option => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.nome}
                              </MenuItem>
                            ))}
                          </Field>
                        </div>
                        <div>
                          <input
                            accept='.fmw'
                            className={classes.input}
                            id='adicionar-rotina'
                            type='file'
                            onChange={(event) => {
                              setFieldValue('file', event.currentTarget.files[0])
                            }}
                          />
                          <label htmlFor='adicionar-rotina'>
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
                          Cadastrar
                        </SubmitButton>
                      </Form>
                    )}
                  </Formik>
                </>
              )
                : (
                  <Typography component='h1' variant='body1'>
                    Cadastre pelo menos uma antes de inserir rotinas.
                  </Typography>
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
