const labels = {
  people: 'People',
  groups: 'Groups',
  'group-types': 'Group types',
  'role-types': 'Role types',
  roles: 'Roles',
  timepoints: 'Timepoints',
};

const objectCollections = ['people', 'groups', 'group-types', 'role-types', 'roles', 'timepoints'];

const objectConfigs = {
  people: {
    list: '#peopleList',
    count: '#peopleCount',
    fields: [
      { name: 'forename', label: 'Forename', sensitive: true },
      { name: 'lastname', label: 'Lastname', sensitive: true },
      { name: 'scoutname', label: 'Scout name', sensitive: true },
      { name: 'birthdate', label: 'Birthdate', kind: 'date', sensitive: true },
      { name: 'contactInfo', label: 'Contact', kind: 'textarea', sensitive: true },
      { name: 'notes', label: 'Notes', kind: 'textarea', sensitive: true },
      { name: '_certainty', label: 'Certainty' },
      { name: '_sources', label: 'Sources', kind: 'textarea', sensitive: true },
      { name: 'memberships', label: 'Memberships', kind: 'json', defaultValue: [] },
      { name: 'activities', label: 'Activities', kind: 'json', defaultValue: [] },
    ],
  },
  groups: {
    list: '#groupsList',
    count: '#groupsCount',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'notes', label: 'Notes', kind: 'textarea', sensitive: true },
      { name: '_certainty', label: 'Certainty' },
      { name: '_sources', label: 'Sources', kind: 'textarea', sensitive: true },
      { name: 'mainPhase', label: 'Main phase', kind: 'json', defaultValue: null },
      { name: 'additionalPhases', label: 'Additional phases', kind: 'json', defaultValue: [] },
    ],
  },
  'group-types': {
    list: '#groupTypesList',
    count: '#groupTypesCount',
    fields: [
      { name: 'label', label: 'Label' },
    ],
  },
  'role-types': {
    list: '#roleTypesList',
    count: '#roleTypesCount',
    fields: [
      { name: 'label', label: 'Label' },
    ],
  },
  roles: {
    list: '#rolesList',
    count: '#rolesCount',
    fields: [
      { name: 'type', label: 'Role type', kind: 'role-type-select' },
      { name: 'groupType', label: 'Group type', kind: 'group-type-select' },
      { name: 'notes', label: 'Notes', kind: 'textarea', sensitive: true },
      { name: '_certainty', label: 'Certainty' },
      { name: '_sources', label: 'Sources', kind: 'textarea', sensitive: true },
    ],
  },
  timepoints: {
    list: '#timepointsList',
    count: '#timepointsCount',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'date', label: 'Date', kind: 'date' },
      { name: 'notes', label: 'Notes', kind: 'textarea', sensitive: true },
      { name: '_certainty', label: 'Certainty' },
      { name: '_sources', label: 'Sources', kind: 'textarea', sensitive: true },
    ],
  },
};

const state = {
  status: null,
  objects: Object.fromEntries(objectCollections.map((type) => [type, []])),
  groupTypes: [],
  roleTypes: [],
  users: [],
  setupResult: null,
  createOpen: {},
  editing: {},
  editTimers: {},
};

const connectionStatus = document.querySelector('#connectionStatus');
const currentUserLabel = document.querySelector('#currentUserLabel');
const loginButton = document.querySelector('#loginButton');
const logoutButton = document.querySelector('#logoutButton');
const passkeyLoginButton = document.querySelector('#passkeyLoginButton');
const authScreen = document.querySelector('#authScreen');
const workspace = document.querySelector('#workspace');
const authMessage = document.querySelector('#authMessage');
const setupForm = document.querySelector('#setupForm');
const setupPanel = document.querySelector('#setupPanel');
const setupInput = document.querySelector('#setupInput');
const adminNav = document.querySelector('#adminNav');
const createUserForm = document.querySelector('#createUserForm');
const setupResult = document.querySelector('#setupResult');
const userList = document.querySelector('#userList');

const urlSetup = new URLSearchParams(window.location.search).get('setup');
let isSetupPage = Boolean(urlSetup);
if (urlSetup) {
  setupInput.value = urlSetup;
  setupPanel.hidden = false;
}

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    activateView(button.dataset.view);
    if (button.dataset.view === 'admin') {
      loadAdminUsers();
    }
  });
});

loginButton.addEventListener('click', beginLogin);
passkeyLoginButton.addEventListener('click', beginLogin);
logoutButton.addEventListener('click', logout);
setupForm.addEventListener('submit', beginSetup);
createUserForm.addEventListener('submit', createUser);
setupResult.addEventListener('click', copySetupValue);
userList.addEventListener('click', handleUserAction);
document.addEventListener('click', handleObjectClick);
document.addEventListener('input', handleObjectInput);
document.addEventListener('change', handleObjectChange);
document.addEventListener('focusout', handleObjectBlur);

refresh();
window.setInterval(pollObjects, 12000);

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
  clearAuthMessage();

  try {
    state.status = await getJson('api.php?action=status');
    renderShell();

    const user = state.status.auth?.user || null;
    if (!user) {
      setConnection('Signed out', '');
      showBootstrapHint();
      return;
    }

    if (canAccessObjects()) {
      await loadObjects();
    } else {
      clearObjects();
    }

    if (hasPermission('manage_users')) {
      await loadAdminUsers();
    }

    render();
    const writable = Boolean(state.status.storage && state.status.storage.writable);
    setConnection(writable ? 'Online' : 'Signed in', writable ? 'is-online' : '');
  } catch (error) {
    console.error(error);
    setConnection('Offline', 'is-offline');
    showAuthMessage(error.message || 'Request failed', true);
  }
}

function renderShell() {
  const user = state.status?.auth?.user || null;
  authScreen.hidden = Boolean(user);
  workspace.hidden = !user;
  loginButton.hidden = Boolean(user);
  logoutButton.hidden = !user;
  currentUserLabel.hidden = !user;
  passkeyLoginButton.closest('#loginPanel').hidden = Boolean(user) || isSetupPage;
  setupPanel.hidden = Boolean(user) || !isSetupPage;

  if (user) {
    currentUserLabel.textContent = user.display_name || user.username || 'Signed in';
  }

  const canManageUsers = hasPermission('manage_users');
  adminNav.hidden = !canManageUsers;
  if (!canManageUsers && document.querySelector('#view-admin')?.classList.contains('is-active')) {
    activateView('overview');
  }

  document.querySelectorAll('[data-create-type]').forEach((button) => {
    button.hidden = !hasPermission('write');
  });
}

function showBootstrapHint() {
  const auth = state.status?.auth || {};
  const webauthn = state.status?.webauthn || {};
  if (webauthn.secure_context_required) {
    showAuthMessage(`Passkeys require HTTPS for ${webauthn.rp_id}.`, true);
    return;
  }
  if (webauthn.openssl_available === false) {
    showAuthMessage('The PHP OpenSSL extension is required for passkey login.', true);
    return;
  }

  if (auth.bootstrap_pending) {
    showAuthMessage(auth.setup_url_hint || 'Initial setup is pending.', false);
  }
}

async function beginLogin() {
  clearAuthMessage();
  if (!window.PublicKeyCredential) {
    showAuthMessage('This browser does not support passkeys.', true);
    return;
  }
  if (!window.isSecureContext) {
    showAuthMessage('Passkeys require HTTPS except on local development hosts.', true);
    return;
  }

  try {
    const options = await postJson('auth-login-options');
    const credential = await navigator.credentials.get({
      publicKey: decodeRequestOptions(options.publicKey),
    });

    if (!credential) {
      throw new Error('Passkey login was cancelled.');
    }

    await postJson('auth-login-verify', {
      challenge_id: options.challenge_id,
      credential: credentialToJson(credential),
    });

    await refresh();
  } catch (error) {
    console.error(error);
    showAuthMessage(passkeyErrorMessage(error), true);
  }
}

async function beginSetup(event) {
  event.preventDefault();
  clearAuthMessage();
  if (!window.PublicKeyCredential) {
    showAuthMessage('This browser does not support passkeys.', true);
    return;
  }
  if (!window.isSecureContext) {
    showAuthMessage('Passkeys require HTTPS except on local development hosts.', true);
    return;
  }

  const setup = normalizeSetupInput(setupInput.value);
  setupInput.value = setup;

  try {
    const options = await postJson('auth-register-options', { setup });
    const credential = await navigator.credentials.create({
      publicKey: decodeCreationOptions(options.publicKey),
    });

    if (!credential) {
      throw new Error('Passkey setup was cancelled.');
    }

    await postJson('auth-register-verify', {
      setup,
      challenge_id: options.challenge_id,
      credential: credentialToJson(credential),
    });

    window.history.replaceState(null, '', window.location.pathname);
    isSetupPage = false;
    setupPanel.hidden = true;
    passkeyLoginButton.closest('#loginPanel').hidden = false;
    await refresh();
  } catch (error) {
    console.error(error);
    showAuthMessage(passkeyErrorMessage(error), true);
  }
}

async function logout() {
  try {
    await postJson('auth-logout');
  } finally {
    state.users = [];
    clearObjects();
    await refresh();
  }
}

async function loadObjects() {
  const responses = await Promise.all(objectCollections.map((type) => (
    getJson(`api.php?action=objects&type=${encodeURIComponent(type)}`)
  )));

  responses.forEach((response) => {
    state.objects[response.type] = response.objects || [];
  });
  syncReferenceState();
}

function clearObjects() {
  objectCollections.forEach((type) => {
    state.objects[type] = [];
  });
  syncReferenceState();
}

function syncReferenceState() {
  state.groupTypes = state.objects['group-types'] || [];
  state.roleTypes = state.objects['role-types'] || [];
}

async function reloadObjectData() {
  state.status = await getJson('api.php?action=status');
  renderShell();
  if (canAccessObjects()) {
    await loadObjects();
  } else {
    clearObjects();
  }
  render();
}

async function pollObjects() {
  if (document.hidden || !state.status?.auth?.user || !canAccessObjects() || hasPendingObjectEdits()) {
    return;
  }

  try {
    await loadObjects();
    render();
  } catch (error) {
    console.error(error);
  }
}

async function loadAdminUsers() {
  if (!hasPermission('manage_users')) {
    return;
  }

  const response = await getJson('api.php?action=admin-users');
  state.users = response.users || [];
  renderAdmin();
}

async function createUser(event) {
  event.preventDefault();
  const formData = new FormData(createUserForm);
  const username = String(formData.get('username') || '').trim();
  const permissions = formData.getAll('permissions');
  if (!username) {
    showAuthMessage('Username is required.', true);
    createUserForm.querySelector('input[name="username"]')?.focus();
    return;
  }

  try {
    const response = await postJson('admin-create-user', {
      username,
      display_name: String(formData.get('display_name') || '').trim(),
      permissions,
    });

    state.setupResult = response.setup;
    createUserForm.reset();
    createUserForm.querySelector('input[value="read"]').checked = true;
    renderSetupResult();
    await loadAdminUsers();
  } catch (error) {
    showAuthMessage(error.message || 'Could not create user.', true);
  }
}

async function handleUserAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const item = button.closest('[data-user-id]');
  const userId = item?.dataset.userId;
  if (!userId) {
    return;
  }

  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user) {
    return;
  }

  try {
    if (button.dataset.action === 'setup') {
      const response = await postJson('admin-create-setup-token', { user_id: userId });
      state.setupResult = response.setup;
      renderSetupResult();
      return;
    }

    if (button.dataset.action === 'toggle') {
      await postJson('admin-update-user', {
        user_id: userId,
        enabled: !user.enabled,
      });
      await reloadAfterUserChange(userId);
      return;
    }

    if (button.dataset.action === 'save') {
      const permissions = Array.from(item.querySelectorAll('input[data-permission]:checked'))
        .map((input) => input.value);
      const displayName = item.querySelector('input[data-display-name]')?.value.trim() || '';
      await postJson('admin-update-user', {
        user_id: userId,
        display_name: displayName,
        permissions,
      });
      await reloadAfterUserChange(userId);
    }
  } catch (error) {
    showAuthMessage(error.message || 'User update failed.', true);
  }
}

async function reloadAfterUserChange(userId) {
  if (state.status?.auth?.user?.id === userId) {
    await refresh();
    return;
  }

  await loadAdminUsers();
}

async function copySetupValue(event) {
  const button = event.target.closest('button[data-copy]');
  if (!button || !navigator.clipboard) {
    return;
  }

  const target = document.querySelector(button.dataset.copy);
  if (target) {
    await navigator.clipboard.writeText(target.value || target.textContent || '');
  }
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  return readJsonResponse(response);
}

async function postJson(action, body = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const csrf = state.status?.auth?.csrf;
  if (csrf) {
    headers['X-CSRF-Token'] = csrf;
  }

  const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return readJsonResponse(response);
}

async function readJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.error || `Request failed: ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function render() {
  renderMetrics();
  renderReferenceData();
  renderSystem();
  renderSectionCounts();
  renderObjectCollections();
  renderAdmin();
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
    ...state.groupTypes.map((object) => ({ ...object, objectType: 'group-types', tag: 'Group type' })),
    ...state.roleTypes.slice(0, 6).map((object) => ({ ...object, objectType: 'role-types', tag: 'Role type' })),
  ];

  list.innerHTML = items.map((object) => `
    <article class="list-item">
      <div>
        <h3>${escapeHtml(objectLabel(object, object.objectType))}</h3>
        <small>${escapeHtml(objectId(object))}</small>
      </div>
      <span class="tag">${escapeHtml(object.tag)}</span>
    </article>
  `).join('') || '<div class="empty-state">No reference data available.</div>';
}

function renderSystem() {
  const storage = state.status?.storage || {};
  const app = state.status?.app || {};
  const auth = state.status?.auth || {};
  const webauthn = state.status?.webauthn || {};

  document.querySelector('#storageState').textContent = storage.writable
    ? 'Data path is writable'
    : 'Data path is not writable';
  document.querySelector('#systemVersion').textContent = 'Storage';

  document.querySelector('#systemList').innerHTML = `
    ${renderWarnings(app.show_warnings ? app.warnings : null)}
    <dt>Signed in as</dt>
    <dd>${escapeHtml(auth.user?.display_name || auth.user?.username || '-')}</dd>
    <dt>Passkey RP ID</dt>
    <dd>${escapeHtml(webauthn.rp_id || '-')}</dd>
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
  setText('#groupTypesCount', formatCount(collections['group-types'], 'record'));
  setText('#rolesCount', formatCount(collections.roles, 'record'));
  setText('#roleTypesCount', formatCount(collections['role-types'], 'record'));
  setText('#timepointsCount', formatCount(collections.timepoints, 'record'));
}

function renderObjectCollections() {
  objectCollections.forEach(renderObjectCollection);
}

function renderObjectCollection(type) {
  const config = objectConfigs[type];
  const list = document.querySelector(config.list);
  if (!list) {
    return;
  }

  renderCreatePanel(type);
  if (!canAccessObjects()) {
    list.innerHTML = '<div class="empty-state">No object access.</div>';
    return;
  }

  const objects = state.objects[type] || [];
  list.innerHTML = objects.map((object) => renderObjectItem(type, object)).join('')
    || `<div class="empty-state">No ${escapeHtml((labels[type] || type).toLowerCase())} yet.</div>`;
}

function renderObjectItem(type, object) {
  const key = objectKey(type, objectId(object));
  const isEditing = Boolean(state.editing[key]);
  const canWrite = hasPermission('write');
  const summary = objectSummary(type, object);

  return `
    <article class="list-item object-item" data-object-type="${escapeAttribute(type)}" data-object-id="${escapeAttribute(objectId(object))}" data-revision="${Number(object._revision || 0)}">
      <div class="object-main">
        <div class="object-title-row">
          <div>
            <h3 data-object-title>${escapeHtml(objectLabel(object, type))}</h3>
            <small data-object-meta>${escapeHtml(objectMeta(object))}</small>
          </div>
          <span class="tag">${escapeHtml(labels[type] || type)}</span>
        </div>
        ${summary ? `<p class="object-summary">${escapeHtml(summary)}</p>` : ''}
        ${isEditing ? renderObjectEditor(type, object) : ''}
        <p class="object-save-state" data-save-state hidden></p>
      </div>
      <div class="user-actions object-actions">
        ${canWrite ? `
          <button class="button button-secondary" type="button" data-object-action="${isEditing ? 'close' : 'edit'}">${isEditing ? 'Close' : 'Edit'}</button>
          <button class="button button-danger" type="button" data-object-action="delete">Delete</button>
        ` : ''}
      </div>
    </article>
  `;
}

function renderObjectEditor(type, object) {
  return `
    <form class="object-editor" data-object-editor>
      ${visibleFields(type).map((field) => renderFieldInput(field, object[field.name], false)).join('')}
    </form>
  `;
}

function renderCreatePanel(type) {
  const panel = document.querySelector(`[data-create-panel="${cssEscape(type)}"]`);
  if (!panel) {
    return;
  }

  if (!state.createOpen[type] || !hasPermission('write')) {
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }

  panel.hidden = false;
  panel.innerHTML = `
    <form class="object-editor object-create-form" data-create-form="${escapeAttribute(type)}">
      ${visibleFields(type).map((field) => renderFieldInput(field, defaultFieldValue(field), true)).join('')}
      <div class="form-actions">
        <button class="button button-secondary" type="button" data-create-cancel="${escapeAttribute(type)}">Cancel</button>
        <button class="button" type="submit">Create</button>
      </div>
      <p class="object-save-state" data-create-state hidden></p>
    </form>
  `;
}

function renderFieldInput(field, value, isCreate) {
  const id = `${isCreate ? 'new' : 'edit'}-${field.name}-${Math.random().toString(36).slice(2)}`;
  const fieldAttrs = `data-object-field="${escapeAttribute(field.name)}" data-field-kind="${escapeAttribute(field.kind || 'text')}"`;
  const renderedValue = inputValue(value, field);

  if (field.kind === 'textarea') {
    return `
      <label class="object-field" for="${escapeAttribute(id)}">
        <span>${escapeHtml(field.label)}</span>
        <textarea id="${escapeAttribute(id)}" ${fieldAttrs} rows="3">${escapeHtml(renderedValue)}</textarea>
      </label>
    `;
  }

  if (field.kind === 'json') {
    return `
      <label class="object-field object-field-wide" for="${escapeAttribute(id)}">
        <span>${escapeHtml(field.label)}</span>
        <textarea id="${escapeAttribute(id)}" ${fieldAttrs} rows="4" spellcheck="false">${escapeHtml(renderedValue)}</textarea>
      </label>
    `;
  }

  if (field.kind === 'role-type-select' || field.kind === 'group-type-select') {
    return renderSelectField(field, renderedValue, fieldAttrs, id);
  }

  return `
    <label class="object-field" for="${escapeAttribute(id)}">
      <span>${escapeHtml(field.label)}</span>
      <input id="${escapeAttribute(id)}" ${fieldAttrs} value="${escapeAttribute(renderedValue)}" autocomplete="off">
    </label>
  `;
}

function renderSelectField(field, value, fieldAttrs, id) {
  const options = field.kind === 'role-type-select' ? state.roleTypes : state.groupTypes;
  const optionHtml = [
    '<option value="">None</option>',
    ...options.map((object) => `<option value="${escapeAttribute(objectId(object))}" ${objectId(object) === value ? 'selected' : ''}>${escapeHtml(objectLabel(object, field.kind === 'role-type-select' ? 'role-types' : 'group-types'))}</option>`),
  ].join('');

  return `
    <label class="object-field" for="${escapeAttribute(id)}">
      <span>${escapeHtml(field.label)}</span>
      <select id="${escapeAttribute(id)}" ${fieldAttrs}>${optionHtml}</select>
    </label>
  `;
}

async function handleObjectClick(event) {
  const createButton = event.target.closest('[data-create-type]');
  if (createButton) {
    state.createOpen[createButton.dataset.createType] = true;
    renderObjectCollection(createButton.dataset.createType);
    return;
  }

  const createCancel = event.target.closest('[data-create-cancel]');
  if (createCancel) {
    state.createOpen[createCancel.dataset.createCancel] = false;
    renderObjectCollection(createCancel.dataset.createCancel);
    return;
  }

  const createForm = event.target.closest('[data-create-form]');
  if (createForm && event.target.closest('button[type="submit"]')) {
    return;
  }

  const button = event.target.closest('[data-object-action]');
  if (!button) {
    return;
  }

  const item = button.closest('[data-object-type][data-object-id]');
  if (!item) {
    return;
  }

  const type = item.dataset.objectType;
  const id = item.dataset.objectId;
  const key = objectKey(type, id);
  const action = button.dataset.objectAction;

  if (action === 'edit') {
    state.editing[key] = true;
    renderObjectCollection(type);
    return;
  }

  if (action === 'close') {
    await flushObjectEdit(item, true);
    state.editing[key] = false;
    renderObjectCollection(type);
    return;
  }

  if (action === 'delete') {
    showDeleteConfirm(item);
    return;
  }

  if (action === 'cancel-delete') {
    clearDeleteConfirm(item);
    return;
  }

  if (action === 'confirm-delete') {
    await deleteObject(item);
  }
}

async function handleObjectInput(event) {
  const input = event.target.closest('[data-object-field]');
  if (!input) {
    return;
  }

  const item = input.closest('[data-object-type][data-object-id]');
  if (!item) {
    return;
  }

  markObjectDirty(item);
  scheduleObjectSave(item, 1400);
}

async function handleObjectChange(event) {
  const input = event.target.closest('[data-object-field]');
  if (!input) {
    return;
  }

  const item = input.closest('[data-object-type][data-object-id]');
  if (item) {
    markObjectDirty(item);
    scheduleObjectSave(item, 600);
    return;
  }

  const createForm = input.closest('[data-create-form]');
  if (createForm) {
    clearCreateState(createForm);
  }
}

function handleObjectBlur(event) {
  const input = event.target.closest('[data-object-field]');
  const item = input?.closest('[data-object-type][data-object-id]');
  if (item) {
    scheduleObjectSave(item, 250);
  }
}

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-create-form]');
  if (!form) {
    return;
  }

  event.preventDefault();
  await createObjectFromForm(form);
});

function markObjectDirty(item) {
  item.dataset.dirty = '1';
  setObjectSaveState(item, 'Unsaved', false);
}

function scheduleObjectSave(item, delay) {
  const key = objectKey(item.dataset.objectType, item.dataset.objectId);
  window.clearTimeout(state.editTimers[key]);
  state.editTimers[key] = window.setTimeout(() => {
    flushObjectEdit(item, false);
  }, delay);
}

async function flushObjectEdit(item, force) {
  if (!item?.isConnected || item.dataset.saving === '1') {
    return;
  }

  if (item.dataset.dirty !== '1') {
    return;
  }

  const type = item.dataset.objectType;
  const id = item.dataset.objectId;
  const revision = Number(item.dataset.revision || 0);
  let payload;
  try {
    payload = collectObjectFields(item);
  } catch (error) {
    setObjectSaveState(item, error.message, true);
    return;
  }

  const payloadKey = JSON.stringify(payload);
  if (item.dataset.lastSavedPayload === payloadKey && item.dataset.dirty !== '1') {
    return;
  }

  item.dataset.saving = '1';
  setObjectSaveState(item, 'Saving', false);

  try {
    const response = await postJson('object-update', {
      type,
      id,
      base_revision: revision,
      object: payload,
    });

    updateObjectInState(type, response.object);
    item.dataset.revision = Number(response.object._revision || revision);
    updateObjectChrome(item, type, response.object);

    const currentPayloadKey = JSON.stringify(collectObjectFields(item));
    if (currentPayloadKey === payloadKey) {
      item.dataset.dirty = '';
      item.dataset.lastSavedPayload = payloadKey;
      setObjectSaveState(item, 'Saved', false, true);
    } else {
      item.dataset.dirty = '1';
      scheduleObjectSave(item, 900);
    }
  } catch (error) {
    handleObjectSaveError(item, error);
  } finally {
    item.dataset.saving = '';
  }
}

async function createObjectFromForm(form) {
  const type = form.dataset.createForm;
  let payload;
  try {
    payload = collectObjectFields(form);
  } catch (error) {
    setCreateState(form, error.message, true);
    return;
  }

  setCreateState(form, 'Creating', false);
  try {
    await postJson('object-create', { type, object: payload });
    state.createOpen[type] = false;
    await reloadObjectData();
  } catch (error) {
    setCreateState(form, error.message || 'Object could not be created.', true);
  }
}

async function deleteObject(item) {
  const type = item.dataset.objectType;
  const id = item.dataset.objectId;
  try {
    await postJson('object-delete', {
      type,
      id,
      base_revision: Number(item.dataset.revision || 0),
    });

    state.editing[objectKey(type, id)] = false;
    await reloadObjectData();
  } catch (error) {
    handleObjectSaveError(item, error);
  }
}

function showDeleteConfirm(item) {
  clearDeleteConfirm(item);
  const actions = item.querySelector('.object-actions');
  if (!actions) {
    return;
  }

  actions.insertAdjacentHTML('beforeend', `
    <div class="delete-confirm">
      <span>Delete this object?</span>
      <button class="button button-danger" type="button" data-object-action="confirm-delete">Confirm</button>
      <button class="button button-secondary" type="button" data-object-action="cancel-delete">Cancel</button>
    </div>
  `);
}

function clearDeleteConfirm(item) {
  item.querySelector('.delete-confirm')?.remove();
}

function collectObjectFields(root) {
  const type = root.dataset.objectType || root.dataset.createForm;
  const payload = {};
  visibleFields(type).forEach((field) => {
    const input = root.querySelector(`[data-object-field="${cssEscape(field.name)}"]`);
    if (!input) {
      return;
    }

    payload[field.name] = readFieldValue(input, field);
  });

  return payload;
}

function readFieldValue(input, field) {
  const raw = input.value;
  if (field.kind === 'json') {
    const trimmed = raw.trim();
    if (trimmed === '') {
      return defaultFieldValue(field);
    }

    try {
      return JSON.parse(trimmed);
    } catch (_error) {
      throw new Error(`${field.label} must be valid JSON.`);
    }
  }

  if (field.kind === 'date') {
    return raw.trim() || null;
  }

  return raw;
}

function visibleFields(type) {
  const fields = objectConfigs[type]?.fields || [];
  if (hasPermission('sensitive')) {
    return fields;
  }

  return fields.filter((field) => !field.sensitive);
}

function defaultFieldValue(field) {
  if (Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
    return structuredCloneSafe(field.defaultValue);
  }

  if (field.kind === 'json') {
    return null;
  }

  if (field.kind === 'date') {
    return '';
  }

  return '';
}

function inputValue(value, field) {
  const actual = value === undefined ? defaultFieldValue(field) : value;
  if (field.kind === 'json') {
    return actual === null || actual === undefined ? '' : JSON.stringify(actual, null, 2);
  }

  if (field.kind === 'date') {
    if (actual && typeof actual === 'object') {
      return actual.value || actual.rawValue || actual.display || '';
    }

    return actual || '';
  }

  return actual === null || actual === undefined ? '' : String(actual);
}

function updateObjectInState(type, object) {
  const id = objectId(object);
  const list = state.objects[type] || [];
  const index = list.findIndex((candidate) => objectId(candidate) === id);
  if (index === -1) {
    list.push(object);
  } else {
    list[index] = object;
  }

  state.objects[type] = list;
  syncReferenceState();
}

function updateObjectChrome(item, type, object) {
  const title = item.querySelector('[data-object-title]');
  const meta = item.querySelector('[data-object-meta]');
  if (title) {
    title.textContent = objectLabel(object, type);
  }
  if (meta) {
    meta.textContent = objectMeta(object);
  }
}

function handleObjectSaveError(item, error) {
  if (error.status === 409 && error.payload?.current) {
    updateObjectInState(item.dataset.objectType, error.payload.current);
    setObjectSaveState(item, 'Conflict: reload before editing this object again.', true);
    return;
  }

  setObjectSaveState(item, error.message || 'Object update failed.', true);
}

function setObjectSaveState(item, text, isError, autoHide = false) {
  const element = item.querySelector('[data-save-state]');
  if (!element) {
    return;
  }

  element.hidden = false;
  element.textContent = text;
  element.className = `object-save-state ${isError ? 'is-error' : ''}`;
  if (autoHide) {
    window.setTimeout(() => {
      if (element.textContent === text) {
        element.hidden = true;
      }
    }, 1400);
  }
}

function setCreateState(form, text, isError) {
  const element = form.querySelector('[data-create-state]');
  if (!element) {
    return;
  }

  element.hidden = false;
  element.textContent = text;
  element.className = `object-save-state ${isError ? 'is-error' : ''}`;
}

function clearCreateState(form) {
  const element = form.querySelector('[data-create-state]');
  if (element) {
    element.hidden = true;
    element.textContent = '';
  }
}

function objectMeta(object) {
  const parts = [
    objectId(object),
    `rev ${Number(object._revision || 0)}`,
  ];
  if (object._modified) {
    parts.push(`modified ${object._modified}`);
  }

  return parts.join(' / ');
}

function objectSummary(type, object) {
  if (type === 'roles') {
    const roleType = state.roleTypes.find((candidate) => objectId(candidate) === object.type);
    const groupType = state.groupTypes.find((candidate) => objectId(candidate) === object.groupType);
    return [roleType ? objectLabel(roleType, 'role-types') : '', groupType ? objectLabel(groupType, 'group-types') : '']
      .filter(Boolean)
      .join(' / ');
  }

  if (type === 'timepoints' && object.date) {
    return typeof object.date === 'string' ? object.date : inputValue(object.date, { kind: 'date' });
  }

  return '';
}

function hasPendingObjectEdits() {
  return Boolean(document.querySelector('[data-object-editor], [data-create-form], [data-object-type][data-dirty="1"], [data-object-type][data-saving="1"]'));
}

function objectKey(type, id) {
  return `${type}:${id}`;
}

function structuredCloneSafe(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

function renderAdmin() {
  if (!hasPermission('manage_users')) {
    return;
  }

  setText('#userAdminCount', formatCount(state.users.length, 'user'));
  renderSetupResult();

  userList.innerHTML = state.users.map((user) => `
    <article class="list-item" data-user-id="${escapeHtml(user.id)}">
      <div>
        <h3>${escapeHtml(user.display_name || user.username || '(no username)')}</h3>
        <small>${escapeHtml(user.username || 'username pending')} / ${user.credential_count} passkey${user.credential_count === 1 ? '' : 's'} / ${user.enabled ? 'enabled' : 'disabled'}</small>
        <label class="inline-field">
          <span>Display name</span>
          <input data-display-name value="${escapeAttribute(user.display_name || '')}" placeholder="${escapeAttribute(user.username || '')}">
        </label>
        <div class="permission-row">
          ${renderPermissionCheckboxes(user.permissions)}
        </div>
      </div>
      <div class="user-actions">
        <button class="button button-secondary" type="button" data-action="save">Save</button>
        <button class="button button-secondary" type="button" data-action="setup">Setup link</button>
        <button class="button button-secondary" type="button" data-action="toggle">${user.enabled ? 'Disable' : 'Enable'}</button>
      </div>
    </article>
  `).join('') || '<div class="empty-state">No users.</div>';
}

function renderPermissionCheckboxes(permissions) {
  const options = [
    ['read', 'Read'],
    ['write', 'Write'],
    ['sensitive', 'Sensitive'],
    ['manage_users', 'Manage users'],
  ];

  return options.map(([value, label]) => `
    <label>
      <input type="checkbox" data-permission value="${value}" ${permissions.includes(value) ? 'checked' : ''}>
      ${label}
    </label>
  `).join('');
}

function renderSetupResult() {
  if (!state.setupResult) {
    setupResult.hidden = true;
    setupResult.innerHTML = '';
    return;
  }

  setupResult.hidden = false;
  const setupUrl = state.setupResult.setup_url || '';
  setupResult.innerHTML = `
    <h3>Setup Link</h3>
    <div class="qr-code" aria-label="Setup QR code">${qrSvg(setupUrl)}</div>
    <label>
      <span>URL</span>
      <input id="setupUrlResult" readonly value="${escapeAttribute(setupUrl)}">
    </label>
    <div class="form-actions">
      <button class="button button-secondary" type="button" data-copy="#setupUrlResult">Copy URL</button>
    </div>
    <small>Expires ${escapeHtml(state.setupResult.expires_at || '')}</small>
  `;
}

function qrSvg(value) {
  try {
    const modules = makeQrMatrix(value);
    const quiet = 4;
    const size = modules.length + quiet * 2;
    const cells = [];
    modules.forEach((row, y) => {
      row.forEach((isDark, x) => {
        if (isDark) {
          cells.push(`<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1"/>`);
        }
      });
    });

    return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Setup URL QR code" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#000">${cells.join('')}</g></svg>`;
  } catch (error) {
    console.error(error);
    return '<span>QR unavailable</span>';
  }
}

function makeQrMatrix(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = chooseQrVersion(bytes.length);
  const config = QR_M_CONFIG[version];
  const size = 21 + (version - 1) * 4;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunction = (x, y, value) => {
    if (x < 0 || y < 0 || x >= size || y >= size) {
      return;
    }

    matrix[y][x] = Boolean(value);
    reserved[y][x] = true;
  };

  drawFinder(matrix, reserved, 0, 0);
  drawFinder(matrix, reserved, size - 7, 0);
  drawFinder(matrix, reserved, 0, size - 7);
  drawTiming(setFunction, size);
  drawAlignment(setFunction, version, size);
  setFunction(8, size - 8, true);
  reserveFormatAreas(reserved, size);
  if (version >= 7) {
    reserveVersionAreas(reserved, size);
  }

  const dataCodewords = makeQrData(bytes, version, config.dataCodewords);
  const finalCodewords = addQrErrorCorrection(dataCodewords, config);
  placeQrBits(matrix, reserved, finalCodewords);

  let bestMatrix = null;
  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = matrix.map((row) => row.slice());
    applyQrMask(candidate, reserved, mask);
    writeQrFormat(candidate, reserved, 0, mask);
    if (version >= 7) {
      writeQrVersion(candidate, reserved, version);
    }

    const penalty = qrPenalty(candidate);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
      bestMatrix = candidate;
    }
  }

  if (!bestMatrix) {
    throw new Error('QR generation failed.');
  }

  writeQrFormat(bestMatrix, reserved, 0, bestMask);
  if (version >= 7) {
    writeQrVersion(bestMatrix, reserved, version);
  }

  return bestMatrix;
}

const QR_M_CONFIG = {
  1: { dataCodewords: 16, ecCodewords: 10, blocks: [16] },
  2: { dataCodewords: 28, ecCodewords: 16, blocks: [28] },
  3: { dataCodewords: 44, ecCodewords: 26, blocks: [44] },
  4: { dataCodewords: 64, ecCodewords: 18, blocks: [32, 32] },
  5: { dataCodewords: 86, ecCodewords: 24, blocks: [43, 43] },
  6: { dataCodewords: 108, ecCodewords: 16, blocks: [27, 27, 27, 27] },
  7: { dataCodewords: 124, ecCodewords: 18, blocks: [31, 31, 31, 31] },
  8: { dataCodewords: 154, ecCodewords: 22, blocks: [38, 38, 39, 39] },
  9: { dataCodewords: 182, ecCodewords: 22, blocks: [36, 36, 36, 37, 37] },
  10: { dataCodewords: 216, ecCodewords: 26, blocks: [43, 43, 43, 43, 44] },
};

const QR_ALIGNMENT = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

function chooseQrVersion(byteLength) {
  for (const version of Object.keys(QR_M_CONFIG).map(Number)) {
    const countBits = version < 10 ? 8 : 16;
    const neededBits = 4 + countBits + byteLength * 8;
    if (neededBits <= QR_M_CONFIG[version].dataCodewords * 8) {
      return version;
    }
  }

  throw new Error('Setup URL is too long for the built-in QR generator.');
}

function makeQrData(bytes, version, dataCodewords) {
  const bits = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, version < 10 ? 8 : 16);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const capacityBits = dataCodewords * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const data = [];
  for (let index = 0; index < bits.length; index += 8) {
    let value = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value << 1) | bits[index + bit];
    }
    data.push(value);
  }

  const pads = [0xec, 0x11];
  let padIndex = 0;
  while (data.length < dataCodewords) {
    data.push(pads[padIndex % 2]);
    padIndex += 1;
  }

  return data;
}

function appendBits(target, value, length) {
  for (let index = length - 1; index >= 0; index -= 1) {
    target.push((value >>> index) & 1);
  }
}

function drawFinder(matrix, reserved, x, y) {
  const size = matrix.length;
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= size || yy >= size) {
        continue;
      }

      const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6
        && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      matrix[yy][xx] = dark;
      reserved[yy][xx] = true;
    }
  }
}

function drawTiming(setFunction, size) {
  for (let index = 8; index < size - 8; index += 1) {
    const dark = index % 2 === 0;
    setFunction(index, 6, dark);
    setFunction(6, index, dark);
  }
}

function drawAlignment(setFunction, version, size) {
  const positions = QR_ALIGNMENT[version];
  positions.forEach((y) => {
    positions.forEach((x) => {
      const overlapsFinder = (x === 6 && y === 6) || (x === 6 && y === size - 7) || (x === size - 7 && y === 6);
      if (overlapsFinder) {
        return;
      }

      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          setFunction(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    });
  });
}

function reserveFormatAreas(reserved, size) {
  for (let index = 0; index < 9; index += 1) {
    reserved[8][index] = true;
    reserved[index][8] = true;
    reserved[8][size - 1 - index] = true;
    reserved[size - 1 - index][8] = true;
  }
}

function reserveVersionAreas(reserved, size) {
  for (let y = 0; y < 6; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      reserved[y][size - 11 + x] = true;
      reserved[size - 11 + x][y] = true;
    }
  }
}

function addQrErrorCorrection(dataCodewords, config) {
  const blocks = [];
  let offset = 0;
  config.blocks.forEach((length) => {
    const data = dataCodewords.slice(offset, offset + length);
    offset += length;
    blocks.push({ data, ec: reedSolomonRemainder(data, config.ecCodewords) });
  });

  const result = [];
  const maxDataLength = Math.max(...blocks.map((block) => block.data.length));
  for (let index = 0; index < maxDataLength; index += 1) {
    blocks.forEach((block) => {
      if (index < block.data.length) {
        result.push(block.data[index]);
      }
    });
  }

  for (let index = 0; index < config.ecCodewords; index += 1) {
    blocks.forEach((block) => result.push(block.ec[index]));
  }

  return result;
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = data.concat(Array(degree).fill(0));
  data.forEach((_value, index) => {
    const factor = result[index];
    if (factor === 0) {
      return;
    }

    generator.forEach((coefficient, generatorIndex) => {
      result[index + generatorIndex] ^= gfMultiply(coefficient, factor);
    });
  });

  return result.slice(data.length);
}

function reedSolomonGenerator(degree) {
  let polynomial = [1];
  for (let index = 0; index < degree; index += 1) {
    const next = Array(polynomial.length + 1).fill(0);
    polynomial.forEach((coefficient, coefficientIndex) => {
      next[coefficientIndex] ^= gfMultiply(coefficient, 1);
      next[coefficientIndex + 1] ^= gfMultiply(coefficient, gfExp(index));
    });
    polynomial = next;
  }

  return polynomial;
}

function gfMultiply(left, right) {
  if (left === 0 || right === 0) {
    return 0;
  }

  return gfExp(gfLog(left) + gfLog(right));
}

const GF_EXP = (() => {
  const values = Array(512).fill(0);
  let x = 1;
  for (let index = 0; index < 255; index += 1) {
    values[index] = x;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  for (let index = 255; index < 512; index += 1) {
    values[index] = values[index - 255];
  }
  return values;
})();

const GF_LOG = (() => {
  const values = Array(256).fill(0);
  for (let index = 0; index < 255; index += 1) {
    values[GF_EXP[index]] = index;
  }
  return values;
})();

function gfExp(index) {
  return GF_EXP[index % 255];
}

function gfLog(value) {
  return GF_LOG[value];
}

function placeQrBits(matrix, reserved, codewords) {
  const size = matrix.length;
  const bits = [];
  codewords.forEach((codeword) => appendBits(bits, codeword, 8));
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) {
      right -= 1;
    }

    for (let vertical = 0; vertical < size; vertical += 1) {
      const y = upward ? size - 1 - vertical : vertical;
      for (let dx = 0; dx < 2; dx += 1) {
        const x = right - dx;
        if (reserved[y][x]) {
          continue;
        }

        matrix[y][x] = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
}

function applyQrMask(matrix, reserved, mask) {
  matrix.forEach((row, y) => {
    row.forEach((_value, x) => {
      if (!reserved[y][x] && qrMaskBit(mask, x, y)) {
        matrix[y][x] = !matrix[y][x];
      }
    });
  });
}

function qrMaskBit(mask, x, y) {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function writeQrFormat(matrix, reserved, ecLevelBits, mask) {
  const size = matrix.length;
  const bits = qrBch((ecLevelBits << 3) | mask, 0x537, 10) ^ 0x5412;
  const first = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
  const second = [[size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8], [size - 8, 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]];

  first.forEach(([x, y], index) => {
    matrix[y][x] = ((bits >> index) & 1) === 1;
    reserved[y][x] = true;
  });
  second.forEach(([x, y], index) => {
    matrix[y][x] = ((bits >> index) & 1) === 1;
    reserved[y][x] = true;
  });
}

function writeQrVersion(matrix, reserved, version) {
  const size = matrix.length;
  const bits = qrBch(version, 0x1f25, 12);
  for (let index = 0; index < 18; index += 1) {
    const bit = ((bits >> index) & 1) === 1;
    const x = size - 11 + (index % 3);
    const y = Math.floor(index / 3);
    matrix[y][x] = bit;
    matrix[x][y] = bit;
    reserved[y][x] = true;
    reserved[x][y] = true;
  }
}

function qrBch(value, polynomial, degree) {
  let bits = value << degree;
  while (bitLength(bits) - bitLength(polynomial) >= 0) {
    bits ^= polynomial << (bitLength(bits) - bitLength(polynomial));
  }

  return (value << degree) | bits;
}

function bitLength(value) {
  let length = 0;
  while (value !== 0) {
    length += 1;
    value >>>= 1;
  }
  return length;
}

function qrPenalty(matrix) {
  const size = matrix.length;
  let penalty = 0;

  for (let y = 0; y < size; y += 1) {
    penalty += linePenalty(matrix[y]);
  }

  for (let x = 0; x < size; x += 1) {
    const column = [];
    for (let y = 0; y < size; y += 1) {
      column.push(matrix[y][x]);
    }
    penalty += linePenalty(column);
  }

  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const color = matrix[y][x];
      if (matrix[y][x + 1] === color && matrix[y + 1][x] === color && matrix[y + 1][x + 1] === color) {
        penalty += 3;
      }
    }
  }

  const pattern = '10111010000';
  const reverse = '00001011101';
  for (let y = 0; y < size; y += 1) {
    const row = matrix[y].map((value) => (value ? '1' : '0')).join('');
    penalty += countPattern(row, pattern) * 40;
    penalty += countPattern(row, reverse) * 40;
  }
  for (let x = 0; x < size; x += 1) {
    let column = '';
    for (let y = 0; y < size; y += 1) {
      column += matrix[y][x] ? '1' : '0';
    }
    penalty += countPattern(column, pattern) * 40;
    penalty += countPattern(column, reverse) * 40;
  }

  const total = size * size;
  const dark = matrix.flat().filter(Boolean).length;
  penalty += Math.floor(Math.abs((dark * 100 / total) - 50) / 5) * 10;

  return penalty;
}

function linePenalty(line) {
  let penalty = 0;
  let runColor = line[0];
  let runLength = 1;
  for (let index = 1; index <= line.length; index += 1) {
    if (line[index] === runColor) {
      runLength += 1;
      continue;
    }

    if (runLength >= 5) {
      penalty += 3 + runLength - 5;
    }
    runColor = line[index];
    runLength = 1;
  }

  return penalty;
}

function countPattern(text, pattern) {
  let count = 0;
  for (let index = 0; index <= text.length - pattern.length; index += 1) {
    if (text.slice(index, index + pattern.length) === pattern) {
      count += 1;
    }
  }
  return count;
}

function decodeCreationOptions(publicKey) {
  return {
    ...publicKey,
    challenge: base64urlToBuffer(publicKey.challenge),
    user: {
      ...publicKey.user,
      id: base64urlToBuffer(publicKey.user.id),
    },
    excludeCredentials: (publicKey.excludeCredentials || []).map((credential) => ({
      ...credential,
      id: base64urlToBuffer(credential.id),
    })),
  };
}

function decodeRequestOptions(publicKey) {
  const decoded = {
    ...publicKey,
    challenge: base64urlToBuffer(publicKey.challenge),
  };

  if (Array.isArray(publicKey.allowCredentials)) {
    decoded.allowCredentials = publicKey.allowCredentials.map((credential) => ({
      ...credential,
      id: base64urlToBuffer(credential.id),
    }));
  }

  return decoded;
}

function credentialToJson(credential) {
  const response = credential.response;
  const result = {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
    },
  };

  if (response.attestationObject) {
    result.response.attestationObject = bufferToBase64url(response.attestationObject);
  }

  if (response.authenticatorData) {
    result.response.authenticatorData = bufferToBase64url(response.authenticatorData);
  }

  if (response.signature) {
    result.response.signature = bufferToBase64url(response.signature);
  }

  if (response.userHandle) {
    result.response.userHandle = bufferToBase64url(response.userHandle);
  }

  if (typeof response.getTransports === 'function') {
    result.response.transports = response.getTransports();
  }

  return result;
}

function base64urlToBuffer(value) {
  const base64 = String(value).replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function normalizeSetupInput(value) {
  const trimmed = String(value || '').trim();
  try {
    const url = new URL(trimmed, window.location.href);
    return url.searchParams.get('setup') || trimmed;
  } catch (_error) {
    return trimmed;
  }
}

function passkeyErrorMessage(error) {
  if (error?.name === 'NotAllowedError') {
    return 'Passkey operation was cancelled.';
  }

  return error?.message || 'Passkey operation failed.';
}

function hasPermission(permission) {
  const permissions = state.status?.auth?.user?.permissions || [];
  return permissions.includes(permission);
}

function canAccessObjects() {
  return hasPermission('read') || hasPermission('write');
}

function objectLabel(object, type = '') {
  if (type === 'people') {
    const parts = [object.forename, object.lastname].filter(Boolean).join(' ');
    return object.scoutname || parts || objectId(object);
  }

  if (type === 'roles') {
    const roleType = state.roleTypes.find((candidate) => objectId(candidate) === object.type);
    return roleType ? objectLabel(roleType, 'role-types') : object.type || objectId(object);
  }

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

function showAuthMessage(text, isError) {
  authMessage.hidden = false;
  authMessage.textContent = text;
  authMessage.className = `message global-message ${isError ? 'is-error' : 'is-good'}`;
}

function clearAuthMessage() {
  authMessage.hidden = true;
  authMessage.textContent = '';
  authMessage.className = 'message global-message';
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

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

function cssEscape(value) {
  if (window.CSS?.escape) {
    return window.CSS.escape(String(value));
  }

  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
