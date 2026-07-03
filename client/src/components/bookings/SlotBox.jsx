const SlotBox = ({ slots, selectedSlot, onSelect }) => {
  return (
    <section className="booking-section">
      <h2>Select Slot</h2>

      <div className="slot-grid">
        {slots.map((slot) => (
          <button
            key={slot.startTime}
            onClick={() => onSelect(slot)}
            className={`slot-btn ${
              selectedSlot?.startTime === slot.startTime ? "is-active" : ""
            }`}
          >
            {slot.startTime} - {slot.endTime}
          </button>
        ))}
      </div>
    </section>
  );
};

export default SlotBox;
