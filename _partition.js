const f = (n, emit, done) => {
  let p = -1;
  return (data) => {
    p = (p + 1) % n;
    emit(p, data);
    return p;
  };
};
module.exports = f;

if (require.main === module) {
  console.log('todo');
}
