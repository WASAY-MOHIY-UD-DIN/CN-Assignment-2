const API = '/api/opportunities';

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
        <td>${o.title}</td>
        <td>${o.faculty_name}</td>
        <td>${o.research_area}</td>
        <td>${o.positions}</td>
        <td>${o.deadline}</td>
        <td><span class="badge ${o.status === 'Open' ? 'bg-success' : 'bg-secondary'}">${o.status}</span></td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewOpportunity(${o.id})">View</button>
          <button class="btn btn-sm btn-warning" onclick="editOpportunity(${o.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteOpportunity(${o.id})">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    console.error(err);
  }
}

const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));

async function viewOpportunity(id) {
  try {
    const o = await request(`${API}/${id}`);
    document.getElementById('detail-body').innerHTML = `
      <dl class="row mb-0">
        <dt class="col-sm-4">ID</dt><dd class="col-sm-8">${o.id}</dd>
        <dt class="col-sm-4">Title</dt><dd class="col-sm-8">${o.title}</dd>
        <dt class="col-sm-4">Description</dt><dd class="col-sm-8">${o.description}</dd>
        <dt class="col-sm-4">Research Area</dt><dd class="col-sm-8">${o.research_area}</dd>
        <dt class="col-sm-4">Faculty Member</dt><dd class="col-sm-8">${o.faculty_name}</dd>
        <dt class="col-sm-4">Department</dt><dd class="col-sm-8">${o.department}</dd>
        <dt class="col-sm-4">Required Skills</dt><dd class="col-sm-8">${o.required_skills}</dd>
        <dt class="col-sm-4">Positions</dt><dd class="col-sm-8">${o.positions}</dd>
        <dt class="col-sm-4">Deadline</dt><dd class="col-sm-8">${o.deadline}</dd>
        <dt class="col-sm-4">Status</dt><dd class="col-sm-8">${o.status}</dd>
      </dl>`;
    detailModal.show();
  } catch (err) {
    console.error(err);
  }
}

const formModal = new bootstrap.Modal(document.getElementById('formModal'));
const form = document.getElementById('opp-form');

document.getElementById('btn-new').addEventListener('click', () => {
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('opp-id').value = '';
  document.getElementById('form-title').textContent = 'New Opportunity';
  formModal.show();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  const id = document.getElementById('opp-id').value;
  const body = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    research_area: document.getElementById('research_area').value.trim(),
    faculty_name: document.getElementById('faculty_name').value.trim(),
    department: document.getElementById('department').value.trim(),
    required_skills: document.getElementById('required_skills').value.trim(),
    positions: Number(document.getElementById('positions').value),
    deadline: document.getElementById('deadline').value,
    status: document.getElementById('status').value,
  };

  try {
    if (id) {
      await request(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await request(API, { method: 'POST', body: JSON.stringify(body) });
    }
    formModal.hide();
    loadOpportunities();
  } catch (err) {
    console.error(err);
  }
});

async function editOpportunity(id) {
  try {
    const o = await request(`${API}/${id}`);
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('opp-id').value = o.id;
    document.getElementById('form-title').textContent = 'Edit Opportunity';
    document.getElementById('title').value = o.title;
    document.getElementById('description').value = o.description;
    document.getElementById('research_area').value = o.research_area;
    document.getElementById('faculty_name').value = o.faculty_name;
    document.getElementById('department').value = o.department;
    document.getElementById('required_skills').value = o.required_skills;
    document.getElementById('positions').value = o.positions;
    document.getElementById('deadline').value = o.deadline;
    document.getElementById('status').value = o.status;
    formModal.show();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadOpportunities);
