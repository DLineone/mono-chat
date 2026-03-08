import { schema, t, table, SenderError } from "spacetimedb/server";

const user = table(
  { name: "user", public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string().optional(),
    online: t.bool(),
  },
);

const message = table(
  { name: "message", public: true },
  {
    sender: t.identity(),
    sent: t.timestamp(),
    text: t.string(),
  },
);

// Compose the schema (gives us ctx.db.user and ctx.db.message, etc.)
const spacetimedb = schema({ user, message });
export default spacetimedb;

function validateName(name: string) {
  if (!name) {
    throw new SenderError("Names must not be empty");
  }
  if (name.length < 3 || name.length > 20) {
    throw new SenderError("Names must be between 3 and 20 characters long");
  }
}

export const set_name = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    validateName(name);
    const user = ctx.db.user.identity.find(ctx.sender);
    if (!user) {
      throw new SenderError("Cannot set name for unknown user");
    }
    ctx.db.user.identity.update({ ...user, name });
  },
);

function validateMessage(text: string) {
  if (!text.trim()) {
    throw new SenderError("Messages must not be empty");
  }
  if (text.length > 256) {
    throw new SenderError("Messages must not be longer than 256 characters");
  }
}

export const send_message = spacetimedb.reducer(
  { text: t.string() },
  (ctx, { text }) => {
    validateMessage(text);
    console.info(`User ${ctx.sender}: ${text}`);
    ctx.db.message.insert({
      sender: ctx.sender,
      text,
      sent: ctx.timestamp,
    });
  },
);

export const init = spacetimedb.init((_ctx) => {});

export const onConnect = spacetimedb.clientConnected((ctx) => {
  const user = ctx.db.user.identity.find(ctx.sender);
  if (user) {
    ctx.db.user.identity.update({ ...user, online: true });
  } else {
    ctx.db.user.insert({
      identity: ctx.sender,
      name: undefined,
      online: true,
    });
  }
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
  const user = ctx.db.user.identity.find(ctx.sender);
  if (user) {
    ctx.db.user.identity.update({ ...user, online: false });
  } else {
    console.warn(
      `Disconnect event for unknown user with identity ${ctx.sender}`,
    );
  }
});
