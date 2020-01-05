import React from 'react'
import { Router, Route, Switch, Redirect } from 'react-router-dom'

import { auth, history } from './services'

import Login from './Login'
import NaoEncontrado from './NaoEncontrado'
import Erro from './Erro'
import Dashboard from './Dashboard'

const PrivateRoute = ({ component: Component, exact, path, role, ...rest }) => (
  <Route
    {...rest}
    exact={exact}
    path={path}
    render={props => {
      if (!auth.isAuthenticated()) {
        // not logged in so redirect to login page with the return url
        return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
      }

      const userRole = auth.getAuthorization()
      // check if route is restricted by role
      if (role && role !== userRole) {
        // role not authorised so redirect to home page
        return <Redirect to={{ pathname: '/', state: { from: props.location } }} />
      }

      // authorised so return component
      return <Component role={userRole} {...props} />
    }}
  />
)

const Routes = () => (
  <Router history={history}>
    <Switch>
      <PrivateRoute exact path='/' component={Dashboard} />
      <Route exact path='/login' component={Login} />
      <Route exact path='/erro' component={Erro} />
      <Route path='*' component={NaoEncontrado} />
    </Switch>
  </Router>
)

export default Routes
