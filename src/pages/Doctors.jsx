import { useEffect, useState } from "react";
import {
  getDoctors,
  getDoctorById,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} from "../services/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    phone: "",
    email: "",
    available: true,
  });

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Error loading doctors:", error);
      setError(
        "Unable to load doctors. Please make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      available: event.target.value === "true",
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      experience: "",
      phone: "",
      email: "",
      available: true,
    });

    setEditingId(null);
    setFormError("");
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
    setSuccessMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Name is required.";
    }

    if (!formData.specialization.trim()) {
      return "Specialization is required.";
    }

    if (formData.experience === "") {
      return "Experience is required.";
    }

    if (Number(formData.experience) < 0) {
      return "Experience cannot be negative.";
    }

    if (!formData.phone.trim()) {
      return "Phone is required.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    try {
      setFormError("");

      const doctorData = {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        experience: Number(formData.experience),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        available: formData.available,
      };

      if (editingId) {
        await updateDoctor(editingId, doctorData);
        setSuccessMessage("Doctor updated successfully.");
      } else {
        await addDoctor(doctorData);
        setSuccessMessage("Doctor added successfully.");
      }

      closeForm();
      await loadDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      setFormError("Unable to save doctor. Please try again.");
    }
  };

  const handleEdit = async (id) => {
    try {
      setError("");

      const doctor = await getDoctorById(id);

      setFormData({
        name: doctor.name || "",
        specialization: doctor.specialization || "",
        experience: doctor.experience ?? "",
        phone: doctor.phone || "",
        email: doctor.email || "",
        available: doctor.available ?? true,
      });

      setEditingId(id);
      setShowForm(true);
      setSuccessMessage("");
    } catch (error) {
      console.error("Error loading doctor:", error);
      setError("Unable to load doctor details.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoctor(id);
      setSuccessMessage("Doctor deleted successfully.");
      await loadDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      setError("Unable to delete doctor. Please try again.");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.specialization
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-status">
        <h2>Loading doctors...</h2>
      </div>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <div className="page-status">
        <h2>Doctors</h2>
        <p>{error}</p>

        <button className="primary-button" onClick={loadDoctors}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div>
          <h2>Doctors</h2>
          <p>Manage hospital doctors and their availability.</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Add Doctor
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {error && doctors.length > 0 && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="search-section">
        <div className="search-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search by specialization..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <button
            type="button"
            className="clear-button"
            onClick={handleClearSearch}
            disabled={!searchTerm}
          >
            Clear
          </button>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="empty-state">
          <h3>No doctors found.</h3>
          <p>Add a doctor to get started.</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="empty-state">
          <h3>No doctors found for this specialization.</h3>
          <p>Try a different specialization or clear the search.</p>

          <button
            type="button"
            className="secondary-button"
            onClick={handleClearSearch}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="doctors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.experience} years</td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.email}</td>

                  <td>
                    {doctor.available ? (
                      <span className="availability-badge available">
                        Available
                      </span>
                    ) : (
                      <span className="availability-badge unavailable">
                        Unavailable
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(doctor.id)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="doctor-form-modal">
            <div className="modal-header">
              <div>
                <h3>
                  {editingId ? "Edit Doctor" : "Add Doctor"}
                </h3>

                <p>
                  {editingId
                    ? "Update doctor information."
                    : "Enter doctor information."}
                </p>
              </div>

              <button className="close-button" onClick={closeForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="doctor-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter doctor name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="specialization">
                    Specialization
                  </label>

                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="Enter specialization"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="experience">
                    Experience
                  </label>

                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Years of experience"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="available">
                    Availability
                  </label>

                  <select
                    id="available"
                    name="available"
                    value={String(formData.available)}
                    onChange={handleAvailabilityChange}
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="form-error">{formError}</p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId ? "Update Doctor" : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;