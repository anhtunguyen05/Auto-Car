// Main JavaScript for Car Rental Management System

// Delete Car
function deleteCar(carId) {
    if (confirm('Are you sure you want to delete this car?')) {
        fetch(`/api/v1/cars/${carId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Car deleted successfully!');
                window.location.reload();
            } else {
                alert('Error deleting car: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    }
}

// Delete User
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User deleted successfully!');
                window.location.reload();
            } else {
                alert('Error deleting user: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    }
}

// Confirm Booking
function confirmBooking(bookingId) {
    if (confirm('Are you sure you want to confirm this booking?')) {
        fetch(`/api/v1/bookings/${bookingId}/confirm`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Booking confirmed successfully!');
                window.location.reload();
            } else {
                alert('Error confirming booking: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    }
}

// Cancel Booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        fetch(`/api/v1/bookings/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Booking cancelled successfully!');
                window.location.reload();
            } else {
                alert('Error cancelling booking: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    }
}

// Filter by Status (Cars)
function filterByStatus(status) {
    const url = new URL(window.location);
    if (status) {
        url.searchParams.set('status', status);
    } else {
        url.searchParams.delete('status');
    }
    window.location.href = url.toString();
}

// Filter by Role (Users)
function filterByRole(role) {
    const url = new URL(window.location);
    if (role) {
        url.searchParams.set('role', role);
    } else {
        url.searchParams.delete('role');
    }
    window.location.href = url.toString();
}

// Auto-dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});

// Form validation
(function() {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
})();

// Password confirmation validation
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');

if (passwordField && confirmPasswordField) {
    confirmPasswordField.addEventListener('input', function() {
        if (passwordField.value !== confirmPasswordField.value) {
            confirmPasswordField.setCustomValidity('Passwords do not match');
        } else {
            confirmPasswordField.setCustomValidity('');
        }
    });
}

// Image preview for file inputs
const imageInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
imageInputs.forEach(input => {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const previewId = input.id + 'Preview';
                let preview = document.getElementById(previewId);
                
                if (!preview) {
                    preview = document.createElement('img');
                    preview.id = previewId;
                    preview.className = 'img-thumbnail mt-2';
                    preview.style.maxWidth = '200px';
                    input.parentNode.appendChild(preview);
                }
                
                preview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Set minimum date for date inputs to today
document.addEventListener('DOMContentLoaded', function() {
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
    const today = new Date().toISOString().slice(0, 16);
    
    dateInputs.forEach(input => {
        if (input.id === 'startDate' || input.id === 'endDate') {
            input.min = today;
        }
    });
});
