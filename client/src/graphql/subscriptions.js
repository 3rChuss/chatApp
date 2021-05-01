import { gql } from "@apollo/client";
import { MESSAGE_DETAILS } from "./messages";

export const NEW_MESSAGE = gql`
  subscription {
    newMessage {
      message {
        ...MessageDetails
      }
      type
      participants
    }
  }
  ${MESSAGE_DETAILS}
`;
