export type Message = {
  event: string;
  room?: string;
  message: any;
};

const getProps = (props: any) => {
  const { socket } = props;
  const { id } = socket;
  return { from: id };
};

export default function messageHandler(props: any, messageProps: Message) {
  const { rootNamespace } = props;
  const { room = false, event, message } = messageProps;
  const nextProps = getProps(props);
  if (!room) return rootNamespace.emit(event, message, nextProps);
  return rootNamespace.to(room).emit(event, message, nextProps);
}
