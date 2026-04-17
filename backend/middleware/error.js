class AppError extends Error {
  constructor(status, body) {
    super(typeof body === "string" ? body : JSON.stringify(body));
    this.status = status;
    this.body = body;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json(err.body);
  }
  console.error(err);
  return res.status(500).json("Something went wrong");
};

module.exports = { AppError, asyncHandler, errorHandler };
