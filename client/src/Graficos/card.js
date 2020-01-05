import React from 'react'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import styles from './styles'

export default ({ label, currentValue }) => {
  const classes = styles()

  return (
    <Card>
      <CardContent className={classes.cardContent}>
        <Typography variant='h3'>{currentValue}</Typography>
        <Typography variant='subtitle1'>{label}</Typography>
      </CardContent>
    </Card>
  )
}
