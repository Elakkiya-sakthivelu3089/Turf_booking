const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const reportService = {
  getAdminReport: async (date) => {
    const query = date ? `?date=${date}` : "";
    const res = await fetch(`${API_BASE_URL}/reports/admin${query}`, {
      headers: getHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load admin report");
    }

    return data;
  },

  getEmployeeReport: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/employee`, {
      headers: getHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load employee report");
    }

    return data;
  },
};
