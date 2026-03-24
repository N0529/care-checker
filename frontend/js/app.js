const API_BASE = 'http://127.0.0.1:5000/api';
let map = null;
let markers = [];
let hospitals = [];

// Initialize Map
function initMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5); // Center of India
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; Carto'
    }).addTo(map);
}

// Fetch and Render Hospitals
async function fetchHospitals(query = '') {
    try {
        const res = await fetch(`${API_BASE}/hospitals?q=${query}`);
        hospitals = await res.json();
        renderHospitals();
        updateMapMarkers();
        document.getElementById('hospital-count').textContent = hospitals.length;
    } catch (err) {
        console.error('Error fetching hospitals:', err);
    }
}

function renderHospitals() {
    const list = document.getElementById('hospitals-list');
    list.innerHTML = '';
    
    if (hospitals.length === 0) {
        list.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top: 2rem;">No hospitals found.</p>';
        return;
    }

    hospitals.forEach(h => {
        const card = document.createElement('div');
        card.className = 'hospital-card glass';
        card.innerHTML = `
            <h3>${h.name}</h3>
            <div class="hospital-address">${h.address}</div>
            <div class="hospital-meta">
                <div class="rating-pill">
                    <i class="ph ph-star-fill"></i>
                    ${h.average_rating > 0 ? h.average_rating.toFixed(1) : 'New'} (${h.review_count})
                </div>
                <button class="btn primary" onclick="openReviewModal(${h.id}, '${h.name.replace(/'/g, "\\'")}')">Review</button>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                map.flyTo([h.latitude, h.longitude], 12, { duration: 1 });
                // open corresponding popup
                const marker = markers.find(m => m.options.hospitalId === h.id);
                if (marker) marker.openPopup();
            }
        });
        list.appendChild(card);
    });
}

function updateMapMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    // Custom hospital icon
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:var(--primary); color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(79,70,229,0.5);"><i class="ph ph-hospital" style="font-size:1.2rem;"></i></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });

    hospitals.forEach(h => {
        const popup = `
            <div style="font-family:'Inter',sans-serif; text-align:center;">
                <h4 style="margin:0 0 5px 0; color:#fff;">${h.name}</h4>
                <p style="margin:0 0 10px 0; font-size:13px; color:#94a3b8;">
                    <i class="ph ph-star-fill" style="color:#facc15"></i> 
                    ${h.average_rating > 0 ? h.average_rating.toFixed(1) : 'New'} (${h.review_count} reviews)
                </p>
                <button onclick="openReviewModal(${h.id}, '${h.name.replace(/'/g, "\\'")}')" 
                        class="btn primary" style="font-size:0.8rem; padding:0.3rem 0.8rem;">
                    Submit Review
                </button>
            </div>
        `;
        const marker = L.marker([h.latitude, h.longitude], {icon: customIcon, hospitalId: h.id})
            .bindPopup(popup)
            .addTo(map);
        markers.push(marker);
    });
}

// Admin Summary
async function loadAdminSummary() {
    try {
        const res = await fetch(`${API_BASE}/admin/summary`);
        const data = await res.json();
        
        animateValue('admin-total-hospitals', 0, data.total_hospitals, 1000);
        document.getElementById('admin-avg-rating').textContent = Number(data.average_rating).toFixed(1);
        animateValue('admin-total-reviews', 0, data.total_reviews, 1000);
        
    } catch (err) {
        console.error('Error fetching admin summary:', err);
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end; // ensure exact final value
        }
    };
    window.requestAnimationFrame(step);
}

// Modal & Form Logic
const modal = document.getElementById('review-modal');

window.openReviewModal = function(id, name) {
    document.getElementById('modal-hospital-name').textContent = `Rate ${name}`;
    document.getElementById('review-hospital-id').value = id;
    document.getElementById('wait-time-input').value = '';
    document.getElementById('billing-input').value = '';
    document.getElementById('review-text').value = '';
    
    // Reset stars
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.classList.remove('active');
        star.classList.replace('ph-star-fill', 'ph-star');
        star.style.color = 'rgba(255,255,255,0.2)';
    });
    
    document.getElementById('review-error').style.display = 'none';
    modal.classList.add('show');
    
    if (map) map.closePopup();
}

document.querySelector('.close-modal').addEventListener('click', () => {
    modal.classList.remove('show');
});

// Star Rating Logic
document.querySelectorAll('.star-rating').forEach(container => {
    const defaultColor = 'rgba(255,255,255,0.2)';
    const activeColor = '#facc15';
    const field = container.getAttribute('data-field');
    const input = document.getElementById(`${field}-input`);

    container.querySelectorAll('i').forEach(img => {
        img.addEventListener('click', (e) => {
            const val = parseInt(e.target.getAttribute('data-value'));
            input.value = val;
            
            // Highlight stars up to clicked one
            container.querySelectorAll('i').forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                if (sVal <= val) {
                    s.classList.add('active');
                    s.classList.replace('ph-star', 'ph-star-fill');
                    s.style.color = activeColor;
                } else {
                    s.classList.remove('active');
                    s.classList.replace('ph-star-fill', 'ph-star');
                    s.style.color = defaultColor;
                }
            });
        });

        img.addEventListener('mouseenter', (e) => {
             const val = parseInt(e.target.getAttribute('data-value'));
             container.querySelectorAll('i').forEach(s => {
                 if(!s.classList.contains('active')) {
                     const sVal = parseInt(s.getAttribute('data-value'));
                     s.style.color = (sVal <= val) ? '#fef08a' : defaultColor;
                 }
             });
        });
        img.addEventListener('mouseleave', () => {
            container.querySelectorAll('i').forEach(s => {
                 if(!s.classList.contains('active')) {
                     s.style.color = defaultColor;
                 }
            });
        });
    });
});

document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const waitTime = document.getElementById('wait-time-input').value;
    const billing = document.getElementById('billing-input').value;
    const id = document.getElementById('review-hospital-id').value;
    const text = document.getElementById('review-text').value;

    const errorEl = document.getElementById('review-error');
    if (!waitTime || !billing) {
        errorEl.textContent = 'Please provide both star ratings.';
        errorEl.style.display = 'block';
        return;
    }

    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Submitting...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hospital_id: id,
                wait_time_score: parseInt(waitTime),
                billing_transparency_score: parseInt(billing),
                review_text: text
            })
        });

        if (res.ok) {
            modal.classList.remove('show');
            fetchHospitals(document.getElementById('search-input').value); // Refresh list & map
        } else {
            const data = await res.json();
            errorEl.textContent = data.error || 'Failed to submit review';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        errorEl.textContent = 'Network error. Make sure backend is running.';
        errorEl.style.display = 'block';
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// UI Navigation & Search
document.getElementById('nav-hospitals').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('patient-view').classList.add('active');
    document.getElementById('patient-view').classList.remove('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('nav-hospitals').classList.add('active');
    document.getElementById('nav-admin').classList.remove('active');
    
    // Handle map resize issue when unhidden
    if (map) { setTimeout(() => map.invalidateSize(), 150); }
});

document.getElementById('nav-admin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('admin-view').classList.remove('hidden');
    document.getElementById('patient-view').classList.remove('active');
    document.getElementById('patient-view').classList.add('hidden');
    document.getElementById('nav-admin').classList.add('active');
    document.getElementById('nav-hospitals').classList.remove('active');
    loadAdminSummary();
});

document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        fetchHospitals(e.target.value);
    }, 300);
});

document.getElementById('export-csv-btn').addEventListener('click', () => {
    window.location.href = `${API_BASE}/admin/export`;
});

// Add Hospital Modal Logic
const addHospitalModal = document.getElementById('add-hospital-modal');

document.getElementById('add-hospital-btn').addEventListener('click', () => {
    document.getElementById('add-name-input').value = '';
    document.getElementById('add-address-input').value = '';
    document.getElementById('add-hospital-error').style.display = 'none';
    addHospitalModal.classList.add('show');
});

document.querySelector('.add-hospital-close').addEventListener('click', () => {
    addHospitalModal.classList.remove('show');
});

document.getElementById('add-hospital-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('add-name-input').value;
    const address = document.getElementById('add-address-input').value;
    const errorEl = document.getElementById('add-hospital-error');
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Locating...';
    btn.disabled = true;
    errorEl.style.display = 'none';

    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in`);
        const geoData = await geoRes.json();

        if (geoData.length === 0) {
            errorEl.textContent = 'Could not find the location. Please be more specific with the address.';
            errorEl.style.display = 'block';
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Saving...';

        const res = await fetch(`${API_BASE}/hospitals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                address: address,
                latitude: lat,
                longitude: lon
            })
        });

        if (res.ok) {
            addHospitalModal.classList.remove('show');
            fetchHospitals(); 
        } else {
            const data = await res.json();
            errorEl.textContent = data.error || 'Failed to add hospital';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        errorEl.textContent = 'Network error occurred.';
        errorEl.style.display = 'block';
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Init
window.addEventListener('DOMContentLoaded', () => {
    initMap();
    fetchHospitals();
});
