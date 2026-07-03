const formatHour = (hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${suffix}`;
};

const breakSlots = {
  13: "Lunch break",
  17: "Maintenance break",
};

const generateSlots = () => {
  const slots = [];

  for (let hour = 8; hour < 20; hour++) {
    const reason = breakSlots[hour];

    slots.push({
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
      label: `${formatHour(hour)} - ${formatHour(hour + 1)}`,
      isBreak: Boolean(reason),
      reason: reason || null,
    });
  }

  return slots;
};

const isBookableSlot = (startTime, endTime) => {
  return generateSlots().some(
    (slot) =>
      slot.startTime === startTime &&
      slot.endTime === endTime &&
      !slot.isBreak
  );
};

module.exports = { generateSlots, isBookableSlot };
