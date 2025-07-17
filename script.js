let currentMember = '';
let editingId = null;

function onSuccess(fn) {
  google.script.run.withSuccessHandler(fn);
}

document.addEventListener('DOMContentLoaded', () => {
  onSuccess(renderMemberDropdown).getAllMembers();
});

function renderMemberDropdown(members) {
  const sel = document.getElementById('member');
  sel.innerHTML = members.map(m => `<option value="${m}">${m}</option>`).join('');
  currentMember = members[0];
  sel.addEventListener('change', e => {
    currentMember = e.target.value;
    fetchData();
  });
  fetchData();
}

function fetchData() {
  onSuccess(renderTable).getMemberData(currentMember);
}

function renderTable(data) {
  const container = document.getElementById('table-container');
  if (!data.length) {
    container.innerHTML = '<p>No data found.</p>';
    return;
  }

  const rows = data.map(row => `
    <tr>
      ${headers.map(h => `<td class="border px-2 py-1">${row[h]}</td>`).join('')}
      <td class="border px-2 py-1">
        <button onclick='editRecord(${JSON.stringify(row)})' class="text-blue-600">✏️</button>
        <button onclick='deleteRecord("${row.id}")' class="text-red-600 ml-2">🗑️</button>
      </td>
    </tr>`).join('');

  container.innerHTML = `
    <table class="table-auto w-full text-sm">
      <thead>
        <tr>
          ${headers.map(h => `<th class="border px-2 py-1">${h.replace('_', ' ')}</th>`).join('')}
          <th class="border px-2 py-1">Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function showAddForm() {
  editingId = null;
  openForm({});
}

function editRecord(row) {
  editingId = row.id;
  openForm(row);
}

function openForm(data) {
  const form = document.getElementById('entry-form');
  form.innerHTML = headers.map(h => `
    <div>
      <label class="block text-sm">${h.replace('_', ' ')}</label>
      <input name="${h}" value="${data[h] || ''}" class="w-full border p-1 rounded" ${h === 'id' && editingId ? 'readonly' : ''}/>
    </div>
  `).join('');
  document.getElementById('form-modal').classList.remove('hidden');
}

function closeForm() {
  document.getElementById('form-modal').classList.add('hidden');
}

function submitForm() {
  const formData = {};
  document.querySelectorAll('#entry-form input').forEach(input => {
    formData[input.name] = input.value;
  });

  const handler = editingId ? google.script.run.withSuccessHandler(fetchData).updateRecord
                            : google.script.run.withSuccessHandler(fetchData).addRecord;

  handler(currentMember, editingId || formData);
  closeForm();
}

function deleteRecord(id) {
  if (confirm('Delete this record?')) {
    google.script.run.withSuccessHandler(fetchData).deleteRecord(currentMember, id);
  }
}
