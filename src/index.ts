import express from 'express';
import { instrument } from '@socket.io/admin-ui';
import { Server } from 'socket.io';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import {
  addUserType,
  getUser,
  getUsers,
  removeUserType,
} from './modules/users';
import router from './router';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: [process.env.BASE_URL, 'https://live-caption.netlify.app/'],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
  mode: 'development',
});

app.get('/api/v1', (req, res) => {
  res.send({ message: 'Hello World' });
});

app.use('/api/v1/', router);

app.use((err, req, res, next) => {
  if (err.type === 'auth') {
    res.status(401).json({ message: 'unauthorized' });
  } else if (err.type === 'input') {
    res.status(400).json({ message: 'invalid input' });
  } else {
    res.status(500).json({ message: 'opps, thats on us' });
  }
});

io.on('connection', (socket) => {
  socket.on('live-translate', (data) => {
    const user = getUser(socket.id);

    if (user && user.room) {
      io.to(user.room).emit('live-translate-receive', data);
    } else {
      io.emit('live-translate-receive', data);
    }
  });

  socket.on('join-room', ({ type, room, masterToken }, cb) => {
    const token = socket.handshake.auth.token;

    if (token !== masterToken) {
      cb &&
        cb({
          success: false,
          message: 'Invalid token',
        });
      return;
    }

    const { error, user } = addUserType({ id: socket.id, type, room });

    if (error) {
      cb && cb({ success: false, message: error });
      return;
    }

    socket.join(user.room);

    socket.broadcast
      .to(user.room)
      .emit('message', `${user.type} has joined the chat`);

    cb && cb({ success: true, message: user.room });
  });

  socket.on('leave-room', (room, type, cb) => {
    removeUserType(type);
    socket.leave(room);
    cb(true);
  });
});
