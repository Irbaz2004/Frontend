const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for auth headers
function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== BOOKING & AVAILABILITY ====================

/**
 * Check available slots for a doctor
 * @param {string} doctorId - Doctor's business ID
 * @param {string} date - Date in YYYY-MM-DD format
 */
export async function getAvailableSlots(doctorId, date) {
    try {
        const response = await fetch(
            `${API_BASE}/appointments/available-slots?doctorId=${doctorId}&date=${date}`,
            { headers: authHeaders() }
        );
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch available slots',
                status: response.status
            };
        }
        return result; // Returns { date, doctorId, availableSlots, consultationFee, requiresApproval, totalSlots }
    } catch (error) {
        console.error('getAvailableSlots error:', error);
        throw error;
    }
}

/**
 * Book an appointment
 * @param {object} appointmentData - { doctorId, date, time, reason }
 */
export async function bookAppointment(appointmentData) {
    try {
        const response = await fetch(`${API_BASE}/appointments/book`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(appointmentData)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to book appointment',
                status: response.status
            };
        }
        return result; // Returns { message, appointment, requiresApproval }
    } catch (error) {
        console.error('bookAppointment error:', error);
        throw error;
    }
}

// ==================== VIEW APPOINTMENTS ====================

/**
 * Get user's appointments
 * @param {object} filters - { status, upcoming }
 */
export async function getMyAppointments(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.upcoming) params.append('upcoming', filters.upcoming);

        const url = `${API_BASE}/appointments/user${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch appointments',
                status: response.status
            };
        }
        return result; // Returns { total, grouped, appointments }
    } catch (error) {
        console.error('getMyAppointments error:', error);
        throw error;
    }
}

/**
 * Get upcoming appointments
 */
export async function getUpcomingAppointments() {
    try {
        return await getMyAppointments({ upcoming: true });
    } catch (error) {
        console.error('getUpcomingAppointments error:', error);
        throw error;
    }
}

/**
 * Get appointment details
 * @param {string} appointmentId
 */
export async function getAppointmentDetails(appointmentId) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch appointment details',
                status: response.status
            };
        }
        return result; // Returns full appointment details with doctor info
    } catch (error) {
        console.error('getAppointmentDetails error:', error);
        throw error;
    }
}

// ==================== MANAGE APPOINTMENTS ====================

/**
 * Cancel an appointment
 * @param {string} appointmentId
 */
export async function cancelAppointment(appointmentId) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
            method: 'PUT',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to cancel appointment',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('cancelAppointment error:', error);
        throw error;
    }
}

/**
 * Reschedule an appointment
 * @param {string} appointmentId
 * @param {object} newSlot - { date, time }
 */
export async function rescheduleAppointment(appointmentId, newSlot) {
    try {
        // First cancel old appointment
        await cancelAppointment(appointmentId);

        // Then book new one with same doctor
        const details = await getAppointmentDetails(appointmentId);
        return await bookAppointment({
            doctorId: details.doctor.id,
            date: newSlot.date,
            time: newSlot.time,
            reason: details.reason
        });
    } catch (error) {
        console.error('rescheduleAppointment error:', error);
        throw error;
    }
}

// ==================== DOCTOR SPECIFIC (for patients) ====================

/**
 * Get doctor's profile with availability
 * @param {string} doctorId
 */
export async function getDoctorProfile(doctorId) {
    try {
        const response = await fetch(`${API_BASE}/businesses/${doctorId}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch doctor profile',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getDoctorProfile error:', error);
        throw error;
    }
}

/**
 * Get doctor's reviews
 * @param {string} doctorId
 */
export async function getDoctorReviews(doctorId) {
    try {
        const profile = await getDoctorProfile(doctorId);
        return profile.reviews || [];
    } catch (error) {
        console.error('getDoctorReviews error:', error);
        return [];
    }
}

// ==================== HISTORY & STATS ====================

/**
 * Get appointment history
 */
export async function getAppointmentHistory() {
    try {
        const appointments = await getMyAppointments();
        return appointments.appointments || [];
    } catch (error) {
        console.error('getAppointmentHistory error:', error);
        return [];
    }
}

/**
 * Get appointment statistics for user
 */
export async function getUserAppointmentStats() {
    try {
        const appointments = await getMyAppointments();
        const all = appointments.appointments || [];

        return {
            total: all.length,
            upcoming: all.filter(a => a.status === 'approved' && new Date(a.date) >= new Date()).length,
            pending: all.filter(a => a.status === 'pending').length,
            completed: all.filter(a => a.status === 'completed').length,
            cancelled: all.filter(a => a.status === 'cancelled').length,
            rejected: all.filter(a => a.status === 'rejected').length
        };
    } catch (error) {
        console.error('getUserAppointmentStats error:', error);
        return {
            total: 0,
            upcoming: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
            rejected: 0
        };
    }
}

// ==================== REMINDERS ====================

/**
 * Set reminder for appointment
 * @param {string} appointmentId
 * @param {number} minutesBefore - Minutes before appointment to remind
 */
export async function setAppointmentReminder(appointmentId, minutesBefore = 60) {
    try {
        // This would integrate with your notification system
        // For now, store in localStorage
        const reminders = JSON.parse(localStorage.getItem('appointment_reminders') || '{}');
        reminders[appointmentId] = {
            minutesBefore,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('appointment_reminders', JSON.stringify(reminders));

        return { success: true };
    } catch (error) {
        console.error('setAppointmentReminder error:', error);
        throw error;
    }
}

/**
 * Remove reminder
 * @param {string} appointmentId
 */
export async function removeReminder(appointmentId) {
    try {
        const reminders = JSON.parse(localStorage.getItem('appointment_reminders') || '{}');
        delete reminders[appointmentId];
        localStorage.setItem('appointment_reminders', JSON.stringify(reminders));
        return { success: true };
    } catch (error) {
        console.error('removeReminder error:', error);
        throw error;
    }
}

// ==================== DOCTOR DASHBOARD (for doctors) ====================

/**
 * Get doctor's appointments (for doctor dashboard)
 * @param {object} filters - { date, status }
 */
export async function getDoctorAppointments(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.status) params.append('status', filters.status);

        const url = `${API_BASE}/appointments/doctor${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch doctor appointments',
                status: response.status
            };
        }
        return result; // Returns { total, byDate, appointments }
    } catch (error) {
        console.error('getDoctorAppointments error:', error);
        throw error;
    }
}

/**
 * Get today's appointments (for doctor dashboard)
 */
export async function getTodayAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments/doctor/today`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch today\'s appointments',
                status: response.status
            };
        }
        return result; // Returns { date, total, upcoming, passed, nextAppointment }
    } catch (error) {
        console.error('getTodayAppointments error:', error);
        throw error;
    }
}

/**
 * Approve an appointment (doctor only)
 * @param {string} appointmentId
 */
export async function approveAppointment(appointmentId) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/approve`, {
            method: 'PUT',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to approve appointment',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('approveAppointment error:', error);
        throw error;
    }
}

/**
 * Reject an appointment (doctor only)
 * @param {string} appointmentId
 * @param {string} reason - Rejection reason
 */
export async function rejectAppointment(appointmentId, reason) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/reject`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ reason })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to reject appointment',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('rejectAppointment error:', error);
        throw error;
    }
}

/**
 * Complete an appointment (doctor only)
 * @param {string} appointmentId
 * @param {object} data - { notes, prescription }
 */
export async function completeAppointment(appointmentId, data) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/complete`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to complete appointment',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('completeAppointment error:', error);
        throw error;
    }
}

/**
 * Get appointment statistics (doctor only)
 */
export async function getDoctorAppointmentStats() {
    try {
        const response = await fetch(`${API_BASE}/appointments/doctor/stats`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch appointment stats',
                status: response.status
            };
        }
        return result; // Returns { today, pending, approved, completed, cancelled, monthly, completionRate }
    } catch (error) {
        console.error('getDoctorAppointmentStats error:', error);
        throw error;
    }
}

// ==================== UTILITIES ====================

/**
 * Format appointment for display
 * @param {object} appointment - Raw appointment data
 */
export function formatAppointment(appointment) {
    if (!appointment) return null;

    const date = new Date(appointment.date);
    const now = new Date();
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);

    return {
        ...appointment,
        formattedDate: date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        formattedTime: appointment.time,
        doctorName: appointment.doctor?.doctorName || appointment.doctor?.businessName,
        statusColor: getStatusColor(appointment.status),
        statusText: getStatusText(appointment.status),
        canCancel: ['pending', 'approved'].includes(appointment.status) && appointmentDate > now,
        canReschedule: ['pending', 'approved'].includes(appointment.status) && appointmentDate > now,
        isPast: appointmentDate < now,
        isToday: date.toDateString() === now.toDateString()
    };
}

/**
 * Get status color
 * @param {string} status
 */
function getStatusColor(status) {
    const colors = {
        'pending': 'orange',
        'approved': 'green',
        'rejected': 'red',
        'cancelled': 'gray',
        'completed': 'blue'
    };
    return colors[status] || 'gray';
}

/**
 * Get status text
 * @param {string} status
 */
function getStatusText(status) {
    const texts = {
        'pending': 'Awaiting Approval',
        'approved': 'Confirmed',
        'rejected': 'Rejected',
        'cancelled': 'Cancelled',
        'completed': 'Completed'
    };
    return texts[status] || status;
}

/**
 * Get time slots for a day
 * @param {string} startTime - "09:00"
 * @param {string} endTime - "17:00"
 * @param {number} duration - Minutes per slot (default 30)
 */
export function generateTimeSlots(startTime, endTime, duration = 30) {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let current = new Date();
    current.setHours(startHour, startMin, 0);

    const end = new Date();
    end.setHours(endHour, endMin, 0);

    while (current < end) {
        const timeStr = current.toTimeString().slice(0, 5);
        slots.push(timeStr);

        current.setMinutes(current.getMinutes() + duration);
    }

    return slots;
}

/**
 * Check if time slot is available
 * @param {string} time - "09:30"
 * @param {array} bookedSlots - Array of booked times
 */
export function isSlotAvailable(time, bookedSlots = []) {
    return !bookedSlots.includes(time);
}

/**
 * Group appointments by date
 * @param {array} appointments
 */
export function groupAppointmentsByDate(appointments) {
    return appointments.reduce((groups, appointment) => {
        const date = appointment.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(formatAppointment(appointment));
        return groups;
    }, {});
}

/**
 * Get upcoming appointments count
 * @param {array} appointments
 */
export function getUpcomingCount(appointments) {
    const now = new Date();
    return appointments.filter(a => {
        const appDate = new Date(`${a.date}T${a.time}`);
        return appDate > now && (a.status === 'approved' || a.status === 'pending');
    }).length;
}