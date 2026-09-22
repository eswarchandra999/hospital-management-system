import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import {
  getDoctors,
  getPatients,
  getAppointments,
} from "../services/api";

function Dashboard() {
  const location = useLocation();
  const role = location.state?.role || "Admin";

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [doctorsData, patientsData, appointmentsData] =
          await Promise.all([
            getDoctors(),
            getPatients(),
            getAppointments(),
          ]);

        setDoctors(doctorsData);
        setPatients(patientsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        setError(
          "Unable to load dashboard data. Please make sure the server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main-area">
        <Navbar />

        <main className="main-content">
          <section className="dashboard-welcome">
            <h2>Welcome, {role}</h2>
            <p>
              Manage patients, doctors, appointments and hospital services
              efficiently.
            </p>
          </section>

          <section className="card-grid">
            <Card
              title="Total Doctors"
              value={doctors.length}
              icon="D"
            />

            <Card
              title="Total Patients"
              value={patients.length}
              icon="P"
            />

            <Card
              title="Total Appointments"
              value={appointments.length}
              icon="A"
            />

            <Card
              title="Confirmed Appointments"
              value={confirmedAppointments}
              icon="C"
            />
          </section>

          <section className="dashboard-empty-states">
            {doctors.length === 0 && (
              <p className="empty-message">No doctors available</p>
            )}

            {patients.length === 0 && (
              <p className="empty-message">No patients available</p>
            )}

            {appointments.length === 0 && (
              <p className="empty-message">No appointments available</p>
            )}
          </section>

          <section className="appointments-section">
            <div className="section-header">
              <div>
                <h3>Recent Appointments</h3>
                <p>Latest appointment information</p>
              </div>
            </div>

            <div className="table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Doctor ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.length > 0 ? (
                    appointments.slice(0, 5).map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.patientId}</td>
                        <td>{appointment.doctorId}</td>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="table-empty">
                        No appointments available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;