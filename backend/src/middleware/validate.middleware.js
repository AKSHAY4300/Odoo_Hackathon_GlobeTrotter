const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return res.status(400).json({
          success: false,
          error: errorMessages,
          details: error.errors,
        });
      }
      return res.status(400).json({
        success: false,
        error: error.message || 'Validation error',
      });
    }
  };
};

module.exports = validate;
