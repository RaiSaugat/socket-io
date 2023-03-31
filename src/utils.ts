export function generateRandomText() {
  const rand = () => {
    return Math.random().toString(36).substring(2);
  };

  const token = () => {
    return rand() + rand();
  };

  return token();
}
