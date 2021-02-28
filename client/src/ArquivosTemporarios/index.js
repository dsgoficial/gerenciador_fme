import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import ReactLoading from 'react-loading'

import { MessageSnackBar, SubmitButton } from '../helpers'
import styles from './styles'
import { deleteFiles, getFilesSize } from './api'
import { handleApiError } from '../services'

const ArquivosTemporarios = withRouter(props => {
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
        if (!isCurrent) return
        handleApiError(err, setSnackbar)
      }
    }
    load()

    return () => {
      isCurrent = false
    }
  }, [refresh])

  const handleClick = async () => {
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
      handleApiError(err, setSnackbar)
    }
  }

  return (
    <>
      {loaded ? (
        <Container maxWidth='sm'>
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

export default ArquivosTemporarios