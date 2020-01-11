import { makeStyles } from '@material-ui/core/styles'

const styles = makeStyles(theme => ({
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
