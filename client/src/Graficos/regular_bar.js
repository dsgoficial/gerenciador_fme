import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { BarChart, Bar, ResponsiveContainer, Legend, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'

import styles from './styles'

const CustomizedAxisTick = (props) => {
  const { x, y, payload } = props

  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={16} textAnchor='middle' fill='#666'>{payload.value}</text>
    </g>
  )
}

export default ({ title, series, fill, groupKey, valueKey }) => {
  const classes = styles()
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)

  return (
    <Card className={fixedHeightPaper}>
      <Typography variant='h6' gutterBottom>{title}</Typography>
      <CardContent className={classes.content}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            margin={{ top: 20, right: 0, left: 0, bottom: 10 }}
            data={series}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey={groupKey} height={60} tick={<CustomizedAxisTick />} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={valueKey} fill={fill} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
