import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import ReactLoading from 'react-loading'

import { MessageSnackBar, SubmitButton } from '../helpers'
import styles from './styles'
import { deleteFiles, getFilesSize } from './api'

export default withRouter(props => {
  const classes = styles()

  const [logInfo, setLogInfo] = useState([])

  const [snackbar, setSnackbar] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getFilesSize()
        if (!response || !isCurrent) return

        setLogInfo(response)
        setLoaded(true)
      } catch (err) {
        setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() })
      }
    }
    load()

    return () => {
      isCurrent = false
    }
  }, [refresh])

  const handleClick = async (values) => {
    setIsSubmitting(true)
    try {
      const success = await deleteFiles()
      if (success) {
        setIsSubmitting(false)
        setRefresh(new Date())
        setSnackbar({ status: 'success', msg: 'Arquivos de log deletados com sucesso', date: new Date() })
      }
    } catch (err) {
      setIsSubmitting(false)
      if (
        'response' in err &&
        'data' in err.response &&
        'message' in err.response.data
      ) {
        setSnackbar({ status: 'error', msg: err.response.data.message, date: new Date() })
      } else {
        setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao atualizar a rotina. Contate o gerente.', date: new Date() })
      }
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <Container maxWidth='sm'>
        {loaded ? (
          <Paper className={classes.paper}>
            <div className={classes.formArea}>
              <Typography variant='subtitle1'>
                Existem {logInfo.arquivos} arquivos de log no serviço, que totalizam {logInfo.tamanho}.
              </Typography>
              <SubmitButton
                type='submit' submitting={isSubmitting}
                variant='contained'
                color='secondary'
                className={classes.submit}
                onClick={handleClick}
              >
                Deletar arquivos de log
              </SubmitButton>
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
