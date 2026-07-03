const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
};

export const bookingService = {
  getBookingPage: async (date) => {
    const res = await fetch(`${API_BASE_URL}/bookings?date=${date}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load bookings");
    }

    return data;
  },

  joinBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE_URL}/bookings/join`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Booking failed");
    }

    return data;
  },

  cancelBooking: async (bookingPlayerId) => {
    const res = await fetch(`${API_BASE_URL}/bookings/cancel/${bookingPlayerId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Cancel failed");
    }

    return data;
  },

  getAllBookings: async (date) => {
    const query = date ? `?date=${date}` : "";
    const res = await fetch(`${API_BASE_URL}/bookings/all${query}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load booking report");
    }

    return data;
  },

  getMyBookings: async () => {
    const res = await fetch(`${API_BASE_URL}/bookings/mine`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load your bookings");
    }

    return data;
  },
};
