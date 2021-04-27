import React from 'react';
import { Container } from "react-bootstrap";
import ApolloProvider from './ApolloProvider';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import "./App.scss";
// Components
import Home from "./pages/Home";
import Register from './pages/Register';
import Login from './pages/Login';

function App() {

  return (
    <ApolloProvider>
      <BrowserRouter>
        <Container className="pt-5">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
          </Switch>
        </Container>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
