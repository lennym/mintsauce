module.exports = (thing) => {
  return thing && typeof thing.then === 'function' && typeof thing.catch === 'function';
};
