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
import Tooltip from '@material-ui/core/Tooltip'
import AddAlarmIcon from '@material-ui/icons/AddAlarm'
import AlarmOnIcon from '@material-ui/icons/AlarmOn'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'

import styles from './styles'

export const MainListItems = props => {
  const classes = styles()

  return (
    <List>
      <Divider />
      <Tooltip title='Dashboard' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/' activeClassName={classes.active}>
          <ListItemIcon>
            <InsertChartIcon />
          </ListItemIcon>
          <ListItemText primary='Dashboard' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Adicionar rotina' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/adicionar_rotina' activeClassName={classes.active}>
          <ListItemIcon>
            <LibraryAddIcon />
          </ListItemIcon>
          <ListItemText primary='Adicionar rotina' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Atualizar rotina' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/atualizar_rotina' activeClassName={classes.active}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary='Atualizar rotina' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Agendar tarefas' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/agendar_tarefas' activeClassName={classes.active}>
          <ListItemIcon>
            <AddAlarmIcon />
          </ListItemIcon>
          <ListItemText primary='Agendar tarefas' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Executar rotinas' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/executar' activeClassName={classes.active}>
          <ListItemIcon>
            <PlayArrowIcon />
          </ListItemIcon>
          <ListItemText primary='Executar rotinas' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Categorias' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/categorias' activeClassName={classes.active}>
          <ListItemIcon>
            <LibraryBooksIcon />
          </ListItemIcon>
          <ListItemText primary='Categorias' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Rotinas' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/rotinas' activeClassName={classes.active}>
          <ListItemIcon>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary='Rotinas' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Execuções agendadas' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/execucoes_agendadas' activeClassName={classes.active}>
          <ListItemIcon>
            <AlarmOnIcon />
          </ListItemIcon>
          <ListItemText primary='Execuções agendadas' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Logs de Execução' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/logs' activeClassName={classes.active}>
          <ListItemIcon>
            <DataUsageIcon />
          </ListItemIcon>
          <ListItemText primary='Logs de Execução' />
        </ListItem>
      </Tooltip>

    </List>
  )
}

export const AdminListItems = props => {
  const classes = styles()

  return (
    <List>
      <Divider />
      <ListSubheader inset>Administração</ListSubheader>

      <Tooltip title='Gerenciar usuários' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/gerenciar_usuarios' activeClassName={classes.active}>
          <ListItemIcon>
            <VerifiedUserIcon />
          </ListItemIcon>
          <ListItemText primary='Gerenciar usuários' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Arquivos temporários' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/arquivos_temporarios' activeClassName={classes.active}>
          <ListItemIcon>
            <DeleteSweepIcon />
          </ListItemIcon>
          <ListItemText primary='Arquivos temporários' />
        </ListItem>
      </Tooltip>

    </List>
  )
}
