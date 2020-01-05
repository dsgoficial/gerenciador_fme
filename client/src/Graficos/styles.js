import { makeStyles } from '@material-ui/core/styles'

const styles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column'
  },
  fixedHeight: {
    height: 500
  },
  content: {
    flex: '1 0 auto',
    textAlign: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  cardContent: {
    textAlign: 'center',
    alignItems: 'center',
    position: 'relative',
    height: '140px',
    boxSizing: 'border-box'
  },
  stacked: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  },
  total: {
    marginTop: 5
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '100vh'
  }
}))

export default styles
