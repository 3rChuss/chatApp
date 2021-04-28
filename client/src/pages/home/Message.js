import React from 'react';
import ReactMarkdown from "react-markdown";
import { useAtuhState } from '../../context/auth';

export default function Message({ message }) {
    const { user } = useAtuhState();
    const sent = message.from === user;

    return (
      <div
        className={`d-flex my-3
            ${sent ? "ml-auto" : "mr-auto"}
        `}
      >
        <div
          className={`py-2 px-3 rounded-pill
                ${sent ? "bg-primary text-white" : "bg-light"}`}
        >
          <ReactMarkdown className="output">
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
}
