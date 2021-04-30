import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { useAtuhState } from '../context/auth';

export default function DynamicRoute(props) {
    const { username } = useAtuhState();
    
    if (props.auth && !username) {
      return <Redirect to="/login" />;
    } else if (props.guest && username) {
      return <Redirect to="/" />;
    } else {
      return <Route component={props.component} {...props} />;
    }
}

