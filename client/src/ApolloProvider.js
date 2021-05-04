import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  ApolloProvider as Provider,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

import { setContext } from "@apollo/client/link/context";

let httpLink = createHttpLink({
  uri: "http://localhost:4000",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication user from local storage if it exists
  const user = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      username: user ? user : "",
      userId: userId ? userId : "",
    },
  };
});

httpLink = authLink.concat(httpLink);

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    reconnect: true,
    timemout: 30000,
    connectionParams: {
      username: localStorage.getItem("username"),
      userId: localStorage.getItem("userId"),
    },
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getGroups: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
});

export default function ApolloProvider(props) {
  return <Provider client={client} {...props} />;
}
