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

document.addEventListener('DOMContentLoaded', loadOpportunities);
