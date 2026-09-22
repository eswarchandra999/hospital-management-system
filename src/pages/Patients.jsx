import { useEffect, useState } from "react";
import {
  getPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
} from "../services/api";

function Patients() {
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error loading patients:", error);
      setError(
        "Unable to load patients. Please make sure the server is running."
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

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
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

    if (!formData.age) {
      return "Age is required.";
    }

    const age = Number(formData.age);

    if (isNaN(age) || age < 1 || age > 120) {
      return "Age must be between 1 and 120.";
    }

    if (!formData.gender) {
      return "Gender is required.";
    }

    if (!formData.phone.trim()) {
      return "Phone is required.";
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(formData.phone.trim())) {
      return "Phone must contain exactly 10 digits.";
    }

    if (!formData.email.trim()) {
      return "Email is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email.trim())) {
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

      const patientData = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      };

      if (editingId) {
        await updatePatient(editingId, patientData);
        setSuccessMessage("Patient updated successfully.");
      } else {
        await addPatient(patientData);
        setSuccessMessage("Patient added successfully.");
      }

      closeForm();
      await loadPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      setFormError("Unable to save patient. Please try again.");
    }
  };

  const handleEdit = async (id) => {
    try {
      setError("");

      const patient = await getPatientById(id);

      setFormData({
        name: patient.name || "",
        age: patient.age ?? "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
      });

      setEditingId(id);
      setShowForm(true);
      setSuccessMessage("");
    } catch (error) {
      console.error("Error loading patient:", error);
      setError("Unable to load patient details.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePatient(id);
      setSuccessMessage("Patient deleted successfully.");
      await loadPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      setError("Unable to delete patient. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="page-status">
        <h2>Loading patients...</h2>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="page-status">
        <h2>Patients</h2>
        <p>{error}</p>

        <button className="primary-button" onClick={loadPatients}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <div className="page-header">
        <div>
          <h2>Patients</h2>
          <p>Manage hospital patient information.</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Add Patient
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {error && patients.length > 0 && (
        <div className="error-message">
          {error}
        </div>
      )}

      {patients.length === 0 ? (
        <div className="empty-state">
          <h3>No patients found.</h3>
          <p>Add a patient to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="patients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.email}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(patient.id)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(patient.id)}
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
          <div className="patient-form-modal">
            <div className="modal-header">
              <div>
                <h3>{editingId ? "Edit Patient" : "Add Patient"}</h3>
                <p>
                  {editingId
                    ? "Update patient information."
                    : "Enter patient information."}
                </p>
              </div>

              <button className="close-button" onClick={closeForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="patient-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patient-name">Name</label>

                  <input
                    id="patient-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter patient name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="patient-age">Age</label>

                  <input
                    id="patient-age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patient-gender">Gender</label>

                  <select
                    id="patient-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="patient-phone">Phone</label>

                  <input
                    id="patient-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patient-email">Email</label>

                  <input
                    id="patient-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {formError && (
                <p className="form-error">
                  {formError}
                </p>
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
                  {editingId ? "Update Patient" : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;