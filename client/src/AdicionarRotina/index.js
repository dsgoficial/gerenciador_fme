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
        setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() })
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
      resetForm(initialValues)
      if (
        'response' in err &&
        'data' in err.response &&
        'message' in err.response.data
      ) {
        setSnackbar({ status: 'error', msg: err.response.data.message, date: new Date() })
      } else {
        setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao cadastrar a rotina. Contate o gerente.', date: new Date() })
      }
    }
  }

  return (
    <>
      <Container maxWidth='sm'>
        {loaded ? (
          <Paper className={classes.paper}>
            <div className={classes.formArea}>
              <Typography component='h1' variant='h5'>
                Cadastar nova rotina
              </Typography>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleForm}
              >
                {({ isValid, isSubmitting, isValidating, setFieldValue }) => (
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
                      rows='2'
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
                          <MenuItem key={option.code} value={option.code}>
                            {option.nome}
                          </MenuItem>
                        ))}
                      </Field>
                    </div>
                    <input accept='*.fmw' className={classes.input} id='icon-button-file' type='file' />
                    <label htmlFor='icon-button-file'>
                      <Button
                        variant='contained'
                        color='primary'
                        size='large'
                        className={classes.button}
                        startIcon={<InsertDriveFileIcon />}
                        onChange={(event) => {
                          setFieldValue('file', event.currentTarget.files[0])
                        }}
                      >
                        Selecionar arquivo .fmw
                      </Button>
                    </label>
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
            </div>
          </Paper>
        )
          : (
            <div className={classes.loading}>
              <ReactLoading type='bars' color='#F83737' height='40%' width='40%' />
            </div>
          )}
      </Container>
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})
