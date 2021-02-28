import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'

import { getCategorias, atualizaCategoria, deletaCategoria, criaCategoria } from './api'
import { MessageSnackBar, MaterialTable } from '../helpers'
import styles from './styles'
import { handleApiError } from '../services'

const Categorias = withRouter(props => {
  const classes = styles()

  const [categorias, setCategorias] = useState([])
  const [snackbar, setSnackbar] = useState('')
  const [refresh, setRefresh] = useState(false)
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
  }, [refresh])

  const handleAdd = async newData => {
    try {
      const response = await criaCategoria(newData.nome, newData.descricao)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Categoria adicionada com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  const handleUpdate = async (newData, oldData) => {
    try {
      const response = await atualizaCategoria(newData.id, newData.nome, newData.descricao)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Categoria atualizada com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  const handleDelete = async oldData => {
    try {
      const response = await deletaCategoria(oldData.id)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Categoria deletada com sucesso', date: new Date() })
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  return (
    <>
      <MaterialTable
        title='Categorias'
        loaded={loaded}
        columns={[
          {
            title: 'Nome',
            field: 'nome',
            editComponent: props => (
              <TextField
                type='text'
                value={props.value || ''}
                className={classes.textField}
                onChange={e => props.onChange(e.target.value)}
              />
            )
          },
          {
            title: 'Descricao',
            field: 'descricao',
            render: rowData => (<> {rowData.descricao.length > 200 ? rowData.descricao.substring(0, 200) + '...' : rowData.descricao}</>),
            editComponent: props => (
              <TextField
                type='text'
                multiline
                rowsMax='4'
                value={props.value || ''}
                className={classes.textField}
                onChange={e => props.onChange(e.target.value)}
              />
            )
          }
        ]}
        data={categorias}
        editable={{
          onRowAdd: handleAdd,
          onRowUpdate: handleUpdate,
          onRowDelete: handleDelete
        }}
      />
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})

export default Categorias