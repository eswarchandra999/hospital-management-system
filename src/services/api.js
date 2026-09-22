const API_URL = "http://localhost:3000";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

// --------------------
// Doctors
// --------------------

export async function getDoctors() {
  return request(`${API_URL}/doctors`);
}

export async function getDoctorById(id) {
  return request(`${API_URL}/doctors/${id}`);
}

export async function addDoctor(doctor) {
  return request(`${API_URL}/doctors`, {
    method: "POST",
    body: JSON.stringify(doctor),
  });
}

export async function updateDoctor(id, doctor) {
  return request(`${API_URL}/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(doctor),
  });
}

export async function deleteDoctor(id) {
  return request(`${API_URL}/doctors/${id}`, {
    method: "DELETE",
  });
}

// --------------------
// Patients
// --------------------

export async function getPatients() {
  return request(`${API_URL}/patients`);
}

export async function getPatientById(id) {
  return request(`${API_URL}/patients/${id}`);
}

export async function addPatient(patient) {
  return request(`${API_URL}/patients`, {
    method: "POST",
    body: JSON.stringify(patient),
  });
}

export async function updatePatient(id, patient) {
  return request(`${API_URL}/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patient),
  });
}

export async function deletePatient(id) {
  return request(`${API_URL}/patients/${id}`, {
    method: "DELETE",
  });
}

// --------------------
// Appointments
// --------------------

export async function getAppointments() {
  return request(`${API_URL}/appointments`);
}

export async function getAppointmentById(id) {
  return request(`${API_URL}/appointments/${id}`);
}

export async function addAppointment(appointment) {
  return request(`${API_URL}/appointments`, {
    method: "POST",
    body: JSON.stringify(appointment),
  });
}

export async function updateAppointment(id, appointment) {
  return request(`${API_URL}/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointment),
  });
}

export async function deleteAppointment(id) {
  return request(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
  });
}