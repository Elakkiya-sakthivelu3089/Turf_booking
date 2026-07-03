const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    req.body = value;
    next();
  };
};

module.exports = validate;
