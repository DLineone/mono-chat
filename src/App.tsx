import React, { useState } from "react";
import { tables, reducers } from "./module_bindings";
import type * as Types from "./module_bindings/types";
import { useSpacetimeDB, useTable, useReducer } from "spacetimedb/react";
import { Identity, Timestamp } from "spacetimedb";
import "./App.css";

export type PrettyMessage = {
  senderName: string;
  text: string;
  sent: Timestamp;
  kind: "system" | "user";
};

function App() {
  const [newName, setNewName] = useState("");
  const [settingName, setSettingName] = useState(false);
  const [systemMessages, setSystemMessages] = useState([] as Types.Message[]);
  const [newMessage, setNewMessage] = useState("");

  const onlineUsers: Types.User[] = [];
  const offlineUsers: Types.User[] = [];
  const users = [...onlineUsers, ...offlineUsers];
  const prettyMessages: PrettyMessage[] = [];

  const name = "";

  const onSubmitNewName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSettingName(false);
    // TODO: Call `setName` reducer
  };

  const onSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewMessage("");
    // TODO: Call `sendMessage` reducer
  };

  return (
    <div className="App">
      <div className="profile">
        <h1>Profile</h1>
        {!settingName ? (
          <>
            <p>{name}</p>
            <button
              onClick={() => {
                setSettingName(true);
                setNewName(name);
              }}
            >
              Edit Name
            </button>
          </>
        ) : (
          <form onSubmit={onSubmitNewName}>
            <input
              type="text"
              aria-label="username input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </div>
      <div className="message-panel">
        <h1>Messages</h1>
        {prettyMessages.length < 1 && <p>No messages</p>}
        <div className="messages">
          {prettyMessages.map((message, key) => {
            const sentDate = message.sent.toDate();
            const now = new Date();
            const isOlderThanDay =
              now.getFullYear() !== sentDate.getFullYear() ||
              now.getMonth() !== sentDate.getMonth() ||
              now.getDate() !== sentDate.getDate();

            const timeString = sentDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const dateString = isOlderThanDay
              ? sentDate.toLocaleDateString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }) + " "
              : "";

            return (
              <div
                key={key}
                className={message.kind === "system" ? "system-message" : "user-message"}
              >
                <p>
                  <b>{message.kind === "system" ? "System" : message.senderName}</b>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      marginLeft: "0.5rem",
                      color: "#666",
                    }}
                  >
                    {dateString}
                    {timeString}
                  </span>
                </p>
                <p>{message.text}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="online" style={{ whiteSpace: "pre-wrap" }}>
        <h1>Online</h1>
        <div>
          {onlineUsers.map((user, key) => (
            <div key={key}>
              <p>{user.name || user.identity.toHexString().substring(0, 8)}</p>
            </div>
          ))}
        </div>
        {offlineUsers.length > 0 && (
          <div>
            <h1>Offline</h1>
            {offlineUsers.map((user, key) => (
              <div key={key}>
                <p>{user.name || user.identity.toHexString().substring(0, 8)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="new-message">
        <form
          onSubmit={onSubmitMessage}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            margin: "0 auto",
          }}
        >
          <h3>New Message</h3>
          <textarea
            aria-label="message input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          ></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
