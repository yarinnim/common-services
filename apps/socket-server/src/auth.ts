import { getApp } from './models/app.model';

const getNamespace = (socket: any) => socket.nsp.name.replaceAll('/', '');

export default function authMiddleware(socket: any, next: any) {
  const { handshake } = socket;
  const { auth } = handshake;
  const { namespace, appId, secretKey } = auth;
  const appNamespace = getNamespace(socket);

  const hasNamespace = namespace || false;
  if (!hasNamespace) return next(new Error('Namepsace not defined.'));

  if (namespace !== appNamespace) {
    return next(new Error('Namespace and Application does not match.'));
  }

  return getApp(namespace, appId, secretKey)
    .then((app: any) => {
      const foundApp = app || false;
      if (!foundApp) return next(new Error('Invalid application configuration'));
      return next();
    })
    .catch((error: any) => {
      const { message } = error;
      return next(new Error(message));
    });
}
