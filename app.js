const API = '/api/opportunities';
const FIELDS = ['title', 'description', 'research_area', 'faculty_name',
                'department', 'required_skills', 'positions', 'deadline', 'status'];

const formModal = new bootstrap.Modal(document.getElementById('formModal'));
const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
const form = document.getElementById('opp-form');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function showMessage(text, type = 'success') {
  const box = document.getElementById('message-box');
  box.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(text)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  setTimeout(() => (box.innerHTML = ''), 5000);
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.errors ? data.errors.join(', ') : data.message || 'Something went wrong';
    throw new Error(`${res.status}: ${detail}`);
  }
  return data;
}

async function loadOpportunities() {
  try {
    const list = await request(API);
    const body = document.getElementById('table-body');

    if (list.length === 0) {
      body.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No opportunities found. Create one!</td></tr>`;
      return;
    }

    body.innerHTML = list.map((o) => `
      <tr>
        <td>${o.id}</td>
        <td>${escapeHtml(o.title)}</td>
        <td>${escapeHtml(o.faculty_name)}</td>
        <td>${escapeHtml(o.research_area)}</td>
        <td>${o.positions}</td>
        <td>${escapeHtml(o.deadline)}</td>
        <td><span class="badge ${o.status === 'Open' ? 'bg-success' : 'bg-secondary'}">${o.status}</span></td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewOpportunity(${o.id})">View</button>
          <button class="btn btn-sm btn-warning" onclick="editOpportunity(${o.id})">Edit</button>
          ${o.status === 'Open'
            ? `<button class="btn btn-sm btn-dark" onclick="closeOpportunity(${o.id})">Close</button>`
            : ''}
          <button class="btn btn-sm btn-danger" onclick="deleteOpportunity(${o.id})">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    showMessage(err.message, 'danger');
  }
}

async function viewOpportunity(id) {
  try {
    const o = await request(`${API}/${id}`);
    document.getElementById('detail-body').innerHTML = `
      <dl class="row mb-0">
        <dt class="col-sm-4">ID</dt><dd class="col-sm-8">${o.id}</dd>
        <dt class="col-sm-4">Title</dt><dd class="col-sm-8">${escapeHtml(o.title)}</dd>
        <dt class="col-sm-4">Description</dt><dd class="col-sm-8">${escapeHtml(o.description)}</dd>
        <dt class="col-sm-4">Research Area</dt><dd class="col-sm-8">${escapeHtml(o.research_area)}</dd>
        <dt class="col-sm-4">Faculty Member</dt><dd class="col-sm-8">${escapeHtml(o.faculty_name)}</dd>
        <dt class="col-sm-4">Department</dt><dd class="col-sm-8">${escapeHtml(o.department)}</dd>
        <dt class="col-sm-4">Required Skills</dt><dd class="col-sm-8">${escapeHtml(o.required_skills)}</dd>
        <dt class="col-sm-4">Positions</dt><dd class="col-sm-8">${o.positions}</dd>
        <dt class="col-sm-4">Deadline</dt><dd class="col-sm-8">${escapeHtml(o.deadline)}</dd>
        <dt class="col-sm-4">Status</dt><dd class="col-sm-8">${o.status}</dd>
      </dl>`;
    detailModal.show();
  } catch (err) {
    showMessage(err.message, 'danger');
    loadOpportunities();
  }
}

document.getElementById('btn-new').addEventListener('click', () => {
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('opp-id').value = '';
  document.getElementById('form-title').textContent = 'New Opportunity';
  formModal.show();
});

async function editOpportunity(id) {
  try {
    const o = await request(`${API}/${id}`);
    form.classList.remove('was-validated');
    document.getElementById('opp-id').value = o.id;
    FIELDS.forEach((f) => (document.getElementById(f).value = o[f]));
    document.getElementById('form-title').textContent = `Edit Opportunity #${o.id}`;
    formModal.show();
  } catch (err) {
    showMessage(err.message, 'danger');
    loadOpportunities();
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Basic frontend validation
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    showMessage('Please fill all required fields correctly.', 'danger');
    return;
  }

  const payload = {};
  FIELDS.forEach((f) => (payload[f] = document.getElementById(f).value.trim()));
  payload.positions = Number(payload.positions);

  const id = document.getElementById('opp-id').value;

  try {
    if (id) {
      await request(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showMessage('Opportunity updated successfully.');
    } else {
      await request(API, { method: 'POST', body: JSON.stringify(payload) });
      showMessage('Opportunity created successfully.');
    }
    formModal.hide();
    loadOpportunities();
  } catch (err) {
    showMessage(err.message, 'danger');
  }
});

async function closeOpportunity(id) {
  try {
    await request(`${API}/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'Closed' }) });
    showMessage('Opportunity closed successfully.');
    loadOpportunities();
  } catch (err) {
    showMessage(err.message, 'danger');
    loadOpportunities();
  }
}

async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity?')) return;
  try {
    await request(`${API}/${id}`, { method: 'DELETE' });
    showMessage('Opportunity deleted successfully.');
    loadOpportunities();
  } catch (err) {
    showMessage(err.message, 'danger');
    loadOpportunities();
  }
}

loadOpportunities();
