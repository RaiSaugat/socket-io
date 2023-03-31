const users = [];

export const addUserType = ({ id, type, room }) => {
  room = room.trim().toLowerCase();
  type = type.trim().toLowerCase();

  const existingUserType = users.find((user) => {
    return user.room === room && user.type === type;
  });

  if (existingUserType) {
    return { error: `${type} is already present` };
  }
  const user = { id, type, room };

  users.push(user);
  return { user };
};

export const removeUserType = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = (id) => users.find((user) => user.id === id);

export const getUsersInRoom = (room) =>
  users.filter((user) => user.room === room);
