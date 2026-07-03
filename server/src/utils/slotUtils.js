const formatHour = (hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${suffix}`;
};

const breakSlots = {
  13: "Lunch break",
  17: "Maintenance break",
};

const parseHour = (time) => Number(String(time).split(":")[0]);

const getSlotBoundary = (date = new Date(), time) => {
  const boundary = new Date(date);
  boundary.setHours(parseHour(time), 0, 0, 0);
  return boundary;
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

const isSameLocalDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const getPublicLinkStatus = (date = new Date(), now = new Date()) => {
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const closeAt = new Date(bookingDate);
  closeAt.setHours(20, 0, 0, 0);

  const isToday = isSameLocalDay(bookingDate, now);
  return {
    isClosed: !isToday || now >= closeAt,
    closeAt,
  };
};

const decoratePublicSlots = (slots, date = new Date(), now = new Date()) => {
  const { isClosed } = getPublicLinkStatus(date, now);

  return slots.map((slot) => {
    const graceEndsAt = getSlotBoundary(date, slot.startTime);
    graceEndsAt.setMinutes(graceEndsAt.getMinutes() + 30);

    const isExpired = isClosed || now >= graceEndsAt;
    const reason = slot.reason || (isExpired ? "Time closed" : null);

    return {
      ...slot,
      isExpired,
      isBreak: slot.isBreak || isExpired,
      reason,
    };
  });
};

const isPublicBookableSlot = (startTime, endTime, date = new Date(), now = new Date()) => {
  if (getPublicLinkStatus(date, now).isClosed) {
    return false;
  }

  return decoratePublicSlots(generateSlots(), date, now).some(
    (slot) =>
      slot.startTime === startTime &&
      slot.endTime === endTime &&
      !slot.isBreak &&
      !slot.isExpired
  );
};

module.exports = {
  generateSlots,
  isBookableSlot,
  decoratePublicSlots,
  getPublicLinkStatus,
  isPublicBookableSlot,
};
