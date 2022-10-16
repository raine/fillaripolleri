const asyncRoute = (fn) => (req, res, next) =>
  fn(req, res, next).catch(next)

export default asyncRoute
