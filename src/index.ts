import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

var server = app.listen(3001, () => {
  console.log(`Server started at port 3001`);
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('live-translate', (data) => {
    socket.broadcast.emit('live-translate-receive', data);
  });
});

app.get('/', (req, res) => {
  res.send({ message: 'helloe' });
});
