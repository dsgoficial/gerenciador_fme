import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import ReactLoading from 'react-loading'

import UltimasExecucoesDataTable from './ultimas_execucoes'
import styles from './styles'
import { handleApiError } from '../services'

import { getDashboardData } from './api'
import { MessageSnackBar, CardGraph, Card, StackedArea, Bar } from '../helpers'

const Dashboard = withRouter(props => {
  const classes = styles()

  const [snackbar, setSnackbar] = useState('')
  const [loaded, setLoaded] = useState(false)

  const [execucoes, setExecucoes] = useState(0)
  const [rotinas, setRotinas] = useState(0)
  const [ultimasExecucoes, setUltimasExecucoes] = useState([])
  const [execucoesPorDia, setExecucoesPorDia] = useState([])
  const [execucoesPorMes, setExecucoesPorMes] = useState([])
  const [execucoesRotinas, setExecucoesRotinas] = useState([])
  const [errosRotinas, setErrosRotinas] = useState([])
  const [tempoExecucao, setTempoExecucao] = useState([])

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getDashboardData()
        if (!response || !isCurrent) return
        setExecucoes(response.execucoes)
        setRotinas(response.rotinas)
        setUltimasExecucoes(response.ultimasExecucoes)
        setExecucoesPorDia(response.execucoesPorDia)
        setExecucoesPorMes(response.execucoesPorMes)
        setExecucoesRotinas(response.execucoesRotinas)
        setErrosRotinas(response.errosRotinas)
        setTempoExecucao(response.tempoExecucao)
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

  return (
    <>
      {loaded ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <CardGraph label='Execuções hoje' series={execucoesPorDia} seriesKey='execucoes' fill='#8dd3c7' />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <CardGraph label='Execuções este mês' series={execucoesPorMes} seriesKey='execucoes' fill='#bebada' />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card label='Execuções' currentValue={execucoes} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card label='Rotinas' currentValue={rotinas} />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <StackedArea title='Execuções por dia por rotina' series={execucoesRotinas} dataKey='data' />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <Bar title='Tempo de execução por rotina' series={tempoExecucao} fill='#8dd3c7' groupKey='rotina' valueKey='tempo_execucao_medio' />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <StackedArea title='Erros por dia por rotina' series={errosRotinas} dataKey='data' />
          </Grid>
          <Grid item xs={12}>
            <UltimasExecucoesDataTable data={ultimasExecucoes} />
          </Grid>
        </Grid>
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

export default Dashboard
