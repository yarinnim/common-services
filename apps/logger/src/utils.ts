type EnvProps = {
  appName: string;
  env: string;
};

export const getCollectionName = (props: EnvProps): string => {
  const { appName = 'undefined_app', env = 'undefined_env' } = props;
  return `${appName} [${env}]`;
};

export const consoleLog = (props: any) => {
  const {
    appName,
    env,
    timestamp,
    message,
    severity,
  } = props;
  const msg = JSON.stringify(message);
  const ts = new Date(timestamp).toISOString();
  const theMessage = [
    `${appName}[${env}]`,
    `${severity.toUpperCase()}`,
    `${ts} - ${msg}`,
  ].join(' ');
  /* eslint-disable no-console */
  console.log(theMessage);
};

export function parseContent(content: any) {
  const str = content.toString();
  try {
    const result = JSON.parse(str);
    return result;
  } catch (error: any) {
    const { message } = error;
    return { error: message };
  };
}

