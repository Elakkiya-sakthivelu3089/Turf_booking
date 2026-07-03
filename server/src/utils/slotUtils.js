const formatHour = (hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${suffix}`;
};

const generateSlots = () => {
  const slots = [];

  for (let hour = 8; hour < 20; hour++) {
    slots.push({
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
      label: `${formatHour(hour)} - ${formatHour(hour + 1)}`,
    });
  }

  return slots;
};

module.exports = { generateSlots };