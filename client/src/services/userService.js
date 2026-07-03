const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const userService = {
  listUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load users");
    }

    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load user details");
    }

    return data;
  },

  createUser: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to create user");
    }

    return data;
  },

  updateUser: async (id, payload) => {
    const path = id ? `/users/${id}` : "/users/me";
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update user");
    }

    return data;
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to delete user");
    }

    return data;
  },
};
