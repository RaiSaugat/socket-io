const users = [];

export const addUserType = ({ id, type, room }) => {
  room = room.trim().toLowerCase();
  type = type.trim().toLowerCase();

  console.log(`Joining room ${room} ${type} ${id}`);

  console.log(users);

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

export const removeUserType = (type: string) => {
  const index = users.findIndex((user) => {
    return user.type.toLowerCase() === type.toLowerCase();
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = (id: string) => users.find((user) => user.id === id);

export const getUsersInRoom = (room: string) =>
  users.filter((user) => user.room === room);

export const getUsers = () => users;
