import { makeStyles } from '@material-ui/core/styles'

const styles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  formArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '100vh'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4, 3),
    elevation: 3
  },
  button: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  input: {
    display: 'none'
  },
  select: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  }
}))

export default styles
