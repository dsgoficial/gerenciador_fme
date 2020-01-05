import React from 'react'
import { NavLink } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import ListIcon from '@material-ui/icons/List'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import EditIcon from '@material-ui/icons/Edit'
import DataUsageIcon from '@material-ui/icons/DataUsage'

import styles from './styles'

export const MainListItems = props => {
  const classes = styles()

  return (
    <List>
      <Divider />
      <ListItem button component={NavLink} replace exact to='/' activeClassName={classes.active}>
        <ListItemIcon>
          <InsertChartIcon />
        </ListItemIcon>
        <ListItemText primary='Gráficos' />
      </ListItem>
      <Divider />
      <ListItem button component={NavLink} replace exact to='/adicionar_rotina' activeClassName={classes.active}>
        <ListItemIcon>
          <LibraryAddIcon />
        </ListItemIcon>
        <ListItemText primary='Adicionar rotina' />
      </ListItem>
      <ListItem button component={NavLink} replace exact to='/atualizar_rotina' activeClassName={classes.active}>
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary='Atualizar rotina' />
      </ListItem>
      <Divider />
      <ListItem button component={NavLink} replace exact to='/categorias' activeClassName={classes.active}>
        <ListItemIcon>
          <LibraryBooksIcon />
        </ListItemIcon>
        <ListItemText primary='Categorias' />
      </ListItem>
      <ListItem button component={NavLink} replace exact to='/rotinas' activeClassName={classes.active}>
        <ListItemIcon>
          <ListIcon />
        </ListItemIcon>
        <ListItemText primary='Rotinas' />
      </ListItem>
    </List>
  )
}

export const AdminListItems = props => {
  const classes = styles()

  return (
    <List>
      <Divider />
      <ListSubheader inset>Administração</ListSubheader>
      <ListItem button component={NavLink} replace exact to='/logs' activeClassName={classes.active}>
        <ListItemIcon>
          <DataUsageIcon />
        </ListItemIcon>
        <ListItemText primary='Logs' />
      </ListItem>
      <ListItem button component={NavLink} replace exact to='/gerenciar_usuarios' activeClassName={classes.active}>
        <ListItemIcon>
          <VerifiedUserIcon />
        </ListItemIcon>
        <ListItemText primary='Gerenciar usuários' />
      </ListItem>
      <ListItem button component={NavLink} replace exact to='/arquivos_temporarios' activeClassName={classes.active}>
        <ListItemIcon>
          <DeleteSweepIcon />
        </ListItemIcon>
        <ListItemText primary='Arquivos temporários' />
      </ListItem>
    </List>
  )
}
