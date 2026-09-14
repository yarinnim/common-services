# Socket Server

The common Web Socket server to serve the Real Time communication
between the client and client. At the current version, the server
supports the following methods/events.

- ``join-room``: Join specific room
- ``leave-room``: Leave a specific room
- ``message``: General event, use this event for all.

## Connecting to Server

Connecting to the server, we need to have the client application registered
in the Socket Server service first. After, the client application is registered,
you will get key pairing of ``appId`` and ``appSecretKey`` to be used as
authorization between client application and server. You can connect
to the server using the following methods:

### Using ``@core/socket-client``

To connect to server using hour in house package named ``@core/socket-client``.

1. Add the ``@core/socket-client`` package into you project
2. Initialize the project as the following:

```ts
import socketClient, { type Client } from '@core/socket-client';

const host = 'https://apps.initcapp.com';
appId: '4418565e-0ded-4328-afca-bbff8fdf76e7';
appSecretKey: '14300d1fa9e33e1d3eb083066ca8065f7143c498104699c91b4847ae2fe52f80';

const getClient = (): Client => socketClicke(host, {
  appId,
  appSecretKey,
});
```

### Using ``socket.io-client``

Make sure you have ``socket.io-client`` installed on your project

```ts
import { io, type Socket } from 'socket.io-client';

const host = 'https://apps.initcapp.com';
appId: '4418565e-0ded-4328-afca-bbff8fdf76e7';
appSecretKey: '14300d1fa9e33e1d3eb083066ca8065f7143c498104699c91b4847ae2fe52f80';

const client = io(`${host}/${appId}`, {
  auth: { appId, appSecretKey },
})
```

## Available Methods

As current design, we only supports the following methods:

### Join a room

```ts
const room: string = '/admin';
client.emit('join-room', room);
```

### Leave a room

```ts
const roomToLeave: string = '/admin';
client.emit('leave-room', roomToLeave);
```

### Raising an event

```ts
const eventName: string = 'notification-to-123456';
client.emit('message', {
  event: eventName,
  message: 'Welcome to new world'
})
```

### Broadcast an event to a room

```ts
const eventName: string = 'room-event';
const roomName: string = '/admin';
client.emit('message', {
  event: eventName,
  room: roomName,
  message: 'New member has joint the room',
})
```

