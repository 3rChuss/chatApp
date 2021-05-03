import React from 'react';
import ReactMarkdown from "react-markdown";
import { useAtuhState } from '../../context/auth';

export default function Message({message}) {
  const { userId } = useAtuhState();

    return (
      <div
        className={`d-flex my-3
            ${userId === message.senderId ? "ml-auto" : "mr-auto"}
        `}
      >
        <div
          className={`py-2 px-3 rounded-pill
                ${
                  userId === message.senderId
                    ? "bg-primary text-white"
                    : "bg-light"
                }`}
        >
          <ReactMarkdown className="output">{message.content}</ReactMarkdown>
        </div>
      </div>
    );
}
