import express from 'express';
import { body, check } from 'express-validator';

import { Server } from 'socket.io';
import cors from 'cors';

import { getCurrentUser, userLeave, userJoin } from './utils';
import { instrument } from '@socket.io/admin-ui';
import { createUser, getUserInfo, signin, updateUser } from './handler/user';
import { generateToken, getToken, updateToken } from './handler/token';
import { protect } from './modules/auth';
import { handleInputErrors } from './modules/middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(3001, () => {
  console.log(`Server started at port 3001`);
});

const io = new Server(server, {
  cors: {
    origin: ['localhost:5173', 'https://admin.socket.io'],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
  mode: 'development',
});

app.post(
  '/signup',
  check('username').notEmpty().withMessage({
    message: 'Username is required',
  }),
  check('email').notEmpty().withMessage({
    message: 'Email is required',
  }),
  check('password').notEmpty().withMessage({
    message: 'Password is required',
  }),
  handleInputErrors,
  createUser
);

app.post('/login', signin);

app.get('/generate-token', protect, generateToken);
app.put('/token/:id', protect, updateToken);
app.get('/token', protect, getToken);
app.get('/user', protect, getUserInfo);
app.put('/user', protect, updateUser);

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
  console.log(`Connected,${socket.id}`);
  console.log(socket.handshake.auth.token, 'authToken k ayo');

  socket.on('live-translate', (data) => {
    console.log(socket.id);

    const user = getCurrentUser(socket.id);
    console.log(user);
    if (user && user.room) {
      io.to(user.room).emit('live-translate-receive', data);
    } else {
      io.emit('live-translate-receive', data);
    }
  });

  socket.on('join-room', ({ type, room, masterToken }, cb) => {
    const token = socket.handshake.auth.token;
    console.log(token, 'token');
    console.log(masterToken, 'masterToken');

    if (token !== masterToken) {
      cb({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    const user = userJoin(socket.id, type, room);
    console.log(user);

    socket.join(user.room);

    socket.broadcast
      .to(user.room)
      .emit('message', `${user.type} has joined the chat`);

    cb({ success: true, message: user.room });
  });

  socket.on('leave-room', (room, cb) => {
    console.log(`leave-room, ${room}`);
    userLeave(socket.id);
    socket.leave(room);
    cb(true);
  });
});
