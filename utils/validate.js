// utils/validate.js
const { z } = require("zod");

/**
 * validateBody(schema) — middleware для валидации req.body по zod-схеме.
 * При ошибке вернёт 400 { ok:false, error:"validation_error", details:[...] }.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        error: "validation_error",
        details: result.error.issues.map(i => ({
          path: i.path.join("."),
          message: i.message
        }))
      });
    }
    req.valid = { ...(req.valid || {}), body: result.data };
    next();
  };
}

module.exports = { validateBody, z };
