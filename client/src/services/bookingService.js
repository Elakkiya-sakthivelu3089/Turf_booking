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
  generatePublicBookingLink: async (date) => {
    const res = await fetch(`${API_BASE_URL}/bookings/links`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ date }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to generate booking link");
    }

    return data;
  },

  registerPublicEmployee: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/bookings/public/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Employee registration failed");
    }

    return data;
  },

  getPublicBookingPage: async (token) => {
    const res = await fetch(`${API_BASE_URL}/bookings/public/${token}`, {
      method: "GET",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load bookings");
    }

    return data;
  },

  joinPublicBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE_URL}/bookings/public/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Booking failed");
    }

    return data;
  },

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
