import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import {
  getAppointments,
  getAppointmentById,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctors,
  getPatients,
} from "../services/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    status: "Booked",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadAppointmentData();
  }, []);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentsData, doctorsData, patientsData] =
        await Promise.all([
          getAppointments(),
          getDoctors(),
          getPatients(),
        ]);

      setAppointments(appointmentsData);
      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch (error) {
      console.error("Error loading appointment data:", error);
      setError(
        "Unable to load appointment data. Please make sure the server is running."
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

    setFormError("");
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      doctorId: "",
      date: "",
      time: "",
      reason: "",
      status: "Booked",
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
    if (!formData.patientId) {
      return "Please select a patient.";
    }

    if (!formData.doctorId) {
      return "Please select a doctor.";
    }

    if (!formData.date) {
      return "Please select a date.";
    }

    const today = new Date().toISOString().split("T")[0];

    if (formData.date < today) {
      return "Appointment date cannot be in the past.";
    }

    if (!formData.time) {
      return "Please select a time.";
    }

    if (!formData.reason.trim()) {
      return "Please enter a reason.";
    }

    const validStatuses = [
      "Booked",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!validStatuses.includes(formData.status)) {
      return "Please select a valid appointment status.";
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

    const selectedDoctor = doctors.find(
      (doctor) => String(doctor.id) === String(formData.doctorId)
    );

    if (!selectedDoctor) {
      setFormError("Selected doctor could not be found.");
      return;
    }

    if (!selectedDoctor.available) {
      const currentAppointment = editingId
        ? appointments.find(
            (appointment) =>
              String(appointment.id) === String(editingId)
          )
        : null;

      const doctorWasChanged =
        !currentAppointment ||
        String(currentAppointment.doctorId) !==
          String(formData.doctorId);

      if (doctorWasChanged) {
        setFormError(
          "This doctor is currently unavailable. Please select another doctor."
        );
        return;
      }
    }

    try {
      setFormError("");

      const appointmentData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        reason: formData.reason.trim(),
        status: formData.status,
      };

      if (editingId) {
        await updateAppointment(editingId, appointmentData);
        setSuccessMessage("Appointment updated successfully.");
      } else {
        await addAppointment(appointmentData);
        setSuccessMessage("Appointment booked successfully.");
      }

      closeForm();
      await loadAppointmentData();
    } catch (error) {
      console.error("Error saving appointment:", error);
      setFormError("Unable to save appointment. Please try again.");
    }
  };

  const handleEdit = async (id) => {
    const selectedAppointment = appointments.find(
      (appointment) => String(appointment.id) === String(id)
    );

    if (selectedAppointment?.status === "Cancelled") {
      setError(
        "Cancelled appointments cannot be edited. Please create a new appointment."
      );
      return;
    }

    try {
      setError("");

      const appointment = await getAppointmentById(id);

      setFormData({
        patientId: appointment.patientId || "",
        doctorId: appointment.doctorId || "",
        date: appointment.date || "",
        time: appointment.time || "",
        reason: appointment.reason || "",
        status: appointment.status || "Booked",
      });

      setEditingId(id);
      setShowForm(true);
      setSuccessMessage("");
    } catch (error) {
      console.error("Error loading appointment:", error);
      setError("Unable to load appointment details.");
    }
  };

  const handleDelete = async (id) => {
    const selectedAppointment = appointments.find(
      (appointment) => String(appointment.id) === String(id)
    );

    const message =
      selectedAppointment?.status === "Cancelled"
        ? "Are you sure you want to delete this cancelled appointment?"
        : "Are you sure you want to cancel this appointment?";

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      await deleteAppointment(id);
      setSuccessMessage("Appointment cancelled successfully.");
      await loadAppointmentData();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setError("Unable to cancel appointment. Please try again.");
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(
      (item) => String(item.id) === String(patientId)
    );

    return patient ? patient.name : patientId;
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(
      (item) => String(item.id) === String(doctorId)
    );

    return doctor ? doctor.name : doctorId;
  };

  const getDoctorDisplayName = (doctor) => {
    const availability = doctor.available
      ? "Available"
      : "Unavailable";

    return `${doctor.name} - ${doctor.specialization} - ${availability}`;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesDate =
      selectedDate === "" || appointment.date === selectedDate;

    const matchesStatus =
      selectedStatus === "All" ||
      appointment.status === selectedStatus;

    return matchesDate && matchesStatus;
  });

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedStatus("All");
  };

  if (loading) {
    return (
      <div className="page-status">
        <h2>Loading appointments...</h2>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="page-status">
        <h2>Appointments</h2>
        <p>{error}</p>

        <button className="primary-button" onClick={loadAppointmentData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main-area">
        <Navbar />

        <main className="appointments-page">
          <div className="page-header">
            <div>
              <h2>Appointments</h2>
              <p>Manage and schedule patient appointments.</p>
            </div>

            <button
              className="primary-button"
              onClick={openAddForm}
            >
              + Book Appointment
            </button>
          </div>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {error && appointments.length > 0 && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="appointment-filters">
            <div className="filter-group">
              <label htmlFor="filter-date">Date</label>

              <input
                id="filter-date"
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
              />
            </div>

            <div className="filter-group">
              <label htmlFor="filter-status">Status</label>

              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value)
                }
              >
                <option value="All">All Statuses</option>
                <option value="Booked">Booked</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
              disabled={
                selectedDate === "" && selectedStatus === "All"
              }
            >
              Clear Filters
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-state">
              <h3>No appointments found.</h3>
              <p>Book an appointment to get started.</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <h3>No appointments found for the selected filters.</h3>
              <p>Try changing the date or status filter.</p>

              <button
                type="button"
                className="secondary-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="appointments-page-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>

                      <td>
                        {getPatientName(appointment.patientId)}
                      </td>

                      <td>
                        {getDoctorName(appointment.doctorId)}
                      </td>

                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.reason}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            appointment.status
                              ? appointment.status.toLowerCase()
                              : ""
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(appointment.id)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(appointment.id)
                            }
                          >
                            {appointment.status === "Cancelled"
                              ? "Delete"
                              : "Cancel / Delete"}
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
              <div className="appointment-form-modal">
                <div className="modal-header">
                  <div>
                    <h3>
                      {editingId
                        ? "Edit Appointment"
                        : "Book Appointment"}
                    </h3>

                    <p>
                      {editingId
                        ? "Update appointment information."
                        : "Enter appointment information."}
                    </p>
                  </div>

                  <button
                    className="close-button"
                    onClick={closeForm}
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="appointment-form"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="patientId">
                        Patient
                      </label>

                      <select
                        id="patientId"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleInputChange}
                      >
                        <option value="">
                          Select patient
                        </option>

                        {patients.map((patient) => (
                          <option
                            key={patient.id}
                            value={patient.id}
                          >
                            {patient.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="doctorId">
                        Doctor
                      </label>

                      <select
                        id="doctorId"
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleInputChange}
                      >
                        <option value="">
                          Select doctor
                        </option>

                        {doctors.map((doctor) => (
                          <option
                            key={doctor.id}
                            value={doctor.id}
                          >
                            {getDoctorDisplayName(doctor)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">Date</label>

                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="time">Time</label>

                      <input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="reason">
                        Reason
                      </label>

                      <textarea
                        id="reason"
                        name="reason"
                        rows="4"
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Enter reason for appointment"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">
                        Status
                      </label>

                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Booked">
                          Booked
                        </option>
                        <option value="Confirmed">
                          Confirmed
                        </option>
                        <option value="Completed">
                          Completed
                        </option>
                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>
                    </div>
                  </div>

                  {formError && (
                    <p className="form-error">
                      {formError}
                    </p>
                  )}

                  {doctors.length === 0 && (
                    <p className="form-error">
                      No doctors are available. Please add a doctor
                      first.
                    </p>
                  )}

                  {patients.length === 0 && (
                    <p className="form-error">
                      No patients are available. Please add a patient
                      first.
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

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        doctors.length === 0 ||
                        patients.length === 0
                      }
                    >
                      {editingId
                        ? "Update Appointment"
                        : "Book Appointment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Appointments;