import React from 'react';
import { Container } from "react-bootstrap";
import ApolloProvider from './ApolloProvider';
import { BrowserRouter, Switch } from 'react-router-dom';

import "./App.scss";
// Components
import Home from "./pages/home/Home";
import Register from './pages/Register';
import Login from './pages/Login';

// Providers
import { AuthProvider } from './context/auth';
import { MessageProvider } from "./context/message";
import DynamicRoute from './util/route';

function App() {

  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Container className="pt-5">
              <Switch>
                <DynamicRoute exact path="/" component={Home} auth />
                <DynamicRoute path="/register" component={Register} guest />
                <DynamicRoute path="/login" component={Login} guest />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
