import { useEffect, useState } from "react";
import { userService } from "../services/userService";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "EMPLOYEE",
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setError("");
      const data = await userService.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitUser = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };
      if (editingId && !payload.password) {
        delete payload.password;
      }

      if (editingId) {
        await userService.updateUser(editingId, payload);
      } else {
        await userService.createUser(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const editUser = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role: user.role || "EMPLOYEE",
    });
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? This will also cancel this person's active bookings.`
    );

    if (!confirmed) return;

    try {
      await userService.deleteUser(user.id);
      loadUsers();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <main className="app-page compact-page">
      <div className="page-header">
        <p className="eyebrow">Admin panel</p>
        <h1>User Details</h1>
      </div>

      {error && <p className="alert-error">{error}</p>}

      <section className="admin-form-card">
        <h2>{editingId ? "Edit User" : "Add User"}</h2>
        <form className="inline-form user-form" onSubmit={submitUser}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input
            name="password"
            type="password"
            placeholder={editingId ? "New password optional" : "Password"}
            value={form.password}
            onChange={handleChange}
            required={!editingId}
          />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="primary-btn" type="submit">
            {editingId ? "Update User" : "Add User"}
          </button>
          {editingId && (
            <button
              className="secondary-btn"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="table-card">
        <h2>User List</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || "-"}</td>
                <td>{user.role}</td>
                <td className="table-actions">
                  <button className="secondary-btn" onClick={() => editUser(user)}>Edit</button>
                  <button className="danger-btn" onClick={() => deleteUser(user)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default UsersPage;
