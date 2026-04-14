const API_BASE = 'http://127.0.0.1:5000/api';
let map = null;
let markers = [];
let hospitals = [];
let currentUser = JSON.parse(localStorage.getItem('carecheck_user')) || null;
let currentHospitalId = null;

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
                ${currentUser && (currentUser.role === 'Admin' || currentUser.role === 'HospitalRep') 
                    ? '' 
                    : `<button class="btn primary" onclick="openReviewModal(${h.id}, '${h.name.replace(/'/g, "\\'")}')">Review</button>`}
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                openHospitalDetails(h.id);
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
                ${currentUser && (currentUser.role === 'Admin' || currentUser.role === 'HospitalRep')
                    ? ''
                    : `<button onclick="openReviewModal(${h.id}, '${h.name.replace(/'/g, "\\'")}')" 
                        class="btn primary" style="font-size:0.8rem; padding:0.3rem 0.8rem;">
                    Submit Review
                </button>`}
            </div>
        `;
        const marker = L.marker([h.latitude, h.longitude], {icon: customIcon, hospitalId: h.id})
            .bindPopup(popup)
            .addTo(map);
        markers.push(marker);
    });
}

// Open Hospital Details View
async function openHospitalDetails(id) {
    currentHospitalId = id;
    try {
        const res = await fetch(`${API_BASE}/hospitals/${id}`);
        const data = await res.json();
        
        document.getElementById('patient-view').classList.add('hidden');
        document.getElementById('hospital-details-view').classList.remove('hidden');
        
        document.getElementById('detail-hospital-name').textContent = data.name;

        const badgeContainer = document.getElementById('detail-hospital-badges');
        if (badgeContainer) {
            badgeContainer.innerHTML = '';
            if (data.is_nabh_accredited) {
                badgeContainer.innerHTML += `<span style="background:rgba(34,197,94,0.2); color:#4ade80; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.8rem; border: 1px solid rgba(34,197,94,0.3);"><i class="ph ph-shield-check"></i> NABH Accredited</span>`;
            }
            if (data.is_ayushman_empanelled) {
                badgeContainer.innerHTML += `<span style="background:rgba(56,189,248,0.2); color:#38bdf8; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.8rem; border: 1px solid rgba(56,189,248,0.3);"><i class="ph ph-heartbeat"></i> Ayushman Bharat</span>`;
            }
        }

        document.getElementById('detail-hospital-address').textContent = data.address;
        document.getElementById('detail-hospital-rating').textContent = data.average_rating > 0 ? data.average_rating.toFixed(1) : 'New';
        document.getElementById('detail-hospital-reviews').textContent = data.review_count;
        
        const btn = document.getElementById('detail-write-review-btn');
        if (btn) {
            btn.onclick = () => openReviewModal(data.id, data.name);
        }
        
        // Setup Admins/Reps tools
        const isStaff = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'HospitalRep');
        if (btn) btn.style.display = isStaff ? 'none' : 'flex';
        document.getElementById('add-department-section').style.display = isStaff ? 'block' : 'none';
        document.getElementById('add-insurance-section').style.display = isStaff ? 'block' : 'none';

        // Load Departments
        loadDepartments(id);
        // Load Insurances
        loadInsurances(id);

        const reviewList = document.getElementById('detail-reviews-list');
        reviewList.innerHTML = '';

        
        if (!data.recent_reviews || data.recent_reviews.length === 0) {
            reviewList.innerHTML = '<p style="color:var(--text-muted)">No approved reviews yet.</p>';
        } else {
            data.recent_reviews.forEach(r => {
                let mediaHtml = '';
                if (r.media && r.media.length > 0) {
                    mediaHtml = `<div style="margin-top: 0.5rem;"><a href="http://127.0.0.1:5000${r.media[0].file_url}" target="_blank" style="color:var(--primary)"><i class="ph ph-file-text"></i> View Attached Media</a></div>`;
                }
                const div = document.createElement('div');
                div.className = 'glass';
                div.style.padding = '1rem';
                div.style.borderRadius = 'var(--radius)';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                        <div>
                            <span style="color:#facc15"><i class="ph ph-clock"></i> Wait: ${r.wait_time_score}/5</span> | 
                            <span style="color:#4ade80"><i class="ph ph-receipt"></i> Billing: ${r.billing_transparency_score}/5</span>
                            ${r.cleanliness_score ? ` | <span style="color:#60a5fa"><i class="ph ph-broom"></i> Clean: ${r.cleanliness_score}/5</span>` : ''}
                            ${r.staff_behavior_score ? ` | <span style="color:#a78bfa"><i class="ph ph-users"></i> Staff: ${r.staff_behavior_score}/5</span>` : ''}
                            ${r.emergency_responsiveness_score ? ` | <span style="color:#f87171"><i class="ph ph-ambulance"></i> Emergency: ${r.emergency_responsiveness_score}/5</span>` : ''}
                        </div>
                        <small style="color:var(--text-muted)">${new Date(r.submitted_at).toLocaleDateString()}</small>
                    </div>
                    <p style="margin:0;">${r.review_text || 'No comment provided.'}</p>
                    ${mediaHtml}
                `;
                reviewList.appendChild(div);
            });
        }
        
    } catch (err) {
        console.error('Error fetching hospital details:', err);
    }
}

document.getElementById('back-to-list-btn').addEventListener('click', () => {
    document.getElementById('hospital-details-view').classList.add('hidden');
    document.getElementById('patient-view').classList.remove('hidden');
});

// Admin Summary
async function loadAdminSummary() {
    try {
        const res = await fetch(`${API_BASE}/admin/summary`);
        const data = await res.json();
        
        animateValue('admin-total-hospitals', 0, data.total_hospitals, 1000);
        document.getElementById('admin-avg-rating').textContent = Number(data.average_rating).toFixed(1);
        animateValue('admin-total-reviews', 0, data.total_reviews, 1000);
        
        loadPendingReviews();
    } catch (err) {
        console.error('Error fetching admin summary:', err);
    }
}

async function loadPendingReviews() {
    try {
        const res = await fetch(`${API_BASE}/admin/reviews/pending`);
        const pending = await res.json();
        const list = document.getElementById('pending-reviews-list');
        list.innerHTML = '';
        
        if (pending.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted)">No pending reviews to moderate.</p>';
            return;
        }
        
        pending.forEach(r => {
            let mediaHtml = '';
            if (r.media && r.media.length > 0) {
                mediaHtml = `<div style="margin-top: 0.5rem;"><a href="http://127.0.0.1:5000${r.media[0].file_url}" target="_blank" style="color:var(--primary)"><i class="ph ph-file-text"></i> View Attachment</a></div>`;
            }
            const card = document.createElement('div');
            card.className = 'glass';
            card.style.padding = '1rem';
            card.style.borderRadius = 'var(--radius)';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h4 style="margin:0 0 0.5rem 0;">${r.hospital_name}</h4>
                        <div style="font-size:0.9rem; margin-bottom:0.5rem; display:flex; flex-wrap:wrap; gap:0.3rem;">
                            <span style="color:#facc15"><i class="ph ph-clock"></i> Wait: ${r.wait_time_score}/5</span> | 
                            <span style="color:#4ade80"><i class="ph ph-receipt"></i> Billing: ${r.billing_transparency_score}/5</span>
                            ${r.cleanliness_score ? ` | <span style="color:#60a5fa"><i class="ph ph-broom"></i> Clean: ${r.cleanliness_score}/5</span>` : ''}
                            ${r.staff_behavior_score ? ` | <span style="color:#a78bfa"><i class="ph ph-users"></i> Staff: ${r.staff_behavior_score}/5</span>` : ''}
                            ${r.emergency_responsiveness_score ? ` | <span style="color:#f87171"><i class="ph ph-ambulance"></i> Emergency: ${r.emergency_responsiveness_score}/5</span>` : ''}
                        </div>
                        <p style="margin:0 0 0.5rem 0; font-size:0.95rem;">"${r.review_text || 'No comment provided.'}"</p>
                        ${mediaHtml}
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        <button class="btn primary" style="padding:0.3rem 0.8rem; background:#4ade80; color:black;" onclick="moderateReview(${r.id}, 'approve')">Approve</button>
                        <button class="btn secondary" style="padding:0.3rem 0.8rem; background:rgba(239,68,68,0.2); color:#f87171;" onclick="moderateReview(${r.id}, 'reject')">Reject</button>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error('Error fetching pending reviews:', err);
    }
}

window.moderateReview = async function(id, action) {
    try {
        const res = await fetch(`${API_BASE}/admin/reviews/${id}/${action}`, { method: 'POST' });
        if (res.ok) {
            loadAdminSummary(); // Refresh stats and list
            fetchHospitals(); // Refresh public list metrics
        }
    } catch (err) {
        console.error('Action failed:', err);
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
    document.getElementById('clean-input').value = '';
    document.getElementById('staff-input').value = '';
    document.getElementById('emerg-input').value = '';
    document.getElementById('review-text').value = '';
    const fileInput = document.getElementById('review-media');
    if(fileInput) fileInput.value = '';
    
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
    const clean = document.getElementById('clean-input').value;
    const staff = document.getElementById('staff-input').value;
    const emerg = document.getElementById('emerg-input').value;
    const id = document.getElementById('review-hospital-id').value;
    const text = document.getElementById('review-text').value;
    const fileInput = document.getElementById('review-media');

    const errorEl = document.getElementById('review-error');
    if (!waitTime || !billing) {
        errorEl.textContent = 'Please provide at least Wait Time and Billing ratings.';
        errorEl.style.display = 'block';
        return;
    }

    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Submitting...';
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append('hospital_id', id);
    formData.append('wait_time_score', waitTime);
    formData.append('billing_transparency_score', billing);
    if(clean) formData.append('cleanliness_score', clean);
    if(staff) formData.append('staff_behavior_score', staff);
    if(emerg) formData.append('emergency_responsiveness_score', emerg);
    formData.append('review_text', text);
    if (currentUser) formData.append('user_id', currentUser.id);
    if (fileInput && fileInput.files.length > 0) {
        formData.append('media', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            modal.classList.remove('show');
            // Show a temporary success alert or toast instead of reloading list immediately,
            // because review is pending moderation anyway.
            alert("Review submitted successfully and is awaiting moderation.");
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
    document.getElementById('hospital-details-view').classList.add('hidden');
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
    document.getElementById('hospital-details-view').classList.add('hidden');
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
            await fetchHospitals(); 
            if (map && lat && lon) {
                map.setView([lat, lon], 14, { animate: true });
            }
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
async function loadDepartments(hospitalId) {
    const list = document.getElementById('detail-departments-list');
    try {
        const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/departments`);
        const depts = await res.json();
        list.innerHTML = '';
        if(depts.length === 0) {
            list.innerHTML = '<li style="color:var(--text-muted)">No departments listed.</li>';
            return;
        }
        depts.forEach(d => {
            const li = document.createElement('li');
            li.style.marginBottom = '0.5rem';
            li.innerHTML = `<strong>${d.name}</strong> ${d.is_24_hours ? '<span style="color:#4ade80; font-size:0.8rem">(24 Hrs)</span>' : ''} <br><small style="color:var(--text-muted)">${d.contact || 'No contact info'}</small>`;
            list.appendChild(li);
        });
    } catch(e) {}
}

async function loadInsurances(hospitalId) {
    const list = document.getElementById('detail-insurances-list');
    try {
        const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/insurances`);
        const ins = await res.json();
        list.innerHTML = '';
        if(ins.length === 0) {
            list.innerHTML = '<li style="color:var(--text-muted)">No insurance linked yet.</li>';
            return;
        }
        ins.forEach(i => {
            const li = document.createElement('li');
            li.style.marginBottom = '0.5rem';
            li.innerHTML = `<strong>${i.name}</strong> <span style="background:rgba(255,255,255,0.1); padding:0.1rem 0.4rem; border-radius:4px; font-size:0.8rem;">${i.type}</span>`;
            list.appendChild(li);
        });
    } catch(e) {}
}

// --- Auth Logic ---
function updateAuthUI() {
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');
    const navAdmin = document.getElementById('nav-admin');

    if (currentUser) {
        navLogin.style.display = 'none';
        navLogout.style.display = 'inline-block';
        navLogout.innerHTML = `Logout (${currentUser.username})`;
        if (currentUser.role === 'Admin') {
            navAdmin.style.display = 'inline-block';
        } else {
            navAdmin.style.display = 'none';
        }
    } else {
        navLogin.style.display = 'inline-block';
        navLogout.style.display = 'none';
        navAdmin.style.display = 'none';
    }

    // Refresh list UI if it is currently visible to ensure buttons disappear/reappear
    if (hospitals.length > 0) {
        renderHospitals();
        updateMapMarkers();
    }
}

const authModal = document.getElementById('auth-modal');
let isLoginMode = true;

window.toggleAuthMode = function() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').textContent = isLoginMode ? 'Login' : 'Register';
    document.getElementById('login-form-container').style.display = isLoginMode ? 'block' : 'none';
    document.getElementById('register-form-container').style.display = isLoginMode ? 'none' : 'block';
};

document.getElementById('nav-login').addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = true;
    toggleAuthMode();
    authModal.classList.add('show');
});

document.querySelector('.auth-close').addEventListener('click', () => {
    authModal.classList.remove('show');
});

document.getElementById('nav-logout').addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem('carecheck_user');
    updateAuthUI();
    document.getElementById('nav-hospitals').click();
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if(res.ok) {
            currentUser = data.user;
            localStorage.setItem('carecheck_user', JSON.stringify(currentUser));
            updateAuthUI();
            authModal.classList.remove('show');
            if (currentHospitalId) openHospitalDetails(currentHospitalId); 
        } else {
            errorEl.textContent = data.error;
            errorEl.style.display = 'block';
        }
    } catch(err) {
         errorEl.textContent = "Network error";
         errorEl.style.display = 'block';
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const errorEl = document.getElementById('register-error');
    
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({username, email, password, role})
        });
        const data = await res.json();
        if(res.ok) {
            currentUser = data.user;
            localStorage.setItem('carecheck_user', JSON.stringify(currentUser));
            updateAuthUI();
            authModal.classList.remove('show');
        } else {
            errorEl.textContent = data.error;
            errorEl.style.display = 'block';
        }
    } catch(err) {
         errorEl.textContent = "Network error";
         errorEl.style.display = 'block';
    }
});

// --- Departments & Insurances ---

async function fetchGlobalInsurances() {
    try {
        const res = await fetch(`${API_BASE}/insurances`);
        const ins = await res.json();
        const select = document.getElementById('ins-select');
        select.innerHTML = '<option value="">Select Insurance</option>';
        ins.forEach(i => {
            select.innerHTML += `<option value="${i.id}">${i.name} (${i.type})</option>`;
        });
    } catch(e) {}
}

document.getElementById('add-dept-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentHospitalId) return;
    const name = document.getElementById('dept-name').value;
    const contact = document.getElementById('dept-contact').value;
    const is24 = document.getElementById('dept-24h').checked;
    
    try {
        const res = await fetch(`${API_BASE}/hospitals/${currentHospitalId}/departments`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({department_name: name, contact_number: contact, is_24_hours: is24})
        });
        if(res.ok) {
            loadDepartments(currentHospitalId);
            e.target.reset();
        }
    } catch(err) {}
});

document.getElementById('add-ins-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentHospitalId) return;
    const iId = document.getElementById('ins-select').value;
    if(!iId) return;
    
    try {
        const res = await fetch(`${API_BASE}/hospitals/${currentHospitalId}/insurances`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({insurance_id: iId})
        });
        if(res.ok) {
            loadInsurances(currentHospitalId);
            e.target.reset();
        }
    } catch(err) {}
});

window.addEventListener('DOMContentLoaded', () => {
    initMap();
    fetchHospitals();
    updateAuthUI();
    fetchGlobalInsurances();
});
