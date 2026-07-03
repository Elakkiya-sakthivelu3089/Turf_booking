const Joi = require("joi");

const createBookingValidation = Joi.object({
  gameId: Joi.string().required().messages({
    "any.required": "Game ID is required",
  }),
  startTime: Joi.date().iso().required().messages({
    "date.iso": "startTime must be a valid ISO date",
    "any.required": "startTime is required",
  }),
  endTime: Joi.date()
    .iso()
    .required()
    .min(Joi.ref("startTime"))
    .messages({
      "date.iso": "endTime must be a valid ISO date",
      "date.min": "endTime must be after startTime",
      "any.required": "endTime is required",
    }),
});

const cancelBookingValidation = Joi.object({
  bookingId: Joi.string().required(),
});

const getAvailableSlotsValidation = Joi.object({
  gameId: Joi.string().required(),
  date: Joi.date().iso().required(),
  slotDuration: Joi.number().optional().default(1).min(1).max(4),
});

module.exports = {
  createBookingValidation,
  cancelBookingValidation,
  getAvailableSlotsValidation,
};
