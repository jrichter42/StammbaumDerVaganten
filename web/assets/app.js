const state = {
  status: null,
  groupTypes: [],
  roleTypes: [],
};

const labels = {
  people: 'People',
  groups: 'Groups',
  'group-types': 'Group types',
  'role-types': 'Role types',
  roles: 'Roles',
  timepoints: 'Timepoints',
};

const connectionStatus = document.querySelector('#connectionStatus');
const refreshButton = document.querySelector('#refreshButton');

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => activateView(button.dataset.view));
});

refreshButton.addEventListener('click', () => refresh());

refresh();

function activateView(viewName) {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === viewName);
  });

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('is-active', view.id === `view-${viewName}`);
  });
}

async function refresh() {
  setConnection('Loading', '');

  try {
    const [status, groupTypes, roleTypes] = await Promise.all([
      getJson('api.php?action=status'),
      getJson('api.php?action=objects&type=group-types'),
      getJson('api.php?action=objects&type=role-types'),
    ]);

    state.status = status;
    state.groupTypes = groupTypes.objects || [];
    state.roleTypes = roleTypes.objects || [];

    render();
    const writable = Boolean(status.storage && status.storage.writable);
    setConnection(writable ? 'Online' : 'Read only', writable ? 'is-online' : 'is-warning');
  } catch (error) {
    console.error(error);
    setConnection('Offline', 'is-offline');
  }
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function render() {
  renderMetrics();
  renderReferenceData();
  renderSystem();
  renderSectionCounts();
  renderRoleTypes();
}

function renderMetrics() {
  const grid = document.querySelector('#metricGrid');
  const collections = state.status?.storage?.collections || {};
  const visible = ['people', 'groups', 'group-types', 'role-types', 'roles', 'timepoints'];

  grid.innerHTML = visible.map((key) => `
    <article class="metric">
      <h3>${escapeHtml(labels[key] || key)}</h3>
      <span class="metric-value">${Number(collections[key] || 0)}</span>
    </article>
  `).join('');
}

function renderReferenceData() {
  const list = document.querySelector('#referenceList');
  const items = [
    ...state.groupTypes.map((object) => ({ ...object, tag: 'Group type' })),
    ...state.roleTypes.slice(0, 6).map((object) => ({ ...object, tag: 'Role type' })),
  ];

  list.innerHTML = items.map((object) => `
    <article class="list-item">
      <div>
        <h3>${escapeHtml(objectLabel(object))}</h3>
        <small>${escapeHtml(objectId(object))}</small>
      </div>
      <span class="tag">${escapeHtml(object.tag)}</span>
    </article>
  `).join('');
}

function renderSystem() {
  const storage = state.status?.storage || {};
  const app = state.status?.app || {};

  document.querySelector('#storageState').textContent = storage.writable
    ? 'Data path is writable'
    : 'Data path is not writable';
  document.querySelector('#systemVersion').textContent = 'Storage';

  document.querySelector('#systemList').innerHTML = `
    ${renderWarnings(app.show_warnings ? app.warnings : null)}
    <dt>Display timezone</dt>
    <dd>${escapeHtml(app.timezone || 'UTC')}</dd>
    <dt>Data path</dt>
    <dd>${escapeHtml(storage.data_path || '-')}</dd>
    <dt>Runtime path</dt>
    <dd>${escapeHtml(storage.var_path || '-')}</dd>
    <dt>Storage</dt>
    <dd>${storage.exists ? 'Found' : 'Missing'}</dd>
    <dt>Writes</dt>
    <dd>${storage.writable ? 'Enabled' : 'Disabled'}</dd>
    <dt>Runtime writes</dt>
    <dd>${storage.runtime_writable ? 'Enabled' : 'Disabled'}</dd>
  `;
}

function renderWarnings(warnings) {
  if (!warnings || !warnings.length) {
    return '';
  }

  return `
    <dt>Config warning</dt>
    <dd class="warning-text">${warnings.map((warning) => escapeHtml(warning)).join('<br>')}</dd>
  `;
}

function renderSectionCounts() {
  const collections = state.status?.storage?.collections || {};
  setText('#peopleCount', formatCount(collections.people, 'record'));
  setText('#groupsCount', formatCount(collections.groups, 'record'));
  setText('#roleTypesCount', formatCount(collections['role-types'], 'record'));
  setText('#timepointsCount', formatCount(collections.timepoints, 'record'));
}

function renderRoleTypes() {
  const list = document.querySelector('#roleTypesList');
  list.innerHTML = state.roleTypes.map((object) => `
    <article class="list-item">
      <div>
        <h3>${escapeHtml(objectLabel(object))}</h3>
        <small>${escapeHtml(objectId(object))}</small>
      </div>
      <span class="tag">Role type</span>
    </article>
  `).join('');
}

function objectLabel(object) {
  return object.label || object.name || object.data?.label || objectId(object);
}

function objectId(object) {
  return object._id || object.id || '';
}

function setConnection(text, className) {
  connectionStatus.textContent = text;
  connectionStatus.className = `status-pill ${className}`.trim();
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
}

function formatCount(value = 0, noun) {
  const count = Number(value || 0);
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
