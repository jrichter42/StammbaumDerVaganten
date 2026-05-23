const labels = {
  people: 'Personen',
  groups: 'Gruppen',
  'group-types': 'Gruppenarten',
  roles: 'Rollen',
  timepoints: 'Zeitpunkte',
};

const objectTypeLabels = {
  people: 'Person',
  groups: 'Gruppe',
  'group-types': 'Gruppenart',
  roles: 'Rolle',
  timepoints: 'Zeitpunkt',
};

const countNouns = {
  record: ['Datensatz', 'Datensätze'],
  group: ['Gruppe', 'Gruppen'],
  'person record': ['Personendatensatz', 'Personendatensätze'],
  role: ['Rolle', 'Rollen'],
  timepoint: ['Zeitpunkt', 'Zeitpunkte'],
  'public group': ['öffentliche Gruppe', 'öffentliche Gruppen'],
  'public person record': ['öffentlicher Personendatensatz', 'öffentliche Personendatensätze'],
  user: ['Benutzer', 'Benutzer'],
  passkey: ['Passkey', 'Passkeys'],
};

const emptyCollectionLabels = {
  people: 'Personen',
  groups: 'Gruppen',
  'group-types': 'Gruppenarten',
  roles: 'Rollen',
  timepoints: 'Zeitpunkte',
};

const objectCollections = ['people', 'groups', 'group-types', 'roles', 'timepoints'];
const collectionTypes = [...objectCollections, 'users'];
const collectionVisibleStep = 100;
const groupTypeReferenceFilterMinOptions = 25;
const sortCollator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });
const pickerActionShowAllGroups = '__picker_show_all_groups__';
const pickerActionShowAllRoles = '__picker_show_all_roles__';
const certaintyOptions = [
  ['none', 'Keine'],
  ['no_idea', 'Unbekannt'],
  ['estimation_bad', 'Grobe Schätzung'],
  ['estimation_medium', 'Mittlere Schätzung'],
  ['estimation_good', 'Gute Schätzung'],
  ['confident', 'Sicher'],
  ['set_in_stone', 'Gesichert'],
];

const stockGroupTypeLabelGroups = [
  ['Stamm'],
  ['Meute'],
  ['Rudel'],
  ['Gilde'],
  ['Sippe'],
  ['Runde'],
  ['Kreis'],
];

const stockRoleLabelGroups = [
  ['Stammesführung'],
  ['Stellv. Stammesführung'],
  ['Kassenwart'],
  ['Stellv. Kassenwart', 'Stellv. Kassenwart*in'],
  ['Handkasse'],
  ['Meutenführung'],
  ['Meutenassistenz'],
  ['Rudelführung'],
  ['Sippenführung'],
  ['Gildensprecher', 'Gildensprecher*in'],
  ['Rundensprecher', 'Rundensprecher*in'],
  ['Kreisleitung'],
];

const objectConfigs = {
  people: {
    list: '#peopleList',
    fields: [
      { name: 'forename', label: 'Vorname', visibility: 'private' },
      { name: 'scoutname', label: 'Pfadiname', visibility: 'private' },
      { name: 'lastname', label: 'Nachname', visibility: 'private' },
      { name: 'description', label: 'Beschreibung', kind: 'textarea' },
      { name: 'birthdate', label: 'Geburtsdatum', kind: 'date', visibility: 'protected' },
      { name: 'contactInfo', label: 'Kontakt', kind: 'textarea', visibility: 'protected' },
      { name: '_certainty', label: 'Gewissheit', kind: 'certainty' },
      { name: '_sources', label: 'Quellen', kind: 'source-display', visibility: 'private' },
      { name: 'notes', label: 'Notizen', kind: 'textarea', visibility: 'private' },
      { name: 'memberships', label: 'Mitgliedschaften', kind: 'membership-list', defaultValue: [] },
      { name: 'activities', label: 'Aktivitäten', kind: 'activity-list', defaultValue: [] },
    ],
  },
  groups: {
    list: '#groupsList',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Beschreibung', kind: 'textarea' },
      { name: 'mainPhase', label: 'Hauptphase', kind: 'group-phase', defaultValue: null },
      { name: '_certainty', label: 'Gewissheit', kind: 'certainty' },
      { name: '_sources', label: 'Quellen', kind: 'source-display', visibility: 'private' },
      { name: 'notes', label: 'Notizen', kind: 'textarea', visibility: 'private' },
      { name: 'additionalPhases', label: 'Weitere Phasen', kind: 'group-phase-list', defaultValue: [] },
    ],
  },
  'group-types': {
    list: '#groupTypesList',
    fields: [
      { name: 'label', label: 'Name' },
      { name: 'description', label: 'Beschreibung', kind: 'textarea' },
      { name: 'notes', label: 'Notizen', kind: 'textarea', visibility: 'private' },
    ],
  },
  roles: {
    list: '#rolesList',
    fields: [
      { name: 'label', label: 'Name' },
      { name: 'description', label: 'Beschreibung', kind: 'textarea' },
      { name: 'groupTypes', label: 'Gruppenarten', kind: 'reference-list', collection: 'group-types', defaultValue: [] },
      { name: '_certainty', label: 'Gewissheit', kind: 'certainty' },
      { name: '_sources', label: 'Quellen', kind: 'source-display', visibility: 'private' },
      { name: 'notes', label: 'Notizen', kind: 'textarea', visibility: 'private' },
    ],
  },
  timepoints: {
    list: '#timepointsList',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'date', label: 'Datum', kind: 'date' },
      { name: 'description', label: 'Beschreibung', kind: 'textarea' },
      { name: '_certainty', label: 'Gewissheit', kind: 'certainty' },
      { name: '_sources', label: 'Quellen', kind: 'source-display', visibility: 'private' },
      { name: 'notes', label: 'Notizen', kind: 'textarea', visibility: 'private' },
    ],
  },
};

const collectionSortOptions = {
  people: [
    ['scoutname', 'Pfadiname'],
    ['forename', 'Vorname'],
    ['lastname', 'Nachname'],
    ['birthdate', 'Geburtsdatum'],
    ['membershipStart', 'Mitgliedschaft'],
    ['activityStart', 'Aktivität'],
  ],
  groups: [
    ['name', 'Name'],
    ['groupType', 'Gruppenart'],
    ['start', 'Start'],
    ['end', 'Ende'],
  ],
  'group-types': [
    ['label', 'Name'],
  ],
  roles: [
    ['label', 'Name'],
    ['groupType', 'Gruppenart'],
  ],
  timepoints: [
    ['name', 'Name'],
    ['date', 'Datum'],
  ],
  users: [
    ['username', 'Benutzername'],
    ['passkeys', 'Passkeys'],
    ['status', 'Status'],
  ],
};

const collectionDefaultSorts = {
  people: 'forename',
  groups: 'name',
  'group-types': 'label',
  roles: 'label',
  timepoints: 'date',
  users: 'username',
};

const collectionDefaultSortDirections = {
  groups: {
    start: 'desc',
    end: 'desc',
  },
  people: {
    birthdate: 'desc',
  },
  timepoints: {
    date: 'desc',
  },
};

const editSourceStorageKey = 'stammbaum.editSource';

const state = {
  status: null,
  objects: Object.fromEntries(objectCollections.map((type) => [type, []])),
  groupTypes: [],
  users: [],
  setupTokens: [],
  setupResult: null,
  createOpen: {},
  collectionUi: Object.fromEntries(collectionTypes.map((type) => [type, { sort: collectionDefaultSorts[type], sortDirection: collectionDefaultSortDirection(type, collectionDefaultSorts[type]), search: '', filters: {}, sortExplicit: false }])),
  collectionVisibleCounts: Object.fromEntries(collectionTypes.map((type) => [type, collectionVisibleStep])),
  deepLinkTarget: null,
  editing: {},
  relationshipEditing: {},
  editTimers: {},
  exampleDataCreating: false,
  publicGraphGroupType: '',
  sourceOverride: readStoredSourceOverride(),
};

const connectionStatus = document.querySelector('#connectionStatus');
const currentUserLabel = document.querySelector('#currentUserLabel');
const loginButton = document.querySelector('#loginButton');
const logoutButton = document.querySelector('#logoutButton');
const passkeyLoginButton = document.querySelector('#passkeyLoginButton');
const authScreen = document.querySelector('#authScreen');
const publicOverview = document.querySelector('#publicOverview');
const workspace = document.querySelector('#workspace');
const authMessage = document.querySelector('#authMessage');
const globalSearch = document.querySelector('#globalSearch');
const globalSearchInput = document.querySelector('#globalSearchInput');
const globalSearchResults = document.querySelector('#globalSearchResults');
const sourceControl = document.querySelector('#sourceControl');
const sourceInput = document.querySelector('#sourceInput');
const sourceClearButton = document.querySelector('#sourceClearButton');
const setupForm = document.querySelector('#setupForm');
const setupPanel = document.querySelector('#setupPanel');
const setupInput = document.querySelector('#setupInput');
const usersNav = document.querySelector('#usersNav');
const usersNavGroup = document.querySelector('#usersNavGroup');
const setupResult = document.querySelector('#setupResult');
const exampleDataButton = document.querySelector('#exampleDataButton');
const exampleDataState = document.querySelector('#exampleDataState');
const userList = document.querySelector('#userList');
const appContent = document.querySelector('.app-content');
const backToTopButton = document.querySelector('#backToTopButton');
const treeGroupTypeFilters = Array.from(document.querySelectorAll('[data-tree-group-type-filter]'));
const treeGroupTypeClearButtons = Array.from(document.querySelectorAll('[data-tree-group-type-clear]'));

const urlSetup = new URLSearchParams(window.location.search).get('setup');
let isSetupPage = Boolean(urlSetup);
let publicNetwork = null;
let publicGraphSignature = '';
if (urlSetup) {
  setupInput.value = urlSetup;
  setupPanel.hidden = false;
}

restoreUrlState();

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    const viewName = button.dataset.view;
    if (!(await canSwitchToView(viewName))) {
      return;
    }
    activateView(viewName);
    await refreshActivatedView(viewName);
  });
});

loginButton.addEventListener('click', beginLogin);
passkeyLoginButton.addEventListener('click', beginLogin);
logoutButton.addEventListener('click', logout);
globalSearchInput?.addEventListener('input', renderGlobalSearchResults);
sourceInput?.addEventListener('input', handleSourceInput);
sourceInput?.addEventListener('blur', () => updateSourceControl());
sourceClearButton?.addEventListener('click', clearSourceOverride);
treeGroupTypeFilters.forEach((filter) => filter.addEventListener('change', handlePublicGraphFilterChange));
treeGroupTypeClearButtons.forEach((button) => button.addEventListener('click', clearPublicGraphFilter));
setupForm.addEventListener('submit', beginSetup);
setupResult.addEventListener('click', copySetupValue);
userList.addEventListener('click', handleUserAction);
document.addEventListener('click', handleNavigationJump);
document.addEventListener('click', handleGlobalSearchClick);
document.addEventListener('click', handleExampleDataClick);
document.addEventListener('click', handleObjectClick);
document.addEventListener('pointermove', handleDateDetailPointerMove);
document.addEventListener('pointerover', handleDateDetailPreview);
document.addEventListener('pointerout', handleDateDetailPreviewEnd);
document.addEventListener('input', handleCollectionControlInput);
document.addEventListener('input', handleReferenceFilterInput);
document.addEventListener('input', handleObjectInput);
document.addEventListener('change', handleCollectionControlChange);
document.addEventListener('change', handleReferencePickerChange);
document.addEventListener('change', handleObjectChange);
document.addEventListener('focusout', handleObjectBlur);
document.addEventListener('focusin', handleEditorFocus);
appContent?.addEventListener('scroll', updateBackToTopButton, { passive: true });
backToTopButton?.addEventListener('click', scrollBackToTop);
window.addEventListener('beforeunload', handleBeforeUnload);

updateBackToTopButton();
refresh();
window.setInterval(pollObjects, 12000);

function updateBackToTopButton() {
  if (!backToTopButton) {
    return;
  }

  backToTopButton.hidden = appScrollRoot().scrollTop <= 4;
}

function scrollBackToTop() {
  appScrollRoot().scrollTo({ top: 0, behavior: 'smooth' });
}

function handleBeforeUnload(event) {
  const form = openCreateForm();
  if (!form || isPristineCreateForm(form)) {
    return;
  }

  event.preventDefault();
  event.returnValue = '';
}

function activateView(viewName, urlExtra = {}) {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === viewName);
  });

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('is-active', view.id === `view-${viewName}`);
  });

  writeUrlState({ view: viewName, ...urlExtra });
  if (viewName === 'tree') {
    publicGraphSignature = '';
    renderTreeGraph();
  }
}

function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const id = params.get('id');
  state.publicGraphGroupType = params.get('group-type') || params.get('gruppenart') || params.get('groupType') || '';

  if (view === 'tree') {
    window.requestAnimationFrame(() => activateView('tree'));
    return;
  }

  if (view && (objectCollections.includes(view) || view === 'users')) {
    const collectionType = viewCollectionType(view);
    const urlSort = readUrlSortState(collectionType, params);
    state.deepLinkTarget = id && objectCollections.includes(view) ? { view, id } : null;
    state.collectionUi[collectionType] = {
      ...collectionUi(collectionType),
      sort: urlSort.sort,
      sortDirection: urlSort.direction,
      search: params.get('q') || '',
      sortExplicit: urlSort.explicit,
    };
    window.requestAnimationFrame(() => activateView(view, id ? { id } : {}));
  }
}

function writeUrlState(extra = {}) {
  if (isSetupPage) {
    return;
  }

  const activeView = extra.view || document.querySelector('[data-view].is-active')?.dataset.view || 'people';
  if (activeView === 'tree') {
    const params = new URLSearchParams();
    params.set('view', 'tree');
    if (state.publicGraphGroupType) {
      params.set('group-type', state.publicGraphGroupType);
    }
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    return;
  }

  const urlView = activeView;
  const collectionType = viewCollectionType(urlView);
  const ui = collectionUi(collectionType);
  const activeSort = collectionSortKey(collectionType);
  const params = new URLSearchParams();
  params.set('view', urlView);
  const activeId = Object.prototype.hasOwnProperty.call(extra, 'id') ? extra.id : activeEditingId(collectionType);
  if (activeId && objectCollections.includes(urlView)) {
    params.set('id', activeId);
  }
  if (ui?.search) {
    params.set('q', ui.search);
  }
  if (activeSort && ui.sortExplicit) {
    params.set('sort', `${ui.sortDirection === 'desc' ? '-' : ''}${activeSort}`);
  }

  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

function writeTreeGraphUrlState() {
  if (isSetupPage) {
    return;
  }

  const loggedIn = Boolean(state.status?.auth?.user);
  const activeView = document.querySelector('[data-view].is-active')?.dataset.view || '';
  const params = new URLSearchParams();
  if (loggedIn) {
    params.set('view', activeView === 'tree' ? 'tree' : activeView || 'people');
  }
  if (state.publicGraphGroupType) {
    params.set('group-type', state.publicGraphGroupType);
  }

  const query = params.toString();
  window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
}

function viewCollectionType(view) {
  return view === 'users' ? 'users' : view;
}

function readUrlSortState(type, params) {
  const fallbackSort = collectionDefaultSorts[type];
  const rawSort = params.get('sort') || '';
  const marker = rawSort[0] || '';
  const requestedSort = ['-', '+', ' '].includes(marker) ? rawSort.slice(1) : rawSort;
  const sortOptions = collectionSortOptions[type] || [];
  const hasRequestedSort = sortOptions.some(([value]) => value === requestedSort);
  const sort = hasRequestedSort ? requestedSort : fallbackSort;
  const legacyDirection = params.get('dir');
  const explicit = hasRequestedSort || ['asc', 'desc'].includes(legacyDirection);
  const direction = ['asc', 'desc'].includes(legacyDirection)
    ? legacyDirection
    : (marker === '-' ? 'desc' : (['+', ' '].includes(marker) ? 'asc' : collectionDefaultSortDirection(type, sort)));
  return { sort, direction: direction === 'desc' ? 'desc' : 'asc', explicit };
}

function activeEditingId(type) {
  const prefix = `${type}:`;
  const key = Object.keys(state.editing).find((candidate) => state.editing[candidate] && candidate.startsWith(prefix));
  return key ? key.slice(prefix.length) : '';
}

function applyDeepLinkTarget() {
  const target = state.deepLinkTarget;
  if (!target?.view || !target.id) {
    return;
  }

  const item = document.querySelector(`[data-object-type="${cssEscape(target.view)}"][data-object-id="${cssEscape(target.id)}"]`);
  if (!item) {
    return;
  }

  state.deepLinkTarget = null;
  state.editing[objectKey(target.view, target.id)] = true;
  renderObjectCollection(target.view);
  window.requestAnimationFrame(() => scrollObjectEditorIntoView(target.view, target.id, item.parentElement?.id || ''));
}

async function handleNavigationJump(event) {
  const button = event.target.closest('[data-jump-view]');
  if (!button) {
    return;
  }

  event.preventDefault();
  const viewName = button.dataset.jumpView;
  if (!(await canSwitchToView(viewName))) {
    return;
  }
  activateView(viewName);
  await refreshActivatedView(viewName);
}

async function canSwitchToView(viewName) {
  if (!viewName || viewName === currentViewName()) {
    return true;
  }

  if (!(await resolveOpenCreateFormBeforeSwitch())) {
    return false;
  }

  await closeOpenEditorsBeforeSwitch();
  return true;
}

function currentViewName() {
  return document.querySelector('[data-view].is-active')?.dataset.view || 'people';
}

async function resolveOpenCreateFormBeforeSwitch() {
  const form = openCreateForm();
  if (!form) {
    return true;
  }

  if (isPristineCreateForm(form)) {
    closeCreateForm(form);
    return true;
  }

  if (form.matches('[data-create-form]')) {
    return createObjectFromForm(form);
  }

  if (window.confirm('Der neue Eintrag ist noch nicht erstellt. Wechseln und Eingaben verwerfen?')) {
    closeCreateForm(form);
    return true;
  }

  return false;
}

async function closeOpenEditorsBeforeSwitch() {
  const objectItems = Array.from(document.querySelectorAll('[data-object-editor]'))
    .map((editor) => editor.closest('[data-object-type][data-object-id]'))
    .filter(Boolean);
  const hasUserEditor = Boolean(document.querySelector('[data-user-editor]'));
  if (!objectItems.length && !hasUserEditor) {
    return;
  }

  const renderTypes = new Set();
  for (const item of objectItems) {
    const type = item.dataset.objectType;
    const id = item.dataset.objectId;
    const key = objectKey(type, id);
    window.clearTimeout(state.editTimers[key]);
    await flushObjectEdit(item, true);
    state.editing[key] = false;
    delete state.relationshipEditing[key];
    renderTypes.add(type);
  }

  if (hasUserEditor) {
    Object.keys(state.editing)
      .filter((key) => key.startsWith('users:'))
      .forEach((key) => {
        state.editing[key] = false;
      });
    renderUserList();
  }

  renderTypes.forEach((type) => {
    renderObjectCollection(type);
  });
}

async function refreshActivatedView(viewName) {
  if (viewName === 'users') {
    await loadManagedUsers();
    renderUsersManagement();
    return;
  }

  if (viewName === 'tree') {
    if (canAccessObjects() && !hasPendingObjectEdits()) {
      try {
        await loadObjects();
      } catch (error) {
        console.error(error);
      }
    }
    renderTreeGraph();
    return;
  }

  if (!objectCollections.includes(viewName)) {
    return;
  }

  if (canAccessObjects() && !hasPendingObjectEdits()) {
    try {
      await loadObjects();
    } catch (error) {
      console.error(error);
    }
  }

  renderNavigationCounts();
  if (!activeViewHasOpenEditor(viewName)) {
    renderObjectCollection(viewName);
  }
}

function activeViewHasOpenEditor(viewName) {
  const view = document.querySelector(`#view-${cssEscape(viewName)}`);
  return Boolean(view?.querySelector('[data-object-editor], [data-create-form], [data-user-create-form], [data-user-editor]'));
}

async function handleGlobalSearchClick(event) {
  const button = event.target.closest('[data-global-search-result]');
  if (!button) {
    if (!event.target.closest('#globalSearch')) {
      hideGlobalSearchResults();
    }
    return;
  }

  const type = button.dataset.globalSearchType;
  const id = button.dataset.globalSearchId;
  if (!type || !id) {
    return;
  }
  if (openCreateForm() && !(await resolveOpenCreateFormBeforeSwitch())) {
    return;
  }

  await closeOpenEditorsBeforeSwitch();
  activateView(type);
  hideGlobalSearchResults();
  globalSearchInput.value = '';

  let item = objectListItem(type, id);
  if (!item) {
    const ui = collectionUi(type);
    ui.search = '';
    ui.filters = {};
    expandCollectionVisibleCountToObject(type, id);
    renderCollectionControls();
    renderObjectCollection(type);
    item = objectListItem(type, id);
  }

  if (item) {
    await focusObjectEditor(item);
  }
}

function objectListItem(type, id) {
  return document.querySelector(`[data-object-type="${cssEscape(type)}"][data-object-id="${cssEscape(id)}"]`);
}

function renderGlobalSearchResults() {
  if (!globalSearchResults) {
    return;
  }

  const query = String(globalSearchInput?.value || '').trim().toLocaleLowerCase('de');
  if (query.length < 2) {
    hideGlobalSearchResults();
    return;
  }

  const matches = objectCollections.flatMap((type) => (state.objects[type] || []).map((object) => ({ type, object })))
    .filter(({ type, object }) => collectionSearchText(type, object).toLocaleLowerCase('de').includes(query))
    .slice(0, 10);

  globalSearchResults.hidden = false;
  globalSearchResults.innerHTML = matches.map(({ type, object }) => `
    <button type="button" data-global-search-result data-global-search-type="${escapeAttribute(type)}" data-global-search-id="${escapeAttribute(objectId(object))}">
      <strong>${escapeHtml(objectListTitle(type, object))}</strong>
      <span>${escapeHtml([objectTypeLabels[type] || type, objectListMeta(type, object)].filter(Boolean).join(' · '))}</span>
    </button>
  `).join('') || '<div class="global-search-empty">Keine Treffer</div>';
}

function hideGlobalSearchResults() {
  if (globalSearchResults) {
    globalSearchResults.hidden = true;
    globalSearchResults.innerHTML = '';
  }
}

async function refresh() {
  setConnection('Lädt', '');
  clearAuthMessage();

  try {
    state.status = await getJson('api.php?action=status');
    renderShell();

    const user = state.status.auth?.user || null;
    await loadObjects();

    if (hasPermission('manage_users')) {
      await loadManagedUsers();
    }

    render();
    const writable = Boolean(state.status.storage && state.status.storage.writable);
    if (user) {
      setConnection(writable ? 'Online' : 'Eingeloggt', writable ? 'is-online' : '');
    }
    if (!user) {
      showBootstrapHint();
    }
  } catch (error) {
    console.error(error);
    setConnection('Offline', 'is-offline');
    showAuthMessage(localizeErrorMessage(error.message || 'Anfrage fehlgeschlagen'), true);
  }
}

function renderShell() {
  const user = state.status?.auth?.user || null;
  authScreen.hidden = Boolean(user) || !isSetupPage;
  publicOverview.hidden = Boolean(user) || isSetupPage;
  workspace.hidden = !user;
  connectionStatus.hidden = !user;
  if (globalSearch) {
    globalSearch.hidden = !user;
  }
  if (sourceControl) {
    sourceControl.hidden = !user || !hasPermission('write');
  }
  loginButton.hidden = Boolean(user);
  logoutButton.hidden = !user;
  currentUserLabel.hidden = !user;
  passkeyLoginButton.closest('#loginPanel').hidden = true;
  setupPanel.hidden = Boolean(user) || !isSetupPage;

  if (user) {
    currentUserLabel.textContent = user.display_name || user.username || 'Eingeloggt';
  }
  updateSourceControl();

  const canManageUsers = hasPermission('manage_users');
  usersNavGroup.hidden = !canManageUsers;
  usersNav.hidden = !canManageUsers;
  if (!canManageUsers && document.querySelector('#view-users')?.classList.contains('is-active')) {
    activateView('people');
  }

  document.querySelectorAll('[data-create-type]').forEach((button) => {
    const type = button.dataset.createType || '';
    button.hidden = type === 'users' ? !canManageUsers : !hasPermission('write');
  });
  updateExampleDataVisibility();
}

function handleSourceInput() {
  const value = (sourceInput?.value || '').replace(/,/g, '');
  if (sourceInput && sourceInput.value !== value) {
    sourceInput.value = value;
  }
  state.sourceOverride = value;
  writeStoredSourceOverride(value);
  if (sourceClearButton) {
    sourceClearButton.hidden = state.sourceOverride.trim() === '';
  }
}

function clearSourceOverride() {
  state.sourceOverride = '';
  writeStoredSourceOverride('');
  updateSourceControl();
  sourceInput?.focus();
}

function updateSourceControl() {
  if (!sourceInput) {
    return;
  }

  const fallback = defaultEditSource();
  sourceInput.value = state.sourceOverride;
  sourceInput.placeholder = fallback;
  if (sourceClearButton) {
    sourceClearButton.hidden = state.sourceOverride.trim() === '';
  }
}

function currentEditSource() {
  return String(state.sourceOverride || defaultEditSource()).replace(/,/g, '').trim();
}

function defaultEditSource() {
  const user = state.status?.auth?.user || {};
  return String(user.username || user.display_name || '').trim();
}

function readStoredSourceOverride() {
  try {
    return (window.sessionStorage?.getItem(editSourceStorageKey) || '').replace(/,/g, '');
  } catch (_error) {
    return '';
  }
}

function writeStoredSourceOverride(value) {
  try {
    const clean = String(value || '').replace(/,/g, '');
    if (clean.trim()) {
      window.sessionStorage?.setItem(editSourceStorageKey, clean);
    } else {
      window.sessionStorage?.removeItem(editSourceStorageKey);
    }
  } catch (_error) {
    // Storage can be unavailable in strict privacy modes.
  }
}

function showBootstrapHint() {
  const auth = state.status?.auth || {};
  const webauthn = state.status?.webauthn || {};
  if (webauthn.secure_context_required) {
    showAuthMessage(`Passkeys benötigen HTTPS für ${webauthn.rp_id}.`, true);
    return;
  }
  if (webauthn.openssl_available === false) {
    showAuthMessage('Die PHP-Erweiterung OpenSSL ist für den Passkey-Login erforderlich.', true);
    return;
  }

  if (auth.bootstrap_pending) {
    showAuthMessage(auth.setup_url_hint || 'Das initiale Setup steht noch aus.', false);
  }
}

async function beginLogin() {
  clearAuthMessage();
  if (!window.PublicKeyCredential) {
    showAuthMessage('Dieser Browser unterstützt keine Passkeys.', true);
    return;
  }
  if (!window.isSecureContext) {
    showAuthMessage('Passkeys benötigen HTTPS, außer auf lokalen Entwicklungs-Hosts.', true);
    return;
  }

  try {
    const options = await postJson('auth-login-options');
    const credential = await navigator.credentials.get({
      publicKey: decodeRequestOptions(options.publicKey),
    });

    if (!credential) {
      throw new Error('Der Passkey-Login wurde abgebrochen.');
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
    showAuthMessage('Dieser Browser unterstützt keine Passkeys.', true);
    return;
  }
  if (!window.isSecureContext) {
    showAuthMessage('Passkeys benötigen HTTPS, außer auf lokalen Entwicklungs-Hosts.', true);
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
      throw new Error('Das Passkey-Setup wurde abgebrochen.');
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
    state.sourceOverride = '';
    writeStoredSourceOverride('');
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
  if (document.hidden || !canAccessObjects() || hasPendingObjectEdits()) {
    return;
  }

  try {
    await loadObjects();
    render();
  } catch (error) {
    console.error(error);
  }
}

async function loadManagedUsers() {
  if (!hasPermission('manage_users')) {
    return;
  }

  const response = await getJson('api.php?action=admin-users');
  state.users = response.users || [];
  state.setupTokens = response.setup_tokens || [];
  renderUsersManagement();
  renderNavigationCounts();
}

async function createUser(form) {
  const formData = new FormData(form);
  const username = String(formData.get('username') || '').trim();
  const permissions = formData.getAll('permissions');
  if (!username) {
    showAuthMessage('Benutzername ist erforderlich.', true);
    form.querySelector('input[name="username"]')?.focus();
    return;
  }

  setCreateState(form, 'Wird erstellt', false);
  try {
    const response = await postJson('admin-create-user', {
      username,
      display_name: String(formData.get('display_name') || '').trim(),
      permissions,
    });

    state.setupResult = response.setup;
    state.createOpen.users = false;
    renderSetupResult();
    await loadManagedUsers();
  } catch (error) {
    setCreateState(form, localizeErrorMessage(error.message || 'Benutzer konnte nicht erstellt werden.'), true);
  }
}

async function handleUserAction(event) {
  const userButton = event.target.closest('button[data-user-action]');
  if (userButton) {
    const item = userButton.closest('[data-username]');
    const username = item?.dataset.username;
    if (!username) {
      return;
    }

    if (userButton.dataset.userAction === 'toggle-editor') {
      if (state.editing[objectKey('users', username)]) {
        closeUserEditor(username);
      } else {
        focusUserEditor(username);
      }
    }
    return;
  }

  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const item = button.closest('[data-username]');
  const username = item?.dataset.username;
  if (!username) {
    return;
  }

  const user = state.users.find((candidate) => candidate.username === username);
  if (!user) {
    return;
  }

  try {
    if (button.dataset.action === 'setup') {
      const response = await postJson('admin-create-setup-token', { username });
      state.setupResult = response.setup;
      await loadManagedUsers();
      renderSetupResult();
      return;
    }

    if (button.dataset.action === 'delete-setup-token') {
      if (!confirmDangerButton(button)) {
        return;
      }

      const tokenId = button.dataset.tokenId || '';
      const response = await postJson('admin-delete-setup-token', { token_id: tokenId });
      state.setupTokens = response.setup_tokens || [];
      resetDangerConfirmations();
      renderUserList();
      return;
    }

    if (button.dataset.action === 'delete-user') {
      if (!confirmDangerButton(button)) {
        return;
      }

      const response = await postJson('admin-delete-user', { username });
      state.users = response.users || [];
      state.setupTokens = response.setup_tokens || [];
      resetDangerConfirmations();
      renderNavigationCounts();
      renderUserList();
      return;
    }

    if (button.dataset.action === 'toggle') {
      await postJson('admin-update-user', {
        username,
        enabled: !user.enabled,
      });
      await reloadAfterUserChange(username);
      return;
    }

    if (button.dataset.action === 'save') {
      const permissions = Array.from(item.querySelectorAll('input[data-permission]:checked'))
        .map((input) => input.value);
      const displayName = item.querySelector('input[data-display-name]')?.value.trim() || '';
      await postJson('admin-update-user', {
        username,
        display_name: displayName,
        permissions,
      });
      await reloadAfterUserChange(username);
    }
  } catch (error) {
    showAuthMessage(localizeErrorMessage(error.message || 'Benutzer konnte nicht aktualisiert werden.'), true);
  }
}

function closeUserEditor(username) {
  state.editing[objectKey('users', username)] = false;
  renderUserList();
}

function focusUserEditor(username) {
  state.editing = { [objectKey('users', username)]: true };
  renderUserList();
  window.requestAnimationFrame(() => {
    const item = document.querySelector(`[data-username="${cssEscape(username)}"]`);
    const editor = item?.querySelector('[data-user-editor]');
    if (editor) {
      scrollElementIntoView(item);
    }
  });
}

async function reloadAfterUserChange(username) {
  if (state.status?.auth?.user?.username === username) {
    await refresh();
    return;
  }

  await loadManagedUsers();
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

  const requestBody = action.startsWith('object-') && !Object.prototype.hasOwnProperty.call(body, 'source')
    ? { ...body, source: currentEditSource() }
    : body;

  const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  return readJsonResponse(response);
}

async function readJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    const error = new Error(localizeErrorMessage(payload.error || `Anfrage fehlgeschlagen: ${response.status}`));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function render() {
  renderTreeGraph();
  renderMetrics();
  renderReferenceData();
  renderSystem();
  renderSectionCounts();
  renderCollectionControls();
  renderObjectCollections();
  renderUsersManagement();
  applyDeepLinkTarget();
}

function renderTreeGraph() {
  const root = activeTreeGraphRoot();
  if (!root) {
    return;
  }

  const groups = state.objects.groups || [];
  const people = state.objects.people || [];
  const roles = state.objects.roles || [];
  const groupTypes = state.groupTypes || [];

  renderPublicGraphFilter(root, groupTypes, groups);
  renderPublicGraph(root, groups, people, roles, groupTypes);
}

function handlePublicGraphFilterChange(event) {
  state.publicGraphGroupType = event.target.value || '';
  publicGraphSignature = '';
  writeTreeGraphUrlState();
  renderTreeGraph();
}

function clearPublicGraphFilter() {
  state.publicGraphGroupType = '';
  publicGraphSignature = '';
  treeGroupTypeFilters.forEach((filter) => {
    filter.value = '';
  });
  writeTreeGraphUrlState();
  renderTreeGraph();
}

function renderPublicGraphFilter(root, groupTypes, groups = []) {
  const filter = root.querySelector('[data-tree-group-type-filter]');
  if (!filter) {
    return;
  }

  const availableTypeIds = availableTreeGroupTypeIds(groups);
  const availableGroupTypes = groupTypes.filter((type) => availableTypeIds.has(objectId(type)));
  const options = [
    '<option value="">Alle Gruppenarten</option>',
    ...availableGroupTypes.map((type) => {
      const id = objectId(type);
      return `<option value="${escapeAttribute(id)}" ${id === state.publicGraphGroupType ? 'selected' : ''}>${escapeHtml(objectLabel(type, 'group-types'))}</option>`;
    }),
  ].join('');

  if (filter.innerHTML !== options) {
    filter.innerHTML = options;
  }

  if (state.publicGraphGroupType && !availableTypeIds.has(state.publicGraphGroupType)) {
    state.publicGraphGroupType = '';
    filter.value = '';
    writeTreeGraphUrlState();
  }

  filter.disabled = availableGroupTypes.length < 2;

  const clearButton = root.querySelector('[data-tree-group-type-clear]');
  if (clearButton) {
    clearButton.disabled = !state.publicGraphGroupType || availableGroupTypes.length < 2;
  }
}

function availableTreeGroupTypeIds(groups) {
  return new Set((groups || []).flatMap((group) => (objectId(group) ? groupTypeIds(group) : [])));
}

function renderPublicGraph(root, groups, people, roles, groupTypes) {
  const container = root.querySelector('[data-tree-graph]');
  const status = root.querySelector('[data-tree-graph-status]');
  if (!container) {
    return;
  }

  const visNetwork = window.vis;
  if (!visNetwork?.Network || !visNetwork?.DataSet) {
    setTreeGraphStatus(status, 'Graph-Bibliothek konnte nicht geladen werden.');
    return;
  }

  const graph = publicGraphData(groups, people, roles, groupTypes, state.publicGraphGroupType);
  if (!graph.nodes.length) {
    if (publicNetwork) {
      publicNetwork.destroy();
      publicNetwork = null;
      publicGraphSignature = '';
    }
    setTreeGraphStatus(status, 'Noch keine öffentliche Struktur.');
    return;
  }

  const signature = JSON.stringify({ root: root.id || '', graph });
  if (signature === publicGraphSignature && publicNetwork) {
    publicNetwork.redraw();
    return;
  }

  publicGraphSignature = signature;
  setTreeGraphStatus(status, '');

  if (publicNetwork) {
    publicNetwork.destroy();
  }

  publicNetwork = new visNetwork.Network(container, {
    nodes: new visNetwork.DataSet(graph.nodes),
    edges: new visNetwork.DataSet(graph.edges),
  }, publicGraphOptions(graph));

  publicNetwork.once('stabilizationIterationsDone', () => {
    publicNetwork.fit({ animation: { duration: 240, easingFunction: 'easeInOutQuad' } });
  });
}

function setTreeGraphStatus(status, text) {
  if (!status) {
    return;
  }

  status.textContent = text;
  status.hidden = !text;
}

function activeTreeGraphRoot() {
  const roots = Array.from(document.querySelectorAll('[data-tree-graph-root]'));
  return roots.find((root) => {
    if (root.hidden) {
      return false;
    }

    const view = root.classList.contains('view') ? root : root.closest('.view');
    return !view || view.classList.contains('is-active');
  }) || null;
}

function publicGraphData(groups, people, roles, groupTypes, groupTypeFilter = '') {
  const nodes = [];
  const edges = [];
  const groupStats = publicGroupStats(groups, people);
  const visibleGroups = groups.filter((group) => {
    const id = objectId(group);
    if (!id) {
      return false;
    }

    return !groupTypeFilter || groupTypeIds(group).includes(groupTypeFilter);
  });
  const groupIds = new Set(visibleGroups.map(objectId).filter(Boolean));

  visibleGroups.forEach((group, index) => {
    const id = objectId(group);
    if (!id) {
      return;
    }

    const type = groupTypeLabel(group, groupTypes);
    const stats = groupStats.get(id) || { members: 0, activities: 0, span: '' };
    nodes.push({
      id: `group:${id}`,
      label: publicGraphEntryLabel([
        publicGroupLabel(group, groupTypes, index),
        [type || 'Gruppe', stats.span].filter(Boolean).join(' · '),
        publicGraphCountLine(stats.members, 'Mitgliedschaft', 'Mitgliedschaften'),
        publicGraphCountLine(stats.activities, 'Aktivität', 'Aktivitäten'),
      ]),
      title: publicGraphTitle([
        publicGroupLabel(group, groupTypes, index),
        type ? `Gruppenart: ${type}` : '',
        stats.span ? `Zeitraum: ${stats.span}` : '',
        publicGraphCountLine(stats.members, 'Mitgliedschaft', 'Mitgliedschaften'),
        publicGraphCountLine(stats.activities, 'Aktivität', 'Aktivitäten'),
        String(group.description || '').trim(),
      ]),
      group: 'group',
      shape: 'box',
    });
  });

  people.forEach((person, personIndex) => {
    const personId = objectId(person);
    if (!personId) {
      return;
    }

    const memberships = (Array.isArray(person.memberships) ? person.memberships : [])
      .map((membership, index) => ({ membership, index, groupId: periodEntryGroupId(membership) }))
      .filter((entry) => groupIds.has(entry.groupId));

    const activities = (Array.isArray(person.activities) ? person.activities : [])
      .map((activity, index) => ({ activity, index, groupId: periodEntryGroupId(activity) }))
      .filter((entry) => groupIds.has(entry.groupId));

    activities.forEach((activityEntry) => {
      const sourceMemberships = memberships.filter((membershipEntry) => (
        periodsCouldOverlap(membershipEntry.membership.period, {
          startYear: periodStartYear(activityEntry.activity.period),
          endYear: periodEndYear(activityEntry.activity.period),
        })
      ));

      (sourceMemberships.length ? sourceMemberships : memberships).forEach((membershipEntry) => {
        const role = publicRoleLabel(roles.find((candidate) => objectId(candidate) === activityRoleId(activityEntry.activity)));
        const membershipYears = periodYearLabel(membershipEntry.membership.period);
        const activityYears = periodYearLabel(activityEntry.activity.period);
        const personLabel = publicPersonLabel(person, personIndex);
        const sourceGroup = findReferenceObject('groups', membershipEntry.groupId);
        const targetGroup = findReferenceObject('groups', activityEntry.groupId);
        edges.push({
          id: `membership-activity:${personId}:${membershipEntry.index}:${activityEntry.index}`,
          from: `group:${membershipEntry.groupId}`,
          to: `group:${activityEntry.groupId}`,
          label: publicGraphEdgeLabel([personLabel, role, activityYears]),
          title: publicGraphTitle([
            personLabel,
            role,
            `Mitgliedschaft: ${objectLabel(sourceGroup, 'groups')}${membershipYears ? ` (${membershipYears})` : ''}`,
            `Aktivität: ${objectLabel(targetGroup, 'groups')}${activityYears ? ` (${activityYears})` : ''}`,
            String(person.description || '').trim(),
          ]),
          group: 'activity',
          arrows: 'to',
          width: 2.1,
        });
      });
    });
  });

  applyPublicGraphLevels(nodes, edges);
  return { nodes, edges, layout: 'top-down' };
}

function applyPublicGraphLevels(nodes, edges) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const levels = new Map(nodes.map((node) => [node.id, 0]));
  const directedEdges = edges.filter((edge) => edge.from !== edge.to && nodeIds.has(edge.from) && nodeIds.has(edge.to));

  for (let iteration = 0; iteration < nodes.length; iteration += 1) {
    let changed = false;
    directedEdges.forEach((edge) => {
      const nextLevel = Math.min((levels.get(edge.from) || 0) + 1, nodes.length - 1);
      if (nextLevel > (levels.get(edge.to) || 0)) {
        levels.set(edge.to, nextLevel);
        changed = true;
      }
    });
    if (!changed) {
      break;
    }
  }

  nodes.forEach((node) => {
    node.level = levels.get(node.id) || 0;
  });
}

function publicGraphOptions(graph = {}) {
  const topDown = graph.layout === 'top-down';
  return {
    autoResize: true,
    layout: {
      hierarchical: {
        enabled: topDown,
        direction: 'UD',
        sortMethod: topDown ? 'directed' : 'hubsize',
        nodeSpacing: 260,
        levelSeparation: 260,
        treeSpacing: 320,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
        shakeTowards: 'roots',
      },
    },
    physics: {
      enabled: true,
      solver: topDown ? 'hierarchicalRepulsion' : 'forceAtlas2Based',
      adaptiveTimestep: true,
      maxVelocity: 28,
      minVelocity: 0.9,
      hierarchicalRepulsion: {
        nodeDistance: 240,
        springLength: 190,
        damping: 0.42,
      },
      forceAtlas2Based: {
        gravitationalConstant: -70,
        centralGravity: 0.015,
        springLength: 190,
        springConstant: 0.055,
        damping: 0.42,
        avoidOverlap: 0.65,
      },
      repulsion: {
        nodeDistance: 240,
        springLength: 190,
        damping: 0.42,
      },
      stabilization: {
        enabled: true,
        iterations: 45,
        updateInterval: 10,
        fit: true,
      },
    },
    interaction: {
      dragNodes: false,
      hover: true,
      tooltipDelay: 140,
      navigationButtons: false,
      keyboard: false,
    },
    nodes: {
      borderWidth: 1,
      borderWidthSelected: 2,
      margin: { top: 12, right: 14, bottom: 12, left: 14 },
      widthConstraint: { minimum: 168, maximum: 210 },
      color: {
        border: 'rgba(216,216,90,0.48)',
        background: '#151b20',
        highlight: { border: '#d8d85a', background: '#1c252b' },
        hover: { border: '#d8d85a', background: '#1c252b' },
      },
      font: {
        color: '#ece8d9',
        face: 'Aptos, Segoe UI, Inter, sans-serif',
        size: 15,
        multi: 'html',
        bold: {
          color: '#fbf7de',
          size: 18,
          face: 'Aptos Display, Aptos, Segoe UI, Inter, sans-serif',
          mod: 'bold',
        },
      },
      shapeProperties: {
        borderRadius: 8,
      },
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.25)',
        size: 10,
        x: 0,
        y: 4,
      },
    },
    groups: {
      group: {
        color: { border: '#d8d85a', background: '#1f2118' },
        font: { color: '#f4f0cf', bold: true },
        shapeProperties: { borderRadius: 8 },
      },
    },
    edges: {
      color: { color: 'rgba(195,201,197,0.62)', highlight: '#d8d85a', hover: '#d8d85a' },
      width: 1.6,
      smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.32 },
      font: {
        color: '#cfd6d2',
        strokeColor: '#0b0f12',
        strokeWidth: 4,
        size: 12,
        face: 'Aptos, Segoe UI, Inter, sans-serif',
      },
    },
  };
}

function publicSippeGraphData(groups, people, roles, groupTypes, groupStats, sippeTypeIds) {
  const nodes = [];
  const edges = [];
  const groupIds = new Set(groups.map(objectId).filter(Boolean));
  const levelByGroupId = publicSippeLevelMap(groups, groupStats);

  groups.forEach((group, index) => {
    const id = objectId(group);
    const stats = groupStats.get(id) || { members: 0, activities: 0, span: '' };
    nodes.push({
      id: `group:${id}`,
      label: publicGraphEntryLabel([
        publicGroupLabel(group, groupTypes, index),
        stats.span,
        publicGraphMemberLine(stats.members),
      ]),
      title: publicGraphTitle([
        publicGroupLabel(group, groupTypes, index),
        stats.span ? `Zeitraum: ${stats.span}` : '',
        publicGraphMemberLine(stats.members),
        String(group.description || '').trim(),
      ]),
      group: 'group',
      level: levelByGroupId.get(id) || 0,
      shape: 'box',
    });
  });

  people.forEach((person, personIndex) => {
    const personId = objectId(person);
    if (!personId) {
      return;
    }

    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, activityIndex) => {
      const targetGroupId = periodEntryGroupId(activity);
      if (!groupIds.has(targetGroupId)) {
        return;
      }

      const sourceGroupId = publicSourceSippeForActivity(person, activity.period, groupIds, sippeTypeIds, targetGroupId);
      if (!sourceGroupId) {
        return;
      }

      const role = publicRoleLabel(roles.find((candidate) => objectId(candidate) === activityRoleId(activity)));
      const years = periodYearLabel(activity.period);
      const personLabel = publicPersonLabel(person, personIndex);
      edges.push({
        id: `sippe-activity:${sourceGroupId}:${targetGroupId}:${personId}:${activityIndex}`,
        from: `group:${sourceGroupId}`,
        to: `group:${targetGroupId}`,
        label: publicGraphEdgeLabel([role, personLabel]),
        title: publicGraphTitle([
          role,
          personLabel,
          years,
          `Von: ${objectLabel(findReferenceObject('groups', sourceGroupId), 'groups')}`,
          `Nach: ${objectLabel(findReferenceObject('groups', targetGroupId), 'groups')}`,
          String(person.description || '').trim(),
        ]),
        group: 'sippe-activity',
        arrows: 'to',
        width: 2.2,
        color: { color: '#d8d85a', highlight: '#f2f28b', hover: '#f2f28b' },
      });
    });
  });

  return { nodes, edges, layout: 'top-down' };
}

function publicSourceSippeForActivity(person, activityPeriod, groupIds, sippeTypeIds, targetGroupId) {
  const activityRange = { startYear: periodStartYear(activityPeriod), endYear: periodEndYear(activityPeriod) };
  const memberships = (Array.isArray(person.memberships) ? person.memberships : [])
    .map((membership) => ({ membership, groupId: periodEntryGroupId(membership) }))
    .filter((entry) => entry.groupId && entry.groupId !== targetGroupId && groupIds.has(entry.groupId))
    .filter((entry) => publicGroupHasType(entry.groupId, sippeTypeIds));

  return (memberships.find((entry) => periodsCouldOverlap(entry.membership.period, activityRange)) || memberships[0])?.groupId || '';
}

function publicSippeLevelMap(groups, groupStats) {
  const entries = groups.map((group) => {
    const id = objectId(group);
    const year = Number((String(groupStats.get(id)?.span || '').match(/\d{4}/) || [])[0] || 0);
    return { id, year };
  });
  const orderedYears = [...new Set(entries.map((entry) => entry.year).filter(Boolean))].sort((left, right) => left - right);
  const fallbackLevel = orderedYears.length;
  return new Map(entries.map((entry) => [
    entry.id,
    entry.year ? orderedYears.indexOf(entry.year) : fallbackLevel,
  ]));
}

function publicGroupTypeIdsByLabel(groupTypes, label) {
  const folded = publicFoldLabel(label);
  return new Set(groupTypes
    .filter((type) => publicFoldLabel(objectLabel(type, 'group-types')) === folded)
    .map(objectId)
    .filter(Boolean));
}

function publicRoleIdsByLabel(roles, label) {
  const folded = publicFoldLabel(label);
  return new Set(roles
    .filter((role) => publicFoldLabel(publicRoleLabel(role)) === folded)
    .map(objectId)
    .filter(Boolean));
}

function publicSippenfuehrungLineage(visibleGroups, people, sippeTypeIds, sippenfuehrungRoleIds) {
  const visibleGroupIds = new Set(visibleGroups.map(objectId).filter(Boolean));
  const links = [];

  people.forEach((person) => {
    const personId = objectId(person);
    if (!personId) {
      return;
    }

    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, activityIndex) => {
      const childGroupId = periodEntryGroupId(activity);
      if (!visibleGroupIds.has(childGroupId) || !sippenfuehrungRoleIds.has(activityRoleId(activity))) {
        return;
      }

      if (!publicGroupHasType(childGroupId, sippeTypeIds)) {
        return;
      }

      const parentGroupId = publicParentSippeForPerson(person, activity.period, visibleGroupIds, sippeTypeIds, childGroupId);
      if (parentGroupId) {
        links.push({ personId, parentGroupId, childGroupId, activityIndex });
      }
    });
  });

  const groupLevels = publicLineageGroupLevels(visibleGroupIds, links);
  const personLevels = new Map();
  const personParents = new Map();
  links.forEach((link) => {
    const level = (groupLevels.get(link.parentGroupId) || 0) + 1;
    const current = personLevels.get(link.personId);
    if (current === undefined || level < current) {
      personLevels.set(link.personId, level);
      personParents.set(link.personId, link.parentGroupId);
    }
  });

  return { links, groupLevels, personLevels, personParents };
}

function publicLineageGroupLevels(groupIds, links) {
  const levels = new Map(Array.from(groupIds).map((id) => [id, 0]));
  for (let iteration = 0; iteration < Math.max(1, links.length); iteration += 1) {
    let changed = false;
    links.forEach((link) => {
      const next = Math.min((levels.get(link.parentGroupId) || 0) + 2, 18);
      if (next > (levels.get(link.childGroupId) || 0)) {
        levels.set(link.childGroupId, next);
        changed = true;
      }
    });
    if (!changed) {
      break;
    }
  }
  return levels;
}

function publicParentSippeForPerson(person, activityPeriod, visibleGroupIds, sippeTypeIds, childGroupId) {
  const activityRange = { startYear: periodStartYear(activityPeriod), endYear: periodEndYear(activityPeriod) };
  const memberships = (Array.isArray(person.memberships) ? person.memberships : [])
    .map((membership) => ({ membership, groupId: periodEntryGroupId(membership) }))
    .filter((entry) => entry.groupId && entry.groupId !== childGroupId && visibleGroupIds.has(entry.groupId))
    .filter((entry) => publicGroupHasType(entry.groupId, sippeTypeIds));

  return (memberships.find((entry) => periodsCouldOverlap(entry.membership.period, activityRange)) || memberships[0])?.groupId || '';
}

function publicGroupHasType(groupId, typeIds) {
  return groupTypeIds(findReferenceObject('groups', groupId)).some((id) => typeIds.has(id));
}

function publicLineageLinkForActivity(links, personId, groupId, activityIndex) {
  return links.find((link) => (
    link.personId === personId
    && link.childGroupId === groupId
    && link.activityIndex === activityIndex
  )) || null;
}

function publicPersonLeadsGroup(links, personId, groupId) {
  return links.some((link) => link.personId === personId && link.childGroupId === groupId);
}

function publicPersonIsOnlyLineageBridge(links, personId) {
  return links.some((link) => link.personId === personId);
}

function publicFoldLabel(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ü/g, 'u')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/gi, '')
    .toLocaleLowerCase('de-DE');
}

function publicGroupStats(groups, people) {
  const stats = new Map(groups.map((group) => [objectId(group), {
    members: 0,
    activities: 0,
    years: [],
    span: publicPeriodSpan(groupPhases(group).map((phase) => phase.period)),
  }]));

  people.forEach((person) => {
    (Array.isArray(person.memberships) ? person.memberships : []).forEach((membership) => {
      const entry = stats.get(periodEntryGroupId(membership));
      if (entry) {
        entry.members += 1;
        entry.years.push(periodYearLabel(membership.period));
      }
    });

    (Array.isArray(person.activities) ? person.activities : []).forEach((activity) => {
      const entry = stats.get(periodEntryGroupId(activity));
      if (entry) {
        entry.activities += 1;
        entry.years.push(periodYearLabel(activity.period));
      }
    });
  });

  stats.forEach((entry) => {
    entry.span = entry.span || publicYearSpan(entry.years);
  });

  return stats;
}

function publicPeriodSpan(periods) {
  return publicYearSpan((periods || []).flatMap((period) => {
    if (!period || typeof period !== 'object') {
      return [];
    }
    return [
      referenceYear('timepoints', period.startTimepoint) || dateYear(period.customStart),
      referenceYear('timepoints', period.endTimepoint) || dateYear(period.customEnd),
    ].filter(Boolean);
  }));
}

function publicYearSpan(years) {
  const numeric = (years || []).flatMap((value) => String(value || '').match(/\d{4}/g) || [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  if (!numeric.length) {
    return '';
  }
  const start = Math.min(...numeric);
  const end = Math.max(...numeric);
  return start === end ? String(start) : `${start}-${end}`;
}

function publicGroupLabel(group, groupTypes, index) {
  const type = groupTypeLabel(group, groupTypes);
  const name = String(group.name || group.label || group.description || `Gruppe ${index + 1}`).trim();
  return [type, name].filter(Boolean).join(' ');
}

function publicPersonLabel(person, index) {
  return String(person.description || `Person ${index + 1}`).trim();
}

function publicRoleLabel(role) {
  return String(role?.label || role?.name || 'Rolle').trim();
}

function publicGraphEntryLabel(lines) {
  const clean = lines.map((line) => String(line || '').trim()).filter(Boolean);
  if (!clean.length) {
    return '';
  }
  return [`<b>${publicGraphShortLabel(clean[0], 34)}</b>`, ...clean.slice(1).map((line) => publicGraphShortLabel(line, 34))].join('\n');
}

function publicGraphCountLine(count, singular, plural) {
  return `${Number(count || 0)} ${Number(count || 0) === 1 ? singular : plural}`;
}

function publicGraphMemberLine(count) {
  return `${Number(count || 0)} ${Number(count || 0) === 1 ? 'Mitglied' : 'Mitglieder'}`;
}

function publicGraphEdgeLabel(lines) {
  return lines.map((line) => publicGraphShortLabel(line, 30)).filter(Boolean).join('\n');
}

function publicGraphTitle(lines) {
  return lines.map((line) => String(line || '').trim()).filter(Boolean).map(escapeHtml).join('<br>');
}

function publicGraphShortLabel(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function renderCreateForm(type, fields) {
  const hasSide = editorFieldSections(fields).internal.length > 0;
  return `
    <form class="object-editor object-editor-layout object-create-form ${hasSide ? 'has-side' : 'no-side'}" data-create-form="${escapeAttribute(type)}">
      ${renderEditorFields(type, fields, {}, true)}
      <div class="form-actions">
        <button class="button button-secondary" type="button" data-create-cancel="${escapeAttribute(type)}">Abbrechen</button>
        <button class="button" type="submit">Erstellen</button>
      </div>
      <p class="object-save-state" data-create-state hidden></p>
    </form>
  `;
}

function periodYearLabel(period) {
  if (!period || typeof period !== 'object') {
    return '';
  }

  const start = referenceYear('timepoints', period.startTimepoint) || dateYear(period.customStart);
  const end = referenceYear('timepoints', period.endTimepoint) || dateYear(period.customEnd);

  if (start && end) {
    return start === end ? start : `${start}-${end}`;
  }

  if (start) {
    return `seit ${start}`;
  }

  if (end) {
    return `bis ${end}`;
  }

  return '';
}

function referenceYear(collection, id) {
  if (!id) {
    return '';
  }

  const object = (state.objects[collection] || []).find((candidate) => objectId(candidate) === id);
  return object ? dateYear(object.date) : '';
}

function dateYear(value) {
  const display = dateDisplayValue(value);
  const match = String(display || '').match(/\d{4}/);
  return match ? match[0] : '';
}

function dateDisplayValue(value) {
  const raw = dateRawString(value);
  if (!raw) {
    return '';
  }

  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return raw;
  }

  if (parts.month === '00') {
    return parts.year;
  }

  if (parts.day === '00') {
    return `${parts.month}.${parts.year}`;
  }

  return `${parts.day}.${parts.month}.${parts.year}`;
}

function renderMetrics() {
  const grid = document.querySelector('#metricGrid');
  if (!grid) {
    return;
  }

  const collections = state.status?.storage?.collections || {};
  const visible = ['people', 'groups', 'group-types', 'roles', 'timepoints'];

  grid.innerHTML = visible.map((key) => `
    <article class="metric">
      <h3>${escapeHtml(labels[key] || key)}</h3>
      <span class="metric-value">${Number(collections[key] || 0)}</span>
    </article>
  `).join('');
}

function renderReferenceData() {
  const list = document.querySelector('#referenceList');
  if (!list) {
    return;
  }

  const items = [
    ...state.groupTypes.map((object) => ({ ...object, objectType: 'group-types', tag: 'Gruppenart' })),
    ...(state.objects.roles || []).slice(0, 6).map((object) => ({ ...object, objectType: 'roles', tag: 'Rolle' })),
  ];

  list.innerHTML = items.map((object) => {
    const detail = objectListMeta(object.objectType, object) || objectMeta(object);
    return `
    <article class="list-item">
      <div>
        <h3>${escapeHtml(objectLabel(object, object.objectType))}</h3>
        ${detail ? `<small>${escapeHtml(detail)}</small>` : ''}
      </div>
      <span class="tag">${escapeHtml(object.tag)}</span>
    </article>
  `;
  }).join('') || '<div class="empty-state">Keine Referenzdaten verfügbar.</div>';
}

function renderSystem() {
  const storage = state.status?.storage || {};
  const app = state.status?.app || {};
  const auth = state.status?.auth || {};
  const webauthn = state.status?.webauthn || {};

  setText('#storageState', storage.writable
    ? 'Datenpfad ist beschreibbar'
    : 'Datenpfad ist nicht beschreibbar');
  setText('#systemVersion', 'Storage');

  const systemList = document.querySelector('#systemList');
  if (!systemList) {
    return;
  }

  systemList.innerHTML = `
    ${renderWarnings(app.show_warnings ? app.warnings : null)}
    <dt>Eingeloggt als</dt>
    <dd>${escapeHtml(auth.user?.display_name || auth.user?.username || '-')}</dd>
    <dt>Passkey-RP-ID</dt>
    <dd>${escapeHtml(webauthn.rp_id || '-')}</dd>
    <dt>Anzeige-Zeitzone</dt>
    <dd>${escapeHtml(app.timezone || 'UTC')}</dd>
    <dt>Datenpfad</dt>
    <dd>${escapeHtml(storage.data_path || '-')}</dd>
    <dt>Laufzeitpfad</dt>
    <dd>${escapeHtml(storage.var_path || '-')}</dd>
    <dt>Storage</dt>
    <dd>${storage.exists ? 'Gefunden' : 'Fehlt'}</dd>
    <dt>Schreibzugriff</dt>
    <dd>${storage.writable ? 'Aktiv' : 'Inaktiv'}</dd>
    <dt>Laufzeit-Schreibzugriff</dt>
    <dd>${storage.runtime_writable ? 'Aktiv' : 'Inaktiv'}</dd>
  `;
}

function renderWarnings(warnings) {
  if (!warnings || !warnings.length) {
    return '';
  }

  return `
    <dt>Config-Warnung</dt>
    <dd class="warning-text">${warnings.map((warning) => escapeHtml(warning)).join('<br>')}</dd>
  `;
}

function renderSectionCounts() {
  renderNavigationCounts();
  updateExampleDataVisibility();
}

function renderNavigationCounts() {
  const collections = state.status?.storage?.collections || {};
  const counts = Object.fromEntries(objectCollections.map((type) => [
    type,
    Number(Array.isArray(state.objects[type]) ? state.objects[type].length : collections[type] || 0),
  ]));
  counts.users = state.users.length;

  const countElements = Array.from(document.querySelectorAll('[data-nav-count]'));
  let maxCountLength = 1;

  countElements.forEach((element) => {
    const countText = String(counts[element.dataset.navCount] || 0);
    element.textContent = countText;
    if (!element.closest('.nav-group[hidden]')) {
      maxCountLength = Math.max(maxCountLength, countText.length);
    }
  });

  document.querySelector('.editor-nav')?.style.setProperty('--nav-count-width', `${maxCountLength}ch`);
}

function renderCollectionControls() {
  collectionTypes.forEach((type) => {
    const target = document.querySelector(`[data-collection-controls="${cssEscape(type)}"]`);
    if (!target) {
      return;
    }

    target.innerHTML = collectionControlsHtml(type);
  });
}

function collectionControlsHtml(type) {
  const ui = collectionUi(type);
  const sortOptions = collectionSortOptions[type] || [[collectionDefaultSorts[type] || 'name', 'Name']];
  const activeSort = sortOptions.some(([value]) => value === ui.sort) ? ui.sort : collectionDefaultSorts[type];
  const controls = [
    `
      <label class="collection-control">
        <span class="collection-filter-label">
          <span>Sortierung</span>
          <span class="collection-sort-direction">${escapeHtml(ui.sortDirection === 'desc' ? 'desc' : 'asc')}</span>
          <button class="period-toggle" type="button" data-collection-sort-direction="${escapeAttribute(type)}" aria-label="${escapeAttribute(sortDirectionLabel(ui.sortDirection))}" title="${escapeAttribute(sortDirectionLabel(ui.sortDirection))}">(↻)</button>
        </span>
        <select data-collection-control data-collection-type="${escapeAttribute(type)}" data-collection-control-name="sort">
          ${sortOptions.map(([value, label]) => `<option value="${escapeAttribute(value)}" ${activeSort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
        </select>
      </label>
    `,
    `
      <label class="collection-control collection-control-wide">
        <span>Suche</span>
        <input type="search" value="${escapeAttribute(ui.search || '')}" placeholder="Suche" data-collection-control data-collection-type="${escapeAttribute(type)}" data-collection-control-name="search">
      </label>
    `,
  ];

  const filterControls = collectionFilterControls(type, ui.filters || {});
  if (filterControls.length) {
    controls.push(`
      <section class="collection-filter-section">
        <div class="collection-filter-controls">
          ${filterControls.join('')}
        </div>
      </section>
    `);
  }

  return controls.join('');
}

function collectionFilterControls(type, filters) {
  if (type === 'people') {
    return [
      collectionMultiSelectControl(type, 'membershipGroups', 'Mitgliedschaft', 'groups', filters.membershipGroups),
      collectionMultiSelectControl(type, 'activityGroups', 'Aktivität', 'groups', filters.activityGroups),
    ];
  }

  if (type === 'groups') {
    return [
      collectionMultiSelectControl(type, 'groupTypes', 'Gruppenart', 'group-types', filters.groupTypes),
    ];
  }

  if (type === 'roles') {
    return [
      collectionMultiSelectControl(type, 'groupTypes', 'Gruppenart', 'group-types', filters.groupTypes),
    ];
  }

  if (type === 'users') {
    return [
      collectionStaticSelectControl(type, 'permissions', 'Berechtigung', [
        ['read', 'Lesen'],
        ['write', 'Schreiben'],
        ['sensitive', 'Sensible Daten'],
        ['manage_users', 'Benutzer verwalten'],
      ], filters.permissions, true),
      collectionStaticSelectControl(type, 'status', 'Status', [
        ['enabled', 'Aktiv'],
        ['disabled', 'Inaktiv'],
      ], filters.status, false),
    ];
  }

  return [];
}

function collectionMultiSelectControl(type, name, label, collection, selectedValues = []) {
  const selected = new Set(Array.isArray(selectedValues) ? selectedValues : []);
  const objects = (state.objects[collection] || []).slice()
    .sort((left, right) => sortCollator.compare(objectLabel(left, collection), objectLabel(right, collection)));

  return `
    <label class="collection-control">
      <span class="collection-filter-label">
        <span>${escapeHtml(label)}</span>
        <button class="period-toggle" type="button" data-collection-clear-filter="${escapeAttribute(type)}" data-collection-filter-name="${escapeAttribute(name)}">(reset)</button>
      </span>
      <select multiple size="3" data-collection-control data-collection-type="${escapeAttribute(type)}" data-collection-control-name="${escapeAttribute(name)}">
        ${objects.map((object) => {
          const id = objectId(object);
          return `<option value="${escapeAttribute(id)}" ${selected.has(id) ? 'selected' : ''}>${escapeHtml(referenceOptionLabel(object, collection, objects))}</option>`;
        }).join('')}
      </select>
    </label>
  `;
}

function collectionStaticSelectControl(type, name, label, options, selectedValues = [], multiple = false) {
  const selected = new Set(Array.isArray(selectedValues) ? selectedValues : []);
  const multipleAttrs = multiple ? 'multiple size="3"' : '';
  const emptyOption = multiple ? '' : '<option value="">Alle</option>';

  return `
    <label class="collection-control">
      <span class="collection-filter-label">
        <span>${escapeHtml(label)}</span>
        <button class="period-toggle" type="button" data-collection-clear-filter="${escapeAttribute(type)}" data-collection-filter-name="${escapeAttribute(name)}">(reset)</button>
      </span>
      <select ${multipleAttrs} data-collection-control data-collection-type="${escapeAttribute(type)}" data-collection-control-name="${escapeAttribute(name)}">
        ${emptyOption}
        ${options.map(([value, labelText]) => `<option value="${escapeAttribute(value)}" ${selected.has(value) ? 'selected' : ''}>${escapeHtml(labelText)}</option>`).join('')}
      </select>
    </label>
  `;
}

function sortDirectionLabel(direction) {
  return direction === 'desc' ? 'Absteigend sortiert, zu aufsteigend wechseln' : 'Aufsteigend sortiert, zu absteigend wechseln';
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
    list.innerHTML = '<div class="empty-state">Kein Zugriff auf Objekte.</div>';
    return;
  }

  const sourceObjects = state.objects[type] || [];
  const objects = collectionObjects(type);
  const visibleCount = collectionVisibleCountForObjects(type, objects);
  const visibleObjects = objects.slice(0, visibleCount);
  const more = objects.length > visibleObjects.length
    ? renderCollectionMoreButton(type, objects.length - visibleObjects.length)
    : '';
  list.innerHTML = renderObjectListItems(type, visibleObjects) + more
    || `<div class="empty-state">${sourceObjects.length ? 'Keine Treffer.' : `Noch keine ${escapeHtml(emptyCollectionLabels[type] || labels[type] || type)}.`}</div>`;
}

function renderObjectListItems(type, objects) {
  if (type !== 'timepoints' || collectionSortKey(type) !== 'date') {
    return objects.map((object) => renderObjectItem(type, object)).join('');
  }

  let currentYear = null;
  return objects.map((object) => {
    const year = dateYear(object.date) || 'ohne Jahr';
    const header = year === currentYear ? '' : `<div class="list-section-heading">${escapeHtml(year)}</div>`;
    currentYear = year;
    return `${header}${renderObjectItem(type, object)}`;
  }).join('');
}

function collectionVisibleCount(type) {
  const count = Number(state.collectionVisibleCounts[type] || collectionVisibleStep);
  return Math.max(40, count);
}

function collectionVisibleCountForObjects(type, objects) {
  const currentCount = collectionVisibleCount(type);
  const targetId = collectionVisibleTargetId(type);
  if (!targetId) {
    return currentCount;
  }

  return expandCollectionVisibleCountToObject(type, targetId, objects);
}

function expandCollectionVisibleCountToObject(type, id, objects = collectionObjects(type)) {
  const currentCount = collectionVisibleCount(type);
  if (!id) {
    return currentCount;
  }

  const targetIndex = objects.findIndex((object) => objectId(object) === id);
  if (targetIndex === -1 || targetIndex < currentCount) {
    return currentCount;
  }

  const neededCount = Math.ceil((targetIndex + 1) / collectionVisibleStep) * collectionVisibleStep;
  state.collectionVisibleCounts[type] = neededCount;
  return neededCount;
}

function collectionVisibleTargetId(type) {
  if (state.deepLinkTarget?.view === type && state.deepLinkTarget.id) {
    return state.deepLinkTarget.id;
  }

  return activeEditingId(type);
}

function renderCollectionMoreButton(type, remaining) {
  return `
    <div class="list-more">
      <button class="button button-secondary" type="button" data-collection-more="${escapeAttribute(type)}">
        Mehr anzeigen (${Math.min(collectionVisibleStep, remaining)} von ${remaining})
      </button>
    </div>
  `;
}

function collectionObjects(type) {
  const objects = (state.objects[type] || []).filter((object) => collectionObjectMatches(type, object));
  return objects.sort((left, right) => compareCollectionObjects(type, left, right));
}

function collectionObjectMatches(type, object) {
  const ui = collectionUi(type);
  const search = String(ui.search || '').trim().toLocaleLowerCase('de');
  if (search && !collectionSearchText(type, object).toLocaleLowerCase('de').includes(search)) {
    return false;
  }

  const filters = ui.filters || {};
  if (type === 'people') {
    return personMatchesGroupFilter(object, 'memberships', filters.membershipGroups)
      && personMatchesGroupFilter(object, 'activities', filters.activityGroups);
  }

  if (type === 'groups') {
    return objectMatchesAny(groupTypeIds(object), filters.groupTypes);
  }

  if (type === 'roles') {
    return roleMatchesGroupTypeFilter(object, filters.groupTypes);
  }

  return true;
}

function collectionSearchText(type, object) {
  return [
    objectListTitle(type, object),
    objectListMeta(type, object),
    objectPropertyTags(type, object).join(' '),
    objectMeta(object),
    objectSummary(type, object),
    objectId(object),
    object.name,
    object.label,
    object.forename,
    object.lastname,
    object.scoutname,
    object.description,
  ].filter(Boolean).join(' ');
}

function personMatchesGroupFilter(person, field, selectedIds = []) {
  if (!Array.isArray(selectedIds) || !selectedIds.length) {
    return true;
  }

  return (Array.isArray(person[field]) ? person[field] : []).some((entry) => selectedIds.includes(periodEntryGroupId(entry)));
}

function objectMatchesAny(actualIds, selectedIds = []) {
  if (!Array.isArray(selectedIds) || !selectedIds.length) {
    return true;
  }

  return (actualIds || []).some((id) => selectedIds.includes(id));
}

function roleMatchesGroupTypeFilter(role, selectedIds = []) {
  if (!Array.isArray(selectedIds) || !selectedIds.length) {
    return true;
  }

  const roleIds = roleGroupTypeIds(role);
  return !roleIds.length || objectMatchesAny(roleIds, selectedIds);
}

function compareCollectionObjects(type, left, right) {
  const sort = collectionSortKey(type);
  const leftValue = collectionSortValue(type, left, sort);
  const rightValue = collectionSortValue(type, right, sort);
  const compared = compareSortValues(leftValue, rightValue);
  const result = compared || sortCollator.compare(objectListTitle(type, left), objectListTitle(type, right));
  return collectionSortDirection(type) === 'desc' ? -result : result;
}

function collectionSortValue(type, object, sort) {
  if (type === 'people') {
    if (sort === 'forename') {
      return object.forename || '';
    }
    if (sort === 'scoutname') {
      return object.scoutname || object.forename || '';
    }
    if (sort === 'lastname') {
      return object.lastname || '';
    }
    if (sort === 'birthdate') {
      return dateSortKey(object.birthdate);
    }
    if (sort === 'membershipStart') {
      return periodListFirstStartKey(object.memberships);
    }
    if (sort === 'activityStart') {
      return periodListFirstStartKey(object.activities);
    }
  }

  if (type === 'groups') {
    if (sort === 'name') {
      return object.name || '';
    }
    if (sort === 'groupType') {
      return groupTypeLabel(object, state.groupTypes || []);
    }
    if (sort === 'start') {
      return periodStartSortKey(object.mainPhase?.period);
    }
    if (sort === 'end') {
      return periodEndSortKey(object.mainPhase?.period);
    }
  }

  if (type === 'roles') {
    if (sort === 'label') {
      return object.label || '';
    }
    if (sort === 'groupType') {
      return roleGroupTypeLabels(object).join(', ');
    }
  }

  if (type === 'group-types' && sort === 'label') {
    return object.label || '';
  }

  if (type === 'timepoints') {
    if (sort === 'name') {
      return object.name || '';
    }
    if (sort === 'date') {
      return dateSortKey(object.date);
    }
  }

  return objectListTitle(type, object);
}

function compareSortValues(left, right) {
  const leftEmpty = left === null || left === undefined || left === '';
  const rightEmpty = right === null || right === undefined || right === '';
  if (leftEmpty || rightEmpty) {
    return leftEmpty === rightEmpty ? 0 : (leftEmpty ? 1 : -1);
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return sortCollator.compare(String(left), String(right));
}

function periodListFirstStartKey(list) {
  const first = Array.isArray(list) ? list[0] : null;
  return periodStartSortKey(first?.period);
}

function periodStartSortKey(period) {
  if (!period || typeof period !== 'object') {
    return null;
  }

  return periodBoundarySortKey(period.startTimepoint, period.customStart);
}

function periodEndSortKey(period) {
  if (!period || typeof period !== 'object') {
    return null;
  }

  return periodBoundarySortKey(period.endTimepoint, period.customEnd);
}

function periodBoundarySortKey(timepointId, customDate) {
  const timepoint = findReferenceObject('timepoints', timepointId);
  return dateSortKey(timepoint?.date || customDate);
}

function dateSortKey(value) {
  const parts = datePartsFromRaw(dateRawString(value));
  if (!parts || parts.year === '0000') {
    return null;
  }

  return Number(parts.year) * 10000 + Number(parts.month) * 100 + Number(parts.day);
}

function periodEntryGroupId(entry) {
  return entry?.group || entry?.groupId || entry?.group_id || '';
}

function collectionUi(type) {
  if (!state.collectionUi[type]) {
    state.collectionUi[type] = { sort: collectionDefaultSorts[type], sortDirection: collectionDefaultSortDirection(type, collectionDefaultSorts[type]), search: '', filters: {}, sortExplicit: false };
  }

  if (state.collectionUi[type].sort === 'title' || !state.collectionUi[type].sort) {
    state.collectionUi[type].sort = collectionDefaultSorts[type];
  }

  if (!['asc', 'desc'].includes(state.collectionUi[type].sortDirection)) {
    state.collectionUi[type].sortDirection = collectionDefaultSortDirection(type, state.collectionUi[type].sort);
  }

  state.collectionUi[type].filters = state.collectionUi[type].filters || {};
  state.collectionUi[type].sortExplicit = Boolean(state.collectionUi[type].sortExplicit);
  return state.collectionUi[type];
}

function collectionSortKey(type) {
  const ui = collectionUi(type);
  const options = collectionSortOptions[type] || [];
  return options.some(([value]) => value === ui.sort) ? ui.sort : collectionDefaultSorts[type];
}

function collectionSortDirection(type) {
  return collectionUi(type).sortDirection === 'desc' ? 'desc' : 'asc';
}

function collectionDefaultSortDirection(type, sort = collectionDefaultSorts[type]) {
  const configured = collectionDefaultSortDirections[type];
  if (configured && typeof configured === 'object') {
    return configured[sort] || 'asc';
  }

  return configured || 'asc';
}

function collectionUsers() {
  return state.users
    .filter((user) => collectionUserMatches(user))
    .sort((left, right) => compareUsers(left, right));
}

function collectionUserMatches(user) {
  const ui = collectionUi('users');
  const search = String(ui.search || '').trim().toLocaleLowerCase('de');
  if (search && !userSearchText(user).toLocaleLowerCase('de').includes(search)) {
    return false;
  }

  const filters = ui.filters || {};
  if (Array.isArray(filters.permissions) && filters.permissions.length) {
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    if (!filters.permissions.some((permission) => permissions.includes(permission))) {
      return false;
    }
  }

  if (Array.isArray(filters.status) && filters.status.length) {
    const status = user.enabled ? 'enabled' : 'disabled';
    if (!filters.status.includes(status)) {
      return false;
    }
  }

  return true;
}

function compareUsers(left, right) {
  const sort = collectionSortKey('users');
  const compared = compareSortValues(userSortValue(left, sort), userSortValue(right, sort));
  const result = compared || sortCollator.compare(userTitle(left), userTitle(right));
  return collectionSortDirection('users') === 'desc' ? -result : result;
}

function userSortValue(user, sort) {
  if (sort === 'username') {
    return user.username || '';
  }

  if (sort === 'passkeys') {
    return Number(user.credential_count || 0);
  }

  if (sort === 'status') {
    return user.enabled ? 'aktiv' : 'inaktiv';
  }

  return userTitle(user);
}

function userTitle(user) {
  return user.display_name || user.username || '(kein Benutzername)';
}

function userSearchText(user) {
  return [
    userTitle(user),
    user.username,
    user.enabled ? 'aktiv' : 'inaktiv',
    ...(Array.isArray(user.permissions) ? user.permissions : []),
  ].filter(Boolean).join(' ');
}

function renderObjectItem(type, object) {
  const key = objectKey(type, objectId(object));
  const isEditing = Boolean(state.editing[key]);
  const canWrite = hasPermission('write');
  const summary = objectSummary(type, object);
  const meta = objectListMeta(type, object);
  const propertyTags = objectPropertyTags(type, object);
  const propertyTagsHtml = objectPropertyTagsHtml(propertyTags);
  const modified = objectMeta(object);
  const titleTag = canWrite ? 'button' : 'div';
  const titleAttrs = canWrite
    ? `type="button" data-object-action="toggle-editor" aria-expanded="${isEditing ? 'true' : 'false'}"`
    : '';
  const warnings = objectValidationWarnings(type, object);
  const hasStatusMeta = Boolean(modified || warnings.length);

  return `
    <article class="list-item object-item ${canWrite ? 'is-clickable' : ''} ${isEditing ? 'is-editing' : ''}" data-object-type="${escapeAttribute(type)}" data-object-id="${escapeAttribute(objectId(object))}" data-revision="${Number(object._revision || 0)}">
      <div class="object-main">
        <${titleTag} class="object-title-row" ${titleAttrs}>
          <span class="object-title-text">
            <span class="object-title-heading" data-object-title>${escapeHtml(objectListTitle(type, object))}</span>
            <small class="object-subtitle" data-object-meta ${meta ? '' : 'hidden'}>${escapeHtml(meta)}</small>
            <span class="object-property-tags" data-object-tags ${propertyTagsHtml ? '' : 'hidden'}>${propertyTagsHtml}</span>
          </span>
          <span class="object-status-meta" data-object-status ${hasStatusMeta ? '' : 'hidden'}>
            <small class="object-modified" data-object-modified ${modified ? '' : 'hidden'}>${objectModifiedHtml(object)}</small>
            <small class="object-validation-meta" data-object-validation ${warnings.length && !isEditing ? '' : 'hidden'}>${validationMetaHtml(warnings)}</small>
            <ul class="object-validation-list" data-object-validation-list ${isEditing && warnings.length ? '' : 'hidden'}>
              ${validationListHtml(warnings)}
            </ul>
          </span>
        </${titleTag}>
        ${summary ? `<p class="object-summary">${escapeHtml(summary)}</p>` : ''}
        ${isEditing ? renderObjectEditor(type, object) : ''}
        ${type === 'groups' ? renderGroupReverseView(object) : ''}
        ${type === 'timepoints' ? renderTimepointReverseView(object) : ''}
        <p class="object-save-state" data-save-state hidden></p>
      </div>
    </article>
  `;
}

function renderGroupReverseView(group) {
  const groupId = objectId(group);
  const memberships = [];
  const activities = [];

  (state.objects.people || []).forEach((person) => {
    (Array.isArray(person.memberships) ? person.memberships : []).forEach((membership) => {
      if (periodEntryGroupId(membership) === groupId) {
        memberships.push({ person, period: membership.period });
      }
    });

    (Array.isArray(person.activities) ? person.activities : []).forEach((activity) => {
      if (periodEntryGroupId(activity) === groupId) {
        activities.push({ person, role: findReferenceObject('roles', activity.role), period: activity.period });
      }
    });
  });

  if (!memberships.length && !activities.length) {
    return '';
  }

  return `
    <div class="reverse-view" aria-label="Abgeleitete Gruppendaten">
      ${renderReverseColumn('Mitglieder', memberships.map((entry) => reversePersonLine(entry.person, entry.period)))}
      ${renderReverseColumn('Aktivitäten', activities.map((entry) => reverseActivityLine(entry)))}
    </div>
  `;
}

function renderReverseColumn(title, lines) {
  const visible = lines.filter(Boolean).slice(0, 4);
  const more = lines.length > visible.length ? `+${lines.length - visible.length} weitere` : '';
  return `
    <section class="reverse-column">
      <strong>${escapeHtml(title)} <span>${lines.length}</span></strong>
      ${visible.map((line) => `<small>${escapeHtml(line)}</small>`).join('')}
      ${more ? `<small>${escapeHtml(more)}</small>` : ''}
    </section>
  `;
}

function reversePersonLine(person, period) {
  return [objectListTitle('people', person), periodYearLabel(period)].filter(Boolean).join(' · ');
}

function reverseActivityLine(entry) {
  return [
    objectListTitle('people', entry.person),
    objectLabel(entry.role, 'roles'),
    periodYearLabel(entry.period),
  ].filter(Boolean).join(' · ');
}

function renderTimepointReverseView(timepoint) {
  const groupLines = timepointGroupLines(timepoint);
  const membershipLines = timepointMembershipLines(timepoint);
  const activityLines = timepointActivityLines(timepoint);

  if (!groupLines.length && !membershipLines.length && !activityLines.length) {
    return '';
  }

  return `
    <div class="reverse-view" aria-label="Ereignisse an diesem Zeitpunkt">
      ${renderReverseColumn('Gruppen', groupLines)}
      ${renderReverseColumn('Mitgliedschaften', membershipLines)}
      ${renderReverseColumn('Aktivitäten', activityLines)}
    </div>
  `;
}

function timepointGroupLines(timepoint) {
  const lines = [];
  (state.objects.groups || []).forEach((group) => {
    const starts = [];
    const ends = [];
    groupPhases(group).forEach((phase) => {
      const label = objectLabel(findReferenceObject('group-types', groupPhaseTypeId(phase)), 'group-types') || 'Phase';
      if (periodBoundaryMatchesTimepoint(timepoint, phase.period, 'start')) {
        starts.push(label);
      }
      if (periodBoundaryMatchesTimepoint(timepoint, phase.period, 'end')) {
        ends.push(label);
      }
    });

    pairTransitions(ends, starts).forEach(([from, to]) => {
      lines.push(`${objectListTitle('groups', group)}: ${from} → ${to}`);
    });
    ends.slice(starts.length).forEach((label) => lines.push(`${objectListTitle('groups', group)}: ${label} endet`));
    starts.slice(ends.length).forEach((label) => lines.push(`${objectListTitle('groups', group)}: ${label} startet`));
  });
  return lines;
}

function timepointMembershipLines(timepoint) {
  const lines = [];
  (state.objects.people || []).forEach((person) => {
    const starts = [];
    const ends = [];
    (Array.isArray(person.memberships) ? person.memberships : []).forEach((membership) => {
      const group = objectLabel(findReferenceObject('groups', periodEntryGroupId(membership)), 'groups') || 'Gruppe';
      if (periodBoundaryMatchesTimepoint(timepoint, membership.period, 'start')) {
        starts.push(group);
      }
      if (periodBoundaryMatchesTimepoint(timepoint, membership.period, 'end')) {
        ends.push(group);
      }
    });

    pairTransitions(ends, starts).forEach(([from, to]) => {
      lines.push(`${objectListTitle('people', person)}: ${from} → ${to}`);
    });
    ends.slice(starts.length).forEach((group) => lines.push(`${objectListTitle('people', person)}: verlässt ${group}`));
    starts.slice(ends.length).forEach((group) => lines.push(`${objectListTitle('people', person)}: tritt ${group} bei`));
  });
  return lines;
}

function timepointActivityLines(timepoint) {
  const lines = [];
  (state.objects.people || []).forEach((person) => {
    const starts = [];
    const ends = [];
    (Array.isArray(person.activities) ? person.activities : []).forEach((activity) => {
      const label = activityLabel(activity);
      if (periodBoundaryMatchesTimepoint(timepoint, activity.period, 'start')) {
        starts.push(label);
      }
      if (periodBoundaryMatchesTimepoint(timepoint, activity.period, 'end')) {
        ends.push(label);
      }
    });

    pairTransitions(ends, starts).forEach(([from, to]) => {
      lines.push(`${objectListTitle('people', person)}: ${from} → ${to}`);
    });
    ends.slice(starts.length).forEach((label) => lines.push(`${objectListTitle('people', person)}: ${label} endet`));
    starts.slice(ends.length).forEach((label) => lines.push(`${objectListTitle('people', person)}: ${label} startet`));
  });
  return lines;
}

function activityLabel(activity) {
  return [
    objectLabel(findReferenceObject('roles', activityRoleId(activity)), 'roles') || 'Aktivität',
    objectLabel(findReferenceObject('groups', periodEntryGroupId(activity)), 'groups'),
  ].filter(Boolean).join(' in ');
}

function groupPhaseTypeId(phase) {
  return phase?.groupType || phase?.groupTypeId || phase?.group_type_id || '';
}

function activityRoleId(activity) {
  return activity?.role || activity?.roleId || activity?.role_id || '';
}

function pairTransitions(ends, starts) {
  return ends.slice(0, Math.min(ends.length, starts.length)).map((end, index) => [end, starts[index]]);
}

function periodBoundaryMatchesTimepoint(timepoint, period, boundary) {
  if (!timepoint || !period) {
    return false;
  }

  const timepointId = objectId(timepoint);
  const timepointRaw = dateRawString(timepoint.date);
  const referenceField = boundary === 'end' ? 'endTimepoint' : 'startTimepoint';
  const dateField = boundary === 'end' ? 'customEnd' : 'customStart';

  return Boolean(
    (timepointId && period[referenceField] === timepointId)
    || (timepointRaw && dateRawString(period[dateField]) === timepointRaw)
  );
}

function renderObjectEditor(type, object) {
  const deleteLabel = `${objectListTitle(type, object)} löschen`;
  const fields = visibleFields(type);
  const hasSide = editorFieldSections(fields).internal.length > 0;
  return `
    <form class="object-editor object-editor-layout ${hasSide ? 'has-side' : 'no-side'}" data-object-editor>
      ${renderEditorFields(type, fields, object, false)}
      <div class="object-editor-actions">
        <button class="button button-danger" type="button" data-object-action="delete">${escapeHtml(deleteLabel)}</button>
      </div>
    </form>
  `;
}

function renderEditorFields(type, fields, object, isCreate) {
  const sections = editorFieldSections(fields);
  const context = { ownerType: type, ownerObject: object };
  const renderFields = (sectionFields) => sectionFields.map((field) => (
    renderFieldInput(field, isCreate ? defaultFieldValue(field) : object[field.name], isCreate, context)
  )).join('');

  return [
    sections.main.length ? `<div class="object-editor-main">${renderFields(sections.main)}</div>` : '',
    sections.internal.length ? `<aside class="object-editor-side">${renderFields(sections.internal)}</aside>` : '',
    sections.relations.length ? `<div class="object-editor-relations">${renderFields(sections.relations)}</div>` : '',
  ].join('');
}

function editorFieldSections(fields) {
  return fields.reduce((sections, field) => {
    sections[editorFieldSection(field)].push(field);
    return sections;
  }, { main: [], internal: [], relations: [] });
}

function editorFieldSection(field) {
  if (['notes', '_certainty', '_sources'].includes(field.name)) {
    return 'internal';
  }

  if (['membership-list', 'activity-list', 'group-phase-list'].includes(field.kind || '')) {
    return 'relations';
  }

  return 'main';
}

function renderCreatePanel(type) {
  const panel = document.querySelector(`[data-create-panel="${cssEscape(type)}"]`);
  if (!panel) {
    return;
  }

  if (type === 'users') {
    renderUserCreatePanel(panel);
    return;
  }

  if (!state.createOpen[type] || !hasPermission('write')) {
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }

  panel.hidden = false;
  panel.innerHTML = renderCreateForm(type, visibleFields(type));
}

function renderUserCreatePanel(panel) {
  if (!state.createOpen.users || !hasPermission('manage_users')) {
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }

  panel.hidden = false;
  panel.innerHTML = `
    <form class="object-editor object-create-form users-create" data-user-create-form>
      <label class="object-field">
        <span>Benutzername</span>
        <input name="username" autocomplete="off" required>
      </label>
      <label class="object-field">
        <span>Anzeigename</span>
        <input name="display_name" autocomplete="off">
      </label>
      <fieldset class="object-field users-permissions-field">
        <legend>Berechtigungen</legend>
        <label><input type="checkbox" name="permissions" value="read" checked> Lesen</label>
        <label><input type="checkbox" name="permissions" value="write"> Schreiben</label>
        <label><input type="checkbox" name="permissions" value="sensitive"> Sensible Daten</label>
        <label><input type="checkbox" name="permissions" value="manage_users"> Benutzer verwalten</label>
      </fieldset>
      <div class="form-actions">
        <button class="button button-secondary" type="button" data-create-cancel="users">Abbrechen</button>
        <button class="button" type="submit">Setup-Link erstellen</button>
      </div>
      <p class="object-save-state" data-create-state hidden></p>
    </form>
  `;
}

function renderFieldInput(field, value, isCreate, context = {}) {
  const id = `${isCreate ? 'new' : 'edit'}-${field.name}-${Math.random().toString(36).slice(2)}`;
  const fieldAttrs = `data-object-field="${escapeAttribute(field.name)}" data-field-kind="${escapeAttribute(field.kind || 'text')}"`;
  const renderedValue = inputValue(value, field);

  if (field.kind === 'date') {
    return renderDateControl(id, field.label, value, fieldAttrs);
  }

  if (field.kind === 'certainty') {
    return renderCertaintyField(field, renderedValue, fieldAttrs, id);
  }

  if (field.kind === 'boolean') {
    return `
      <label class="object-field object-check-field" for="${escapeAttribute(id)}">
        <input id="${escapeAttribute(id)}" ${fieldAttrs} type="checkbox" ${value ? 'checked' : ''}>
        <span>${escapeHtml(field.label)}</span>
      </label>
    `;
  }

  if (field.kind === 'reference') {
    return renderReferenceField(field, renderedValue, fieldAttrs, id, context);
  }

  if (field.kind === 'reference-list') {
    return renderReferenceListField(field, value, context);
  }

  if (field.kind === 'group-phase') {
    return renderGroupPhaseField(field, value, context);
  }

  if (field.kind === 'group-phase-list' || field.kind === 'membership-list' || field.kind === 'activity-list') {
    return renderObjectListField(field, value, context);
  }

  if (field.kind === 'textarea') {
    return `
      <label class="object-field" for="${escapeAttribute(id)}">
        <span>${escapeHtml(field.label)}</span>
        <textarea id="${escapeAttribute(id)}" ${fieldAttrs} rows="3">${escapeHtml(renderedValue)}</textarea>
      </label>
    `;
  }

  if (field.kind === 'source-display') {
    if (isCreate && !renderedValue) {
      return '';
    }

    return `
      <div class="object-field source-display-field" ${fieldAttrs} id="${escapeAttribute(id)}">
        <span>${escapeHtml(field.label)}</span>
        <div class="source-display-text">${escapeHtml(renderedValue || '-')}</div>
      </div>
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

  return `
    <label class="object-field" for="${escapeAttribute(id)}">
      <span>${escapeHtml(field.label)}</span>
      <input id="${escapeAttribute(id)}" ${fieldAttrs} value="${escapeAttribute(renderedValue)}" autocomplete="off">
    </label>
  `;
}

function renderCertaintyField(field, value, fieldAttrs, id) {
  return `
    <label class="object-field" for="${escapeAttribute(id)}">
      <span>${escapeHtml(field.label)}</span>
      <select id="${escapeAttribute(id)}" ${fieldAttrs} data-certainty-input>
        ${certaintyOptions.map(([optionValue, label]) => `<option value="${escapeAttribute(optionValue)}" ${optionValue === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
      </select>
    </label>
  `;
}

function renderDateControl(id, label, value, inputAttrs = '', options = {}) {
  const raw = dateRawString(value);
  const detail = dateDetailFromRaw(raw);
  const visibleValue = dateVisibleValueForDetail(raw, detail);
  const labelHtml = options.hideLabel ? '' : fieldLabelHtml(label, options.labelActionHtml || '');
  const labelAttr = options.hideLabel && label ? `aria-label="${escapeAttribute(label)}"` : '';

  return `
    <div class="object-field date-field">
      <div class="date-control" data-date-control-root>
        <label class="date-input-field" for="${escapeAttribute(id)}">
          ${labelHtml}
        <input id="${escapeAttribute(id)}" ${inputAttrs} ${labelAttr} type="text" inputmode="numeric" data-date-control data-date-detail="${escapeAttribute(detail)}" data-date-raw="${escapeAttribute(raw)}" value="${escapeAttribute(visibleValue)}" placeholder="${escapeAttribute(datePlaceholderForDetail(detail))}" autocomplete="off">
        </label>
        <div class="date-detail-field">
          <span>Granularität</span>
          <div class="date-detail-actions" data-date-detail-actions>
            ${dateDetailActionsHtml(detail, '')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReferenceField(field, value, fieldAttrs, id, context = {}) {
  return renderReferenceControl({
    id,
    label: field.label,
    value,
    collection: field.collection,
    objectFieldAttrs: fieldAttrs,
    pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject },
  });
}

function renderReferenceControl({ id, label, value, collection, objectFieldAttrs = '', nestedField = '', showIds = false, pickerContext = {}, hideLabel = false }) {
  const storedValue = value || '';
  const picker = pickerContext.picker || '';
  const birthYear = birthYearFromDateValue(pickerContext.ownerObject?.birthdate);
  const optionConfig = referenceOptionConfigFromContext(pickerContext, storedValue);
  const showFilter = referenceFilterVisible(collection);
  const labelHtml = hideLabel ? '' : fieldLabelHtml(label, pickerContext.labelActionHtml || '', id);
  const labelAttr = hideLabel && label ? `aria-label="${escapeAttribute(label)}"` : '';
  const attrs = [
    objectFieldAttrs,
    nestedField ? `data-nested-field="${escapeAttribute(nestedField)}"` : '',
    'data-reference-input',
    `data-reference-collection="${escapeAttribute(collection)}"`,
    `data-reference-value="${escapeAttribute(storedValue)}"`,
    `data-reference-show-ids="${showIds ? '1' : '0'}"`,
    picker ? `data-reference-picker="${escapeAttribute(picker)}"` : '',
    birthYear ? `data-owner-birth-year="${escapeAttribute(String(birthYear))}"` : '',
  ].filter(Boolean).join(' ');

  return `
    <div class="object-field reference-field" data-reference-field>
      ${labelHtml}
      ${showFilter ? `<input class="reference-filter" type="search" data-reference-filter placeholder="Auswahl filtern" aria-label="${escapeAttribute(label ? `${label} filtern` : 'Auswahl filtern')}" autocomplete="off">` : ''}
      <select id="${escapeAttribute(id)}" ${attrs} ${labelAttr}>
        ${referenceOptions(collection, showIds, { ...optionConfig, currentValue: storedValue })}
      </select>
    </div>
  `;
}

function referenceFilterVisible(collection) {
  return collection !== 'group-types'
    || (state.objects['group-types'] || []).filter((object) => !object._deleted).length > groupTypeReferenceFilterMinOptions;
}

function fieldLabelHtml(label, actionHtml = '', forId = '') {
  const action = actionHtml ? `<span class="field-label-action">${actionHtml}</span>` : '';
  const main = forId
    ? `<label class="field-label-main" for="${escapeAttribute(forId)}">${escapeHtml(label)}</label>`
    : `<span class="field-label-main">${escapeHtml(label)}</span>`;
  return `
    <span class="field-label-row">
      ${main}
      ${action}
    </span>
  `;
}

function referenceOptions(collection, showIds = false, config = {}) {
  const objects = referencePickerObjects(collection, config);
  const current = config.currentValue || '';
  const options = [
    `<option value="" ${current ? '' : 'selected'}>Keine Auswahl</option>`,
  ];

  if (config.actionValue && config.actionLabel) {
    options.push(`<option value="${escapeAttribute(config.actionValue)}">${escapeHtml(config.actionLabel)}</option>`);
  }

  objects.forEach((object) => {
    const id = objectId(object);
    options.push(`<option value="${escapeAttribute(id)}" ${id === current ? 'selected' : ''}>${escapeHtml(referenceOptionLabel(object, collection, objects, showIds))}</option>`);
  });

  return options.join('');
}

function referenceOptionConfigFromContext(context = {}, currentValue = '') {
  const config = { currentValue };
  const birthYear = birthYearFromDateValue(context.ownerObject?.birthdate);

  if (context.picker === 'membership-group') {
    config.birthYear = birthYear;
    config.period = context.period;
  }

  if (context.picker === 'activity-group') {
    const roleId = context.activity?.role || '';
    config.birthYear = birthYear;
    config.roleId = roleId;
    config.period = context.activity?.period;
    if (roleHasGroupTypeRestrictions(findReferenceObject('roles', roleId))) {
      config.actionValue = pickerActionShowAllGroups;
      config.actionLabel = 'Alle Gruppen anzeigen (Rolle leeren)';
    }
  }

  if (context.picker === 'activity-role') {
    const groupId = context.activity?.group || '';
    config.groupId = groupId;
    if (groupTypeIds(findReferenceObject('groups', groupId)).length) {
      config.actionValue = pickerActionShowAllRoles;
      config.actionLabel = 'Alle Rollen anzeigen (Gruppe leeren)';
    }
  }

  if (context.picker === 'period-start-timepoint') {
    config.minYear = birthYear;
    config.maxYear = periodBoundaryYearFromValue(context.period?.endTimepoint, context.period?.customEnd);
    config.allowOutOfScopeCurrent = true;
  }

  if (context.picker === 'period-end-timepoint') {
    config.minYear = Math.max(birthYear, periodBoundaryYearFromValue(context.period?.startTimepoint, context.period?.customStart));
    config.allowOutOfScopeCurrent = true;
  }

  return config;
}

function referencePickerObjects(collection, config = {}) {
  let objects = (state.objects[collection] || []).filter((object) => !object._deleted);

  if (collection === 'groups') {
    if (config.birthYear) {
      objects = objects.filter((group) => !groupEndedBeforeYear(group, config.birthYear));
    }

    if (config.period) {
      objects = objects.filter((group) => groupCouldOverlapPeriod(group, config.period));
    }

    const role = findReferenceObject('roles', config.roleId || '');
    if (roleHasGroupTypeRestrictions(role)) {
      objects = objects.filter((group) => groupMatchesRole(group, role));
    }
  }

  if (collection === 'roles') {
    const group = findReferenceObject('groups', config.groupId || '');
    if (groupTypeIds(group).length) {
      objects = objects.filter((role) => roleUsableForGroup(role, group));
    }
  }

  if (collection === 'timepoints') {
    if (config.minYear) {
      objects = objects.filter((timepoint) => {
        const year = timepointYear(timepoint);
        return !year || year >= config.minYear;
      });
    }

    if (config.maxYear) {
      objects = objects.filter((timepoint) => {
        const year = timepointYear(timepoint);
        return !year || year <= config.maxYear;
      });
    }
  }

  const currentObject = findReferenceObject(collection, config.currentValue || '');
  if (currentObject && !currentObject._deleted && !objects.some((object) => objectId(object) === objectId(currentObject))) {
    objects = [currentObject, ...objects];
  }

  return objects.slice().sort((left, right) => referencePickerCompare(left, right, collection));
}

function referencePickerCompare(left, right, collection) {
  if (collection === 'timepoints') {
    const compared = compareSortValues(dateSortKey(left?.date), dateSortKey(right?.date));
    if (compared) {
      return compared;
    }
  }

  return objectLabel(left, collection).localeCompare(objectLabel(right, collection), 'de');
}

function referenceOptionLabel(object, collection, objects, showIds = false) {
  const id = objectId(object);
  const label = referenceOptionMainLabel(object, collection, id);
  const detail = referenceOptionDetail(object, collection);
  const text = referenceOptionText(label, detail, collection);
  const duplicate = objects.filter((candidate) => (
    referenceOptionText(
      referenceOptionMainLabel(candidate, collection, objectId(candidate)),
      referenceOptionDetail(candidate, collection),
      collection,
    ) === text
  )).length > 1;
  const shortId = shortObjectId(id);
  const disambiguator = ((collection === 'timepoints' ? duplicate : (showIds || duplicate)) && !text.includes(shortId)) ? shortId : '';
  return [text, disambiguator].filter(Boolean).join(' · ');
}

function referenceOptionText(label, detail, collection) {
  if (!detail) {
    return label;
  }

  if (collection === 'timepoints') {
    return `${label} ${detail}`;
  }

  return `${label} (${detail})`;
}

function referenceOptionMainLabel(object, collection, id = objectId(object)) {
  const label = objectLabel(object, collection);
  const name = label && label !== id ? label : id;

  if (collection === 'groups') {
    return [groupTypeLabel(object, state.groupTypes || []), name].filter(Boolean).join(' ');
  }

  return name;
}

function referenceOptionDetail(object, collection) {
  if (collection === 'groups') {
    return compactPeriodDisplayValue(object.mainPhase?.period);
  }

  if (collection === 'roles') {
    const labels = roleGroupTypeLabels(object);
    return labels.length ? `für ${labels.join(', ')}` : 'für alle Gruppenarten';
  }

  if (collection === 'timepoints') {
    return compactDateDisplayValue(object.date);
  }

  if (collection === 'people' && object.birthdate) {
    return `geb. ${compactDateDisplayValue(object.birthdate)}`;
  }

  return '';
}

function compactDateDisplayValue(value) {
  return dateYear(value) || dateDisplayValue(value);
}

function compactPeriodDisplayValue(period) {
  if (!period || typeof period !== 'object') {
    return '';
  }

  const start = referenceYear('timepoints', period.startTimepoint) || dateYear(period.customStart);
  const end = referenceYear('timepoints', period.endTimepoint) || dateYear(period.customEnd);

  if (start && end) {
    if (start === end) {
      return start;
    }

    return `${start}-${end}`;
  }

  if (start) {
    return `seit ${start}`;
  }

  if (end) {
    return `bis ${end}`;
  }

  return '';
}

function compactYearRange(start, end) {
  const startText = String(start || '');
  const endText = String(end || '');
  if (/^\d{4}$/.test(startText) && /^\d{4}$/.test(endText) && startText.slice(0, 2) === endText.slice(0, 2)) {
    return `${startText}–${endText.slice(2)}`;
  }

  return `${startText}–${endText}`;
}

function shortObjectId(id) {
  return String(id || '').slice(0, 8);
}

function renderReferenceListField(field, value, context = {}) {
  if (field.collection === 'group-types') {
    return renderGroupTypeReferenceListField(field, value);
  }

  const values = Array.isArray(value) && value.length ? value : [''];
  return `
    <section class="object-field object-field-wide composite-field" data-object-field="${escapeAttribute(field.name)}" data-field-kind="${escapeAttribute(field.kind)}" data-reference-collection="${escapeAttribute(field.collection)}">
      <div class="composite-header">
        <span>${escapeHtml(field.label)}</span>
      </div>
      <div class="composite-list" data-list-items>
        ${values.map((itemValue) => renderReferenceListItem(field.collection, itemValue, context, referenceListItemLabel(field))).join('')}
      </div>
      <button class="icon-button add-list-button" type="button" data-list-action="add" aria-label="${escapeAttribute(field.label)} hinzufügen">+</button>
    </section>
  `;
}

function referenceListItemLabel(field) {
  if (field.collection === 'group-types') {
    return 'Gruppenart';
  }

  return 'Referenz';
}

function renderReferenceListItem(collection, value = '', context = {}, label = referenceListItemLabel({ collection })) {
  const id = `ref-${collection}-${Math.random().toString(36).slice(2)}`;
  const hideLabel = collection === 'group-types';
  return `
    <div class="composite-item reference-list-item" data-list-item>
      ${renderReferenceControl({ id, label, value, collection, nestedField: 'value', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject }, hideLabel })}
      <button class="icon-button icon-button-danger" type="button" data-list-action="remove" aria-label="Entfernen">-</button>
    </div>
  `;
}

function renderGroupTypeReferenceListField(field, value) {
  const selectedValues = uniqueStrings(Array.isArray(value) ? value.filter(Boolean) : []);
  return `
    <section class="object-field object-field-wide composite-field group-type-reference-field" data-object-field="${escapeAttribute(field.name)}" data-field-kind="${escapeAttribute(field.kind)}" data-reference-collection="${escapeAttribute(field.collection)}">
      <div class="composite-header">
        <span>${escapeHtml(field.label)}</span>
      </div>
      <div class="composite-list" data-list-items>
        ${selectedValues.map((itemValue) => renderFixedGroupTypeListItem(itemValue)).join('')}
      </div>
      ${renderGroupTypeAddSelect(selectedValues)}
    </section>
  `;
}

function renderFixedGroupTypeListItem(value) {
  const object = findReferenceObject('group-types', value);
  const label = object ? objectLabel(object, 'group-types') : referenceDisplayValue({ label: '', _id: value }, 'group-types');
  return `
    <div class="composite-item group-type-fixed-item" data-list-item data-fixed-reference-value="${escapeAttribute(value)}">
      <span>${escapeHtml(label)}</span>
      <button class="icon-button icon-button-danger" type="button" data-list-action="remove" aria-label="${escapeAttribute(label)} entfernen">-</button>
    </div>
  `;
}

function renderGroupTypeAddSelect(selectedValues = []) {
  const selected = new Set(selectedValues);
  const options = referencePickerObjects('group-types')
    .filter((object) => !selected.has(objectId(object)))
    .map((object) => `<option value="${escapeAttribute(objectId(object))}">${escapeHtml(referenceOptionLabel(object, 'group-types', state.groupTypes || []))}</option>`)
    .join('');

  return `
    <label class="object-field group-type-add-field">
      <span class="visually-hidden">Gruppenart hinzufügen</span>
      <select data-group-type-add ${options ? '' : 'disabled'}>
        <option value="">Gruppenart hinzufügen</option>
        ${options}
      </select>
    </label>
  `;
}

function renderGroupPhaseField(field, value, context = {}) {
  return `
    <section class="object-field object-field-wide composite-field" data-object-field="${escapeAttribute(field.name)}" data-field-kind="${escapeAttribute(field.kind)}">
      <div class="composite-header">
        <span>${escapeHtml(field.label)}</span>
      </div>
      <div class="composite-list">
        ${renderComplexListItem(field.kind, value || {}, { ...context, listField: field.name, disableRemove: true })}
      </div>
    </section>
  `;
}

function renderObjectListField(field, value, context = {}) {
  const useBlankStarter = !['group-phase-list', 'membership-list', 'activity-list'].includes(field.kind);
  const savedValues = Array.isArray(value) ? value : [];
  const values = savedValues.length ? savedValues : (useBlankStarter ? [{}] : []);
  return `
    <section class="object-field object-field-wide composite-field" data-object-field="${escapeAttribute(field.name)}" data-field-kind="${escapeAttribute(field.kind)}" data-list-saved-count="${savedValues.length}">
      <div class="composite-header">
        <span>${escapeHtml(field.label)}</span>
      </div>
      <div class="composite-list" data-list-items>
        ${values.map((itemValue, index) => renderComplexListItem(field.kind, itemValue, { ...context, listField: field.name, listIndex: index })).join('')}
      </div>
      <button class="icon-button add-list-button" type="button" data-list-action="add" aria-label="${escapeAttribute(field.label)} hinzufügen">+</button>
    </section>
  `;
}

function renderComplexListItem(kind, value = {}, context = {}) {
  const hasValue = complexItemHasValue(kind, value);
  const rowKey = relationshipRowKey(context);
  const summary = hasValue ? complexItemSummary(kind, value) : emptyComplexItemSummary(kind);
  const warnings = complexItemValidationWarnings(kind, value, context);
  const ownerKey = relationshipOwnerKey(context);
  const isOpenRelationshipRow = Boolean(rowKey && ownerKey && state.relationshipEditing[ownerKey] === rowKey);
  const isRelationshipRow = Boolean(rowKey && ownerKey);
  const isCollapsed = isRelationshipRow ? !isOpenRelationshipRow : hasValue;
  const hasEditToggle = Boolean(summary);
  const canRemove = !context.disableRemove;
  const deleteLabel = hasEditToggle ? `${summary} löschen` : '';
  return `
    <div class="composite-item ${summary ? 'has-summary' : ''} ${isCollapsed ? 'is-collapsed' : ''}" data-list-item data-list-collapsible="${(hasValue || rowKey) ? '1' : '0'}" data-relationship-row-key="${escapeAttribute(rowKey)}">
      ${summary ? `
        <button class="composite-summary" type="button" data-list-action="toggle" aria-expanded="${isCollapsed ? 'false' : 'true'}">
          ${compositeSummaryHtml(summary, warnings)}
        </button>
      ` : ''}
      <div class="composite-editor" data-composite-editor>
        ${renderComplexEditor(kind, value, true, context)}
        ${canRemove ? `
          <div class="composite-editor-actions">
            ${hasEditToggle
              ? `<button class="button button-danger" type="button" data-list-action="remove">${escapeHtml(deleteLabel)}</button>`
              : '<button class="icon-button icon-button-danger" type="button" data-list-action="remove" aria-label="Entfernen">-</button>'}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function compositeSummaryHtml(summary, warnings = []) {
  return [
    `<span class="composite-summary-text">${escapeHtml(summary)}</span>`,
    warnings.length ? `<small class="composite-validation-meta">${validationMetaHtml(warnings)}</small>` : '',
    warnings.length ? compositeValidationListHtml(warnings) : '',
  ].filter(Boolean).join('');
}

function compositeValidationListHtml(warnings) {
  return `
    <span class="composite-validation-list" role="list">
      ${[...new Set(warnings)]
        .filter(Boolean)
        .map((warning) => `<span class="composite-validation-list-item" role="listitem" title="${escapeAttribute(warning)}">${escapeHtml(warning)}</span>`)
        .join('')}
    </span>
  `;
}

function complexItemHasValue(kind, value) {
  if (kind === 'group-phase-list' || kind === 'group-phase') {
    return groupPhaseHasValue(value);
  }

  if (kind === 'membership-list') {
    return membershipHasValue(value);
  }

  if (kind === 'activity-list') {
    return activityHasValue(value);
  }

  return false;
}

function complexItemSummary(kind, value = {}) {
  if (kind === 'membership-list') {
    return [
      objectLabel(findReferenceObject('groups', value.group), 'groups') || 'Keine Gruppe',
      periodYearLabel(value.period),
    ].filter(Boolean).join(' · ');
  }

  if (kind === 'activity-list') {
    return [
      objectLabel(findReferenceObject('roles', value.role), 'roles') || 'Keine Rolle',
      objectLabel(findReferenceObject('groups', value.group), 'groups') || 'Keine Gruppe',
      periodYearLabel(value.period),
    ].filter(Boolean).join(' · ');
  }

  if (kind === 'group-phase-list' || kind === 'group-phase') {
    return [
      objectLabel(findReferenceObject('group-types', value.groupType), 'group-types') || 'Keine Gruppenart',
      periodYearLabel(value.period),
    ].filter(Boolean).join(' · ');
  }

  return '';
}

function complexItemValidationWarnings(kind, value = {}, context = {}) {
  if (!complexItemHasValue(kind, value)) {
    return [];
  }

  const warnings = [];

  if (kind === 'group-phase-list' || kind === 'group-phase') {
    collectGroupPhaseWarnings(warnings, value, '', true);
    return [...new Set(warnings)];
  }

  if (context.ownerType !== 'people') {
    return [];
  }

  const person = context.ownerObject || {};
  const birthYear = birthYearFromDateValue(person.birthdate);

  if (kind === 'membership-list') {
    collectMembershipWarnings(warnings, value, birthYear, '');
  }

  if (kind === 'activity-list') {
    collectActivityWarnings(warnings, value, birthYear, '');
  }

  return [...new Set(warnings)];
}

function emptyComplexItemSummary(kind) {
  if (kind === 'group-phase') {
    return 'Neue Hauptphase';
  }

  if (kind === 'membership-list') {
    return 'Neue Mitgliedschaft';
  }

  if (kind === 'activity-list') {
    return 'Neue Aktivität';
  }

  if (kind === 'group-phase-list') {
    return 'Neue Phase';
  }

  return '';
}

function renderComplexEditor(kind, value = {}, compact = false, context = {}) {
  if (kind === 'group-phase-list' || kind === 'group-phase') {
    return renderGroupPhaseEditor(value, compact, context);
  }

  if (kind === 'membership-list') {
    return renderMembershipEditor(value, context);
  }

  if (kind === 'activity-list') {
    return renderActivityEditor(value, context);
  }

  return '';
}

function relationshipRowKey(context = {}) {
  if (context.listField === 'mainPhase') {
    return 'mainPhase';
  }

  if (!['additionalPhases', 'memberships', 'activities'].includes(context.listField || '')) {
    return '';
  }

  return Number.isInteger(context.listIndex) ? `${context.listField}:${context.listIndex}` : '';
}

function relationshipOwnerKey(context = {}) {
  if (!relationshipRowKey(context) || !objectCollections.includes(context.ownerType)) {
    return '';
  }

  const id = objectId(context.ownerObject || {});
  return id ? objectKey(context.ownerType, id) : '';
}

function renderGroupPhaseEditor(value = {}, compact = false, context = {}) {
  const idBase = `group-phase-${Math.random().toString(36).slice(2)}`;
  return `
    <div class="nested-editor ${compact ? 'is-compact' : ''}">
      ${renderReferenceControl({ id: `${idBase}-type`, label: 'Gruppenart', value: value.groupType || '', collection: 'group-types', nestedField: 'groupType', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject } })}
      ${renderPeriodEditor(value.period || {}, `${idBase}-period`, false, context)}
    </div>
  `;
}

function renderMembershipEditor(value = {}, context = {}) {
  const idBase = `membership-${Math.random().toString(36).slice(2)}`;
  return `
    <div class="nested-editor" data-membership-editor>
      ${renderReferenceControl({ id: `${idBase}-group`, label: 'Gruppe', value: value.group || '', collection: 'groups', nestedField: 'group', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: 'membership-group', period: value.period } })}
      ${renderPeriodEditor(value.period || {}, `${idBase}-period`, false, context)}
      ${renderNestedCertaintyField(`${idBase}-certainty`, value._certainty || 'none')}
      ${renderNestedSourceDisplayField(`${idBase}-sources`, value._sources || '')}
    </div>
  `;
}

function renderActivityEditor(value = {}, context = {}) {
  const idBase = `activity-${Math.random().toString(36).slice(2)}`;
  return `
    <div class="nested-editor" data-activity-editor>
      ${renderReferenceControl({ id: `${idBase}-group`, label: 'Gruppe', value: value.group || '', collection: 'groups', nestedField: 'group', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: 'activity-group', activity: value } })}
      ${renderReferenceControl({ id: `${idBase}-role`, label: 'Rolle', value: value.role || '', collection: 'roles', nestedField: 'role', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: 'activity-role', activity: value } })}
      ${renderPeriodEditor(value.period || {}, `${idBase}-period`, false, context)}
      ${renderNestedCertaintyField(`${idBase}-certainty`, value._certainty || 'none')}
      ${renderNestedSourceDisplayField(`${idBase}-sources`, value._sources || '')}
    </div>
  `;
}

function renderNestedCertaintyField(id, value = 'none') {
  return `
    <label class="object-field" for="${escapeAttribute(id)}">
      <span>Gewissheit</span>
      <select id="${escapeAttribute(id)}" data-nested-field="_certainty" data-certainty-input>
        ${certaintyOptions.map(([optionValue, label]) => `<option value="${escapeAttribute(optionValue)}" ${optionValue === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
      </select>
    </label>
  `;
}

function renderNestedSourceDisplayField(id, value = '') {
  return `
    <div class="object-field source-display-field" id="${escapeAttribute(id)}">
      <span>Quellen</span>
      <div class="source-display-text" data-nested-field="_sources">${escapeHtml(value || '-')}</div>
    </div>
  `;
}

function renderPeriodEditor(value = {}, idBase = `period-${Math.random().toString(36).slice(2)}`, compact = false, context = {}) {
  const showReferenceIds = !compact;
  return `
    <fieldset class="period-editor ${compact ? 'is-rough' : ''}" data-period-editor>
      <legend>Zeitraum</legend>
      ${renderPeriodBoundary({ idBase: `${idBase}-start`, label: 'Start', timepointField: 'startTimepoint', dateField: 'customStart', timepointValue: value.startTimepoint || '', dateValue: value.customStart, showReferenceIds, picker: 'period-start-timepoint', period: value, context })}
      ${renderPeriodBoundary({ idBase: `${idBase}-end`, label: 'Ende', timepointField: 'endTimepoint', dateField: 'customEnd', timepointValue: value.endTimepoint || '', dateValue: value.customEnd, showReferenceIds, picker: 'period-end-timepoint', period: value, context })}
    </fieldset>
  `;
}

function renderPeriodBoundary({ idBase, label, timepointField, dateField, timepointValue, dateValue, showReferenceIds = true, picker = '', period = {}, context = {} }) {
  const hasCustomDate = Boolean(dateInputValue(dateValue));
  const mode = !timepointValue && hasCustomDate ? 'custom' : 'timepoint';
  const timepointHidden = mode === 'custom' ? ' hidden' : '';
  const customHidden = mode === 'timepoint' ? ' hidden' : '';
  const action = mode === 'custom' ? 'use-timepoint' : 'custom-date';
  const actionLabel = mode === 'custom' ? 'zu Zeitpunkt wechseln' : 'zu Datum wechseln';
  const actionHtml = `<button class="period-toggle" type="button" data-period-action="${escapeAttribute(action)}">(${escapeHtml(actionLabel)})</button>`;
  const saveTimepointHtml = mode === 'custom'
    ? '<button class="period-toggle period-save-timepoint" type="button" data-period-action="save-timepoint">(als Zeitpunkt speichern)</button>'
    : '';

  return `
    <div class="period-boundary" data-period-boundary="${escapeAttribute(timepointField)}" data-period-mode="${escapeAttribute(mode)}">
      <div data-period-timepoint${timepointHidden}>
        ${renderReferenceControl({ id: `${idBase}-timepoint`, label, value: timepointValue || '', collection: 'timepoints', nestedField: timepointField, showIds: showReferenceIds, pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker, period, labelActionHtml: actionHtml } })}
      </div>
      <div data-period-custom${customHidden}>
        ${renderNestedDateControl(`${idBase}-custom`, label, dateValue, dateField, false, actionHtml)}
        ${saveTimepointHtml}
      </div>
    </div>
  `;
}

function renderNestedDateControl(id, label, value, nestedField, hideLabel = false, labelActionHtml = '') {
  return renderDateControl(id, label, value, `data-nested-field="${escapeAttribute(nestedField)}"`, { hideLabel, labelActionHtml });
}

function handleDateDetailAction(button) {
  const root = button.closest('[data-date-control-root]');
  const input = root?.querySelector('[data-date-control]');
  if (!input) {
    return;
  }

  input.dataset.dateRaw = readDateControlRaw(input);
  const detail = input.dataset.dateDetail || dateDetailFromRaw(input.dataset.dateRaw || '');
  const targetDetail = button.dataset.dateDetailTarget || '';
  if (!targetDetail) {
    return;
  }
  if (targetDetail === detail) {
    if (input.dataset.dateConfirm) {
      setDateControlConfirm(input, '');
      focusDateControl(input);
    }
    return;
  }

  const isLessDetailed = dateDetailRank(targetDetail) < dateDetailRank(detail);
  const needsConfirmation = isLessDetailed && dateDetailReductionRemovesValue(input.dataset.dateRaw || '', targetDetail);
  if (needsConfirmation && input.dataset.dateConfirm !== targetDetail) {
    setDateControlConfirm(input, targetDetail);
    button.focus();
    return;
  }

  const previousDetail = detail;
  setDateControlDetail(input, targetDetail, isLessDetailed);
  if (isLessDetailed) {
    markDateControlChanged(input);
  }

  focusDateControl(input);
  if (!isLessDetailed) {
    selectExpandedDatePart(input, previousDetail, targetDetail);
  }
}

function setDateControlDetail(input, detail, truncate) {
  const raw = truncate ? dateRawForDetail(input.dataset.dateRaw || readDateControlRaw(input), detail) : (input.dataset.dateRaw || readDateControlRaw(input));
  input.dataset.dateDetail = detail;
  input.dataset.dateRaw = raw;
  input.dataset.dateConfirm = '';
  input.dataset.datePreview = '';
  input.value = dateVisibleValueForDetail(raw, detail);
  input.placeholder = datePlaceholderForDetail(detail);
  updateDateDetailButtons(input);
}

function selectExpandedDatePart(input, previousDetail, detail) {
  if (dateDetailRank(detail) <= dateDetailRank(previousDetail)) {
    return;
  }

  window.setTimeout(() => {
    if (!input.isConnected || typeof input.setSelectionRange !== 'function') {
      return;
    }

    if (detail === 'month') {
      input.setSelectionRange(0, 2);
      return;
    }

    if (detail === 'day') {
      if (previousDetail === 'year') {
        input.setSelectionRange(0, 5);
        return;
      }

      input.setSelectionRange(0, 2);
    }
  }, 0);
}

function setDateControlConfirm(input, targetDetail) {
  input.dataset.dateConfirm = targetDetail || '';
  refreshDateDetailButtonStates(input);
}

function handleDateDetailPointerMove(event) {
  const button = event.target.closest('[data-date-detail-action]');
  if (!button) {
    clearDateDetailPreviews();
    return;
  }

  const root = button.closest('[data-date-control-root]');
  const input = root?.querySelector('[data-date-control]');
  const target = button.dataset.dateDetailTarget || '';
  clearDateDetailPreviews(input);
  if (input && input.dataset.datePreview !== target) {
    input.dataset.datePreview = target;
    refreshDateDetailButtonStates(input);
  }
}

function handleDateDetailPreview(event) {
  const button = event.target.closest('[data-date-detail-action]');
  if (!button) {
    return;
  }

  const root = button.closest('[data-date-control-root]');
  const input = root?.querySelector('[data-date-control]');
  if (!input) {
    return;
  }

  input.dataset.datePreview = button.dataset.dateDetailTarget || '';
  refreshDateDetailButtonStates(input);
}

function handleDateDetailPreviewEnd(event) {
  const button = event.target.closest('[data-date-detail-action]');
  const root = button?.closest('[data-date-control-root]');
  const actions = button?.closest('[data-date-detail-actions]');
  const nextButton = event.relatedTarget?.closest?.('[data-date-detail-action]');
  if (!button || !root || (nextButton && actions?.contains(nextButton))) {
    return;
  }

  if (!event.relatedTarget) {
    clearDateDetailPreviews();
    return;
  }

  const input = root.querySelector('[data-date-control]');
  if (!input) {
    return;
  }

  input.dataset.datePreview = '';
  refreshDateDetailButtonStates(input);
}

document.addEventListener('mouseleave', () => {
  clearDateDetailPreviews();
});

function clearDateDetailPreviews(exceptInput = null) {
  document.querySelectorAll('[data-date-control]').forEach((input) => {
    if (input === exceptInput || !input.dataset.datePreview) {
      return;
    }

    input.dataset.datePreview = '';
    refreshDateDetailButtonStates(input);
  });
}

function updateDateDetailButtons(input) {
  const actions = input.closest('[data-date-control-root]')?.querySelector('[data-date-detail-actions]');
  if (!actions) {
    return;
  }

  const detail = input.dataset.dateDetail || 'year';
  actions.innerHTML = dateDetailActionsHtml(detail, input.dataset.dateConfirm || '');
  updateDateControlState(input);
}

function refreshDateDetailButtonStates(input) {
  const detail = input.dataset.dateDetail || 'year';
  const confirmTarget = input.dataset.dateConfirm || '';
  const previewDetail = input.dataset.datePreview || detail;
  input.closest('[data-date-control-root]')?.querySelectorAll('[data-date-detail-action]').forEach((button) => {
    const target = button.dataset.dateDetailTarget || '';
    const isConfirming = confirmTarget === target;
    const isIncluded = dateDetailRank(target) <= dateDetailRank(previewDetail);
    const isAppliedIncluded = dateDetailRank(target) <= dateDetailRank(detail);
    const isCurrent = target === previewDetail;
    const isApplied = target === detail;
    const isDisabled = isApplied && !confirmTarget;
    const isPreviewAdded = previewDetail !== detail && isIncluded && !isAppliedIncluded;
    const isPreviewRemoved = previewDetail !== detail && isAppliedIncluded && !isIncluded;
    const label = dateDetailActionLabel(detail, target, isConfirming);
    const aria = dateDetailActionAria(detail, target, isConfirming);
    button.textContent = label;
    button.setAttribute('aria-label', aria);
    button.title = aria;
    button.disabled = isDisabled;
    button.setAttribute('aria-pressed', isIncluded ? 'true' : 'false');
    button.classList.toggle('is-included', isIncluded);
    button.classList.toggle('is-applied-included', isAppliedIncluded);
    button.classList.toggle('is-current', isCurrent);
    button.classList.toggle('is-applied', isApplied);
    button.classList.toggle('is-disabled', isDisabled);
    button.classList.toggle('is-preview-added', isPreviewAdded);
    button.classList.toggle('is-preview-removed', isPreviewRemoved);
    button.classList.toggle('is-confirming', isConfirming);
  });
  updateDateControlState(input);
}

function updateDateControlState(input) {
  input.closest('[data-date-control-root]')?.classList.toggle('is-confirming', Boolean(input.dataset.dateConfirm));
}

function clearDateControl(input) {
  input.value = '';
  input.dataset.dateRaw = '';
  input.dataset.dateConfirm = '';
  input.dataset.datePreview = '';
  updateDateDetailButtons(input);
}

function resetDateConfirmFromElement(element, relatedTarget) {
  const root = element?.closest?.('[data-date-control-root]');
  if (!root || root.contains(relatedTarget)) {
    return;
  }

  const pendingInput = root.querySelector('[data-date-control][data-date-confirm]');
  if (pendingInput?.dataset.dateConfirm) {
    setDateControlConfirm(pendingInput, '');
  }
}

function markDateControlChanged(input) {
  const objectInput = input.closest('[data-object-field]');
  const item = objectInput?.closest('[data-object-type][data-object-id]');
  if (item) {
    markObjectDirty(item);
    scheduleObjectSave(item, 600);
    if (objectInput?.dataset.objectField === 'birthdate') {
      refreshReferencePickers(ownerRootForElement(objectInput));
    }
    return;
  }

  const boundary = input.closest('[data-period-boundary]');
  if (boundary) {
    markPeriodBoundaryChanged(boundary);
    refreshPeriodDependentPickers(boundary.closest('[data-period-editor]'), input);
    return;
  }

  const createForm = input.closest('[data-create-form]');
  if (createForm) {
    clearCreateState(createForm);
  }
}

async function handleObjectClick(event) {
  if (!event.target.closest('[data-danger-confirm]')) {
    resetDangerConfirmations();
  }

  const sortDirectionButton = event.target.closest('[data-collection-sort-direction]');
  if (sortDirectionButton) {
    const type = sortDirectionButton.dataset.collectionSortDirection;
    const ui = collectionUi(type);
    ui.sortExplicit = true;
    ui.sortDirection = ui.sortDirection === 'desc' ? 'asc' : 'desc';
    renderCollectionControls();
    if (type === 'users') {
      renderUserList();
    } else {
      renderObjectCollection(type);
    }
    writeUrlState({ view: type });
    return;
  }

  const clearFilterButton = event.target.closest('[data-collection-clear-filter]');
  if (clearFilterButton) {
    const type = clearFilterButton.dataset.collectionClearFilter;
    const name = clearFilterButton.dataset.collectionFilterName;
    const ui = collectionUi(type);
    delete ui.filters[name];
    renderCollectionControls();
    if (type === 'users') {
      renderUserList();
    } else {
      renderObjectCollection(type);
    }
    return;
  }

  const dateDetailButton = event.target.closest('[data-date-detail-action]');
  if (dateDetailButton) {
    handleDateDetailAction(dateDetailButton);
    return;
  }

  const moreButton = event.target.closest('[data-collection-more]');
  if (moreButton) {
    const type = moreButton.dataset.collectionMore;
    state.collectionVisibleCounts[type] = collectionVisibleCount(type) + collectionVisibleStep;
    renderObjectCollection(type);
    return;
  }

  const periodButton = event.target.closest('[data-period-action]');
  if (periodButton) {
    await handlePeriodModeAction(periodButton);
    return;
  }

  const listButton = event.target.closest('[data-list-action]');
  if (listButton) {
    handleListAction(listButton);
    return;
  }

  const createButton = event.target.closest('[data-create-type]');
  if (createButton) {
    if (focusExistingCreateForm(createButton)) {
      return;
    }

    const createType = createButton.dataset.createType;
    collectionTypes.forEach((type) => {
      state.createOpen[type] = false;
    });
    state.createOpen[createType] = true;
    if (createType === 'users') {
      renderUsersManagement();
    } else {
      renderObjectCollection(createType);
    }
    return;
  }

  const createCancel = event.target.closest('[data-create-cancel]');
  if (createCancel) {
    const createType = createCancel.dataset.createCancel;
    state.createOpen[createType] = false;
    if (createType === 'users') {
      renderUsersManagement();
    } else {
      renderObjectCollection(createType);
    }
    return;
  }

  const createForm = event.target.closest('[data-create-form]');
  if (createForm && event.target.closest('button[type="submit"]')) {
    return;
  }

  const button = event.target.closest('[data-object-action]');
  const item = button?.closest('[data-object-type][data-object-id]');
  if (!button || !item) {
    return;
  }

  const action = button.dataset.objectAction;

  if (action === 'toggle-editor') {
    if (state.editing[objectKey(item.dataset.objectType, item.dataset.objectId)]) {
      await closeObjectEditor(item);
    } else {
      if (focusExistingCreateForm(button)) {
        return;
      }
      await focusObjectEditor(item);
    }
    return;
  }

  if (action === 'delete') {
    if (!confirmDangerButton(button)) {
      return;
    }
    await deleteObject(item);
    resetDangerConfirmations();
    return;
  }

}

async function closeObjectEditor(item) {
  const type = item.dataset.objectType;
  const id = item.dataset.objectId;
  const key = objectKey(type, id);
  await flushObjectEdit(item, true);
  state.editing[key] = false;
  delete state.relationshipEditing[key];
  writeUrlState({ view: type, id: '' });
  renderObjectCollection(type);
}

async function focusObjectEditor(item) {
  const targetType = item.dataset.objectType;
  const targetId = item.dataset.objectId;
  const targetKey = objectKey(targetType, targetId);
  const targetListId = item.parentElement?.id || '';
  const openItems = Array.from(document.querySelectorAll('[data-object-editor]'))
    .map((editor) => editor.closest('[data-object-type][data-object-id]'))
    .filter(Boolean);

  for (const openItem of openItems) {
    const key = objectKey(openItem.dataset.objectType, openItem.dataset.objectId);
    window.clearTimeout(state.editTimers[key]);
    if (key !== targetKey) {
      await flushObjectEdit(openItem, true);
      delete state.relationshipEditing[key];
    }
  }

  state.editing = {};
  state.editing[targetKey] = true;
  writeUrlState({ view: targetType, id: targetId });
  renderObjectCollections();
  scrollObjectEditorIntoView(targetType, targetId, targetListId);
}

function scrollObjectEditorIntoView(type, id, listId = '') {
  const scrollWhenStable = () => {
    const selector = `[data-object-type="${cssEscape(type)}"][data-object-id="${cssEscape(id)}"]`;
    const item = listId
      ? document.querySelector(`#${cssEscape(listId)} ${selector}`)
      : document.querySelector(selector);
    const editor = item?.querySelector('[data-object-editor]');
    if (!editor) {
      return;
    }

    const margin = 16;
    const scrollRoot = appScrollRoot();
    const rootRect = scrollRoot === document.documentElement
      ? { top: 0, bottom: window.innerHeight || document.documentElement.clientHeight }
      : scrollRoot.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const topOffset = itemRect.top - rootRect.top - margin;
    if (Math.abs(topOffset) < 1) {
      return;
    }

    const scrollTop = scrollRoot.scrollTop + topOffset;
    scrollRoot.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(scrollWhenStable);
    window.setTimeout(scrollWhenStable, 120);
  });
}

function appScrollRoot() {
  return document.querySelector('.app-content') || document.documentElement;
}

async function handlePeriodModeAction(button) {
  const boundary = button.closest('[data-period-boundary]');
  if (!boundary) {
    return;
  }

  const timepointWrap = boundary.querySelector('[data-period-timepoint]');
  const customWrap = boundary.querySelector('[data-period-custom]');
  const timepointInput = timepointWrap?.querySelector('[data-reference-input]');
  const dateInput = customWrap?.querySelector('[data-date-control]');
  const action = button.dataset.periodAction;

  if (action === 'custom-date') {
    boundary.dataset.previousTimepoint = timepointInput
      ? normalizeReferenceValue(timepointInput.value, timepointInput.dataset.referenceCollection || '', timepointInput.dataset.referenceValue || '')
      : '';
    boundary.dataset.previousTimepointLabel = timepointInput?.value || '';
    if (timepointInput) {
      timepointInput.value = '';
      timepointInput.dataset.referenceValue = '';
    }
    if (dateInput) {
      clearDateControl(dateInput);
    }
    setPeriodBoundaryMode(boundary, 'custom');
    setPeriodBoundaryAction(boundary, 'undo-custom-date', 'zu Zeitpunkt wechseln');
    syncPeriodSaveTimepointAction(boundary);
    focusDateControl(dateInput);
    markPeriodBoundaryChanged(boundary);
    refreshPeriodDependentPickers(boundary.closest('[data-period-editor]'), dateInput);
    return;
  }

  if (action === 'undo-custom-date') {
    if (timepointInput) {
      timepointInput.dataset.referenceValue = boundary.dataset.previousTimepoint || '';
      timepointInput.value = boundary.dataset.previousTimepointLabel
        || referenceInputValue(boundary.dataset.previousTimepoint || '', timepointInput.dataset.referenceCollection || '', false);
    }
    if (dateInput) {
      clearDateControl(dateInput);
    }
    delete boundary.dataset.previousTimepoint;
    delete boundary.dataset.previousTimepointLabel;
    setPeriodBoundaryMode(boundary, 'timepoint');
    setPeriodBoundaryAction(boundary, 'custom-date', 'zu Datum wechseln');
    syncPeriodSaveTimepointAction(boundary);
    markPeriodBoundaryChanged(boundary);
    refreshPeriodDependentPickers(boundary.closest('[data-period-editor]'), timepointInput);
    return;
  }

  if (action === 'use-timepoint') {
    if (dateInput) {
      clearDateControl(dateInput);
    }
    setPeriodBoundaryMode(boundary, 'timepoint');
    setPeriodBoundaryAction(boundary, 'custom-date', 'zu Datum wechseln');
    syncPeriodSaveTimepointAction(boundary);
    markPeriodBoundaryChanged(boundary);
    refreshPeriodDependentPickers(boundary.closest('[data-period-editor]'), timepointInput);
  }

  if (action === 'save-timepoint') {
    await saveBoundaryTimepoint(boundary);
  }
}

async function saveBoundaryTimepoint(boundary) {
  const dateInput = boundary.querySelector('[data-period-custom] [data-date-control]');
  const raw = dateInput ? readDateControlRaw(dateInput) : '';
  if (!raw) {
    return;
  }

  const name = boundaryTimepointName(boundary, raw);
  const dateField = dateInput.dataset.nestedField || '';
  const timepointField = boundary.dataset.periodBoundary || '';
  const response = await postJson('object-create', {
    type: 'timepoints',
    object: { name, date: readDateValue(raw), _certainty: 'confident' },
  });

  await loadObjects();
  renderNavigationCounts();
  renderObjectCollection('timepoints');

  const timepointId = objectId(response.object);
  const timepointInput = boundary.querySelector('[data-period-timepoint] [data-reference-input]');
  if (timepointInput) {
    timepointInput.dataset.referenceValue = timepointId;
    timepointInput.innerHTML = referenceOptions('timepoints', timepointInput.dataset.referenceShowIds === '1', { currentValue: timepointId });
    timepointInput.value = timepointId;
  }
  if (dateInput) {
    clearDateControl(dateInput);
  }

  setPeriodBoundaryMode(boundary, 'timepoint');
  setPeriodBoundaryAction(boundary, 'custom-date', 'zu Datum wechseln');
  boundary.querySelector('.period-save-timepoint')?.remove();
  markPeriodBoundaryChanged(boundary);

  if (dateField || timepointField) {
    refreshPeriodDependentPickers(boundary.closest('[data-period-editor]'), timepointInput);
  }
}

function boundaryTimepointName(boundary, raw) {
  const side = boundary.dataset.periodBoundary === 'endTimepoint' ? 'Ende' : 'Start';
  const owner = periodOwnerLabel(boundary);
  const activityEditor = boundary.closest('[data-activity-editor]');
  if (activityEditor) {
    return timepointNameParts([
      owner,
      referenceLabelFromRoot(activityEditor, 'role', 'roles') || 'Aktivität',
      referenceLabelFromRoot(activityEditor, 'group', 'groups'),
      side,
    ], raw);
  }

  const membershipEditor = boundary.closest('[data-membership-editor]');
  if (membershipEditor) {
    return timepointNameParts([
      owner,
      'Mitgliedschaft',
      referenceLabelFromRoot(membershipEditor, 'group', 'groups'),
      side,
    ], raw);
  }

  const groupPhaseEditor = boundary.closest('.nested-editor');
  if (groupPhaseEditor?.querySelector('[data-nested-field="groupType"]')) {
    return timepointNameParts([
      owner,
      referenceLabelFromRoot(groupPhaseEditor, 'groupType', 'group-types') || 'Phase',
      side,
    ], raw);
  }

  return timepointNameParts([owner, side], raw);
}

function periodOwnerLabel(element) {
  const root = ownerRootForElement(element);
  const type = root?.dataset.objectType || root?.dataset.createForm || '';
  if (!type) {
    return '';
  }

  const id = root?.dataset.objectId || '';
  if (id) {
    return objectListTitle(type, findReferenceObject(type, id) || {});
  }

  return objectListTitle(type, objectFromEditorRoot(root, type));
}

function objectFromEditorRoot(root, type) {
  const object = {};
  (objectConfigs[type]?.fields || []).forEach((field) => {
    if (!['text', undefined].includes(field.kind) && field.kind !== 'textarea') {
      return;
    }

    const fieldRoot = root?.querySelector(`[data-object-field="${cssEscape(field.name)}"]`);
    const input = fieldRoot?.matches('input, textarea') ? fieldRoot : fieldRoot?.querySelector('input, textarea');
    if (input) {
      object[field.name] = input.value.trim();
    }
  });
  return object;
}

function referenceLabelFromRoot(root, field, collection) {
  const value = nestedValue(root, field);
  const object = findReferenceObject(collection, value);
  return objectLabel(object, collection) || '';
}

function timepointNameParts(parts, raw) {
  const name = parts.map((part) => String(part || '').trim()).filter(Boolean).join(' ');
  return name || `Zeitpunkt ${dateDisplayValue(raw)}`;
}

function setPeriodBoundaryAction(boundary, action, label) {
  boundary.querySelectorAll('[data-period-action]').forEach((button) => {
    button.dataset.periodAction = action;
    button.textContent = `(${label})`;
  });
}

function syncPeriodSaveTimepointAction(boundary) {
  const customWrap = boundary.querySelector('[data-period-custom]');
  if (!customWrap) {
    return;
  }

  const shouldShow = boundary.dataset.periodMode === 'custom';
  const existing = customWrap.querySelector('.period-save-timepoint');
  if (shouldShow && !existing) {
    customWrap.insertAdjacentHTML('beforeend', '<button class="period-toggle period-save-timepoint" type="button" data-period-action="save-timepoint">(als Zeitpunkt speichern)</button>');
  } else if (!shouldShow && existing) {
    existing.remove();
  }
}

function setPeriodBoundaryMode(boundary, mode) {
  boundary.dataset.periodMode = mode;
  const isCustom = mode === 'custom';
  const timepointWrap = boundary.querySelector('[data-period-timepoint]');
  const customWrap = boundary.querySelector('[data-period-custom]');
  if (timepointWrap) {
    timepointWrap.hidden = isCustom;
  }
  if (customWrap) {
    customWrap.hidden = !isCustom;
  }
}

function markPeriodBoundaryChanged(boundary) {
  const item = boundary.closest('[data-object-type][data-object-id]');
  if (item) {
    markObjectDirty(item);
    scheduleObjectSave(item, 1800);
    return;
  }

  const createForm = boundary.closest('[data-create-form]');
  if (createForm) {
    clearCreateState(createForm);
  }
}

function focusDateControl(input) {
  if (!input) {
    return;
  }

  window.setTimeout(() => {
    input.focus();
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch (_error) {
        // Browser picker APIs can reject when not treated as a direct gesture.
      }
    }
  }, 0);
}

function handleListAction(button) {
  const fieldRoot = button.closest('[data-object-field]');
  if (!fieldRoot) {
    return;
  }

  if (button.dataset.listAction === 'toggle') {
    const item = button.closest('[data-list-item]');
    if (item?.dataset.listCollapsible === '1') {
      const willOpen = item.classList.contains('is-collapsed');
      const personKey = relationshipPersonKeyFromFieldRoot(fieldRoot);
      if (personKey) {
        if (willOpen) {
          collapseRelationshipRowsForPerson(fieldRoot, item);
          state.relationshipEditing[personKey] = item.dataset.relationshipRowKey || '';
        } else if (state.relationshipEditing[personKey] === (item.dataset.relationshipRowKey || '')) {
          delete state.relationshipEditing[personKey];
        }
      }
      item.classList.toggle('is-collapsed', !willOpen);
      button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }
    return;
  }

  if (button.dataset.listAction === 'remove') {
    if (!confirmDangerButton(button)) {
      return;
    }

    const item = button.closest('[data-list-item]');
    const personKey = relationshipPersonKeyFromFieldRoot(fieldRoot);
    if (personKey) {
      delete state.relationshipEditing[personKey];
    }
    if (item) {
      const list = item.parentElement;
      item.remove();
      if (fieldRoot.classList.contains('group-type-reference-field')) {
        refreshGroupTypeAddSelect(fieldRoot);
      } else if (list && list.children.length === 0 && !isRelationshipListField(fieldRoot)) {
        appendBlankListItem(fieldRoot);
      }
    }
  }

  if (button.dataset.listAction === 'add') {
    if (isRelationshipListField(fieldRoot) && focusUnsavedRelationshipRow(fieldRoot, button)) {
      return;
    }

    const personKey = relationshipPersonKeyFromFieldRoot(fieldRoot);
    if (personKey) {
      collapseRelationshipRowsForPerson(fieldRoot);
      const list = fieldRoot.querySelector('[data-list-items]');
      state.relationshipEditing[personKey] = `${fieldRoot.dataset.objectField}:${list?.children.length || 0}`;
    }
    appendBlankListItem(fieldRoot);
  }

  markCompositeChanged(fieldRoot);
}

function focusExistingCreateForm(triggerButton) {
  const form = openCreateForm();
  if (!form) {
    return false;
  }

  if (isPristineCreateForm(form)) {
    closeCreateForm(form);
    return false;
  }

  showInlineActionFeedback(triggerButton, 'Offenen Eintrag erst speichern oder abbrechen.');
  scrollElementIntoView(form);
  form.querySelector('[data-object-field] input, [data-object-field] textarea, [data-object-field] select, input, textarea, select')?.focus();
  return true;
}

function openCreateForm() {
  return document.querySelector('[data-create-form], [data-user-create-form]');
}

function closeCreateForm(form) {
  const type = form.dataset.createForm || (form.matches('[data-user-create-form]') ? 'users' : '');
  if (!type) {
    return;
  }

  state.createOpen[type] = false;
  if (type === 'users') {
    renderUsersManagement();
  } else {
    renderObjectCollection(type);
  }
}

function isPristineCreateForm(form) {
  if (form.matches('[data-user-create-form]')) {
    return isPristineUserCreateForm(form);
  }

  return isPristineObjectCreateForm(form);
}

function isPristineUserCreateForm(form) {
  const username = String(form.querySelector('input[name="username"]')?.value || '');
  const displayName = String(form.querySelector('input[name="display_name"]')?.value || '');
  const permissions = Array.from(form.querySelectorAll('input[name="permissions"]:checked')).map((input) => input.value);
  return username === '' && displayName === '' && payloadsEqual(permissions, ['read']);
}

function isPristineObjectCreateForm(form) {
  const type = form.dataset.createForm;
  if (!type) {
    return false;
  }

  try {
    return payloadsEqual(collectObjectFields(form), defaultCreatePayload(form, type));
  } catch (_error) {
    return false;
  }
}

function defaultCreatePayload(form, type) {
  const payload = {};
  visibleFields(type).forEach((field) => {
    if (form.querySelector(`[data-object-field="${cssEscape(field.name)}"]`)) {
      payload[field.name] = defaultFieldValue(field);
    }
  });
  return payload;
}

function payloadsEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function focusUnsavedRelationshipRow(fieldRoot, triggerButton) {
  const list = fieldRoot.querySelector('[data-list-items]');
  if (!list) {
    return false;
  }

  const savedCount = Number(fieldRoot.dataset.listSavedCount || 0);
  const row = list.children[savedCount];
  if (!row) {
    return false;
  }

  const personKey = relationshipPersonKeyFromFieldRoot(fieldRoot);
  if (personKey) {
    collapseRelationshipRowsForPerson(fieldRoot, row);
    state.relationshipEditing[personKey] = row.dataset.relationshipRowKey || '';
  }

  row.classList.remove('is-collapsed');
  row.querySelector('[data-list-action="toggle"]')?.setAttribute('aria-expanded', 'true');
  showInlineActionFeedback(triggerButton, 'Offenen Eintrag erst speichern oder abbrechen.');
  scrollElementIntoView(row);
  return true;
}

function showInlineActionFeedback(trigger, text) {
  if (!trigger) {
    return;
  }

  document.querySelectorAll('[data-inline-action-feedback]').forEach((element) => element.remove());
  const element = document.createElement('span');
  element.dataset.inlineActionFeedback = '1';
  element.className = 'inline-action-feedback';
  element.textContent = text;
  document.body.appendChild(element);

  const rect = trigger.getBoundingClientRect();
  const top = window.scrollY + rect.top;
  const left = window.scrollX + rect.left + rect.width / 2;
  element.style.top = `${Math.max(8, top - 8)}px`;
  element.style.left = `${left}px`;

  window.setTimeout(() => {
    if (element.isConnected && element.textContent === text) {
      element.remove();
    }
  }, 2400);
}

function scrollElementIntoView(element) {
  window.requestAnimationFrame(() => {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function confirmDangerButton(button) {
  if (button.dataset.dangerConfirm === '1') {
    return true;
  }

  resetDangerConfirmations(button);
  button.dataset.dangerConfirm = '1';
  button.dataset.dangerConfirmText = button.textContent;
  button.dataset.dangerConfirmLabel = button.getAttribute('aria-label') || '';
  button.textContent = `${button.textContent}?`;
  button.setAttribute('aria-label', 'Bestätigen');
  button.classList.add('is-confirming');
  return false;
}

function resetDangerConfirmations(exceptButton = null) {
  document.querySelectorAll('[data-danger-confirm="1"]').forEach((button) => {
    if (button === exceptButton) {
      return;
    }

    button.textContent = button.dataset.dangerConfirmText || button.textContent;
    if (button.dataset.dangerConfirmLabel) {
      button.setAttribute('aria-label', button.dataset.dangerConfirmLabel);
    } else {
      button.removeAttribute('aria-label');
    }
    delete button.dataset.dangerConfirm;
    delete button.dataset.dangerConfirmText;
    delete button.dataset.dangerConfirmLabel;
    button.classList.remove('is-confirming');
  });
}

function isRelationshipListField(fieldRoot) {
  return ['group-phase', 'group-phase-list', 'membership-list', 'activity-list'].includes(fieldRoot?.dataset.fieldKind || '');
}

function relationshipPersonKeyFromFieldRoot(fieldRoot) {
  if (!isRelationshipListField(fieldRoot)) {
    return '';
  }

  const ownerItem = fieldRoot.closest('[data-object-type][data-object-id]');
  return ownerItem ? objectKey(ownerItem.dataset.objectType || '', ownerItem.dataset.objectId || '') : '';
}

function collapseRelationshipRowsForPerson(fieldRoot, exceptItem = null) {
  const ownerItem = fieldRoot.closest('[data-object-type][data-object-id]');
  if (!ownerItem) {
    return;
  }

  const usePersonRelationshipGroup = ownerItem.dataset.objectType === 'people'
    && ['membership-list', 'activity-list'].includes(fieldRoot.dataset.fieldKind || '');
  const root = usePersonRelationshipGroup ? ownerItem : fieldRoot;
  const selector = usePersonRelationshipGroup
    ? '[data-object-field="memberships"] [data-list-item][data-list-collapsible="1"], [data-object-field="activities"] [data-list-item][data-list-collapsible="1"]'
    : '[data-list-item][data-list-collapsible="1"]';

  root.querySelectorAll(selector).forEach((item) => {
    if (item === exceptItem) {
      return;
    }

    item.classList.add('is-collapsed');
    item.querySelector('[data-list-action="toggle"]')?.setAttribute('aria-expanded', 'false');
  });
}

function appendBlankListItem(fieldRoot) {
  const list = fieldRoot.querySelector('[data-list-items]');
  const kind = fieldRoot.dataset.fieldKind;
  if (!list) {
    return;
  }

  if (kind === 'reference-list') {
    list.insertAdjacentHTML('beforeend', renderReferenceListItem(
      fieldRoot.dataset.referenceCollection || '',
      '',
      ownerContextForElement(fieldRoot),
      referenceListItemLabel({ collection: fieldRoot.dataset.referenceCollection || '' }),
    ));
    return;
  }

  list.insertAdjacentHTML('beforeend', renderComplexListItem(kind, {}, {
    ...ownerContextForElement(fieldRoot),
    listField: fieldRoot.dataset.objectField || '',
    listIndex: list.children.length,
  }));
}

function markCompositeChanged(fieldRoot) {
  const item = fieldRoot.closest('[data-object-type][data-object-id]');
  if (item) {
    markObjectDirty(item);
    scheduleObjectSave(item, 600);
    return;
  }

  const createForm = fieldRoot.closest('[data-create-form]');
  if (createForm) {
    clearCreateState(createForm);
  }
}

function handleReferencePickerChange(event) {
  const groupTypeAdd = event.target.closest('[data-group-type-add]');
  if (groupTypeAdd) {
    handleGroupTypeAdd(groupTypeAdd);
    return;
  }

  const birthdateInput = event.target.closest('[data-object-field="birthdate"]');
  if (birthdateInput) {
    syncDateControlRaw(birthdateInput);
    refreshReferencePickers(ownerRootForElement(birthdateInput));
    return;
  }

  const periodDateInput = event.target.closest('[data-date-control]');
  if (periodDateInput) {
    syncDateControlRaw(periodDateInput);
    const periodEditor = periodDateInput.closest('[data-period-editor]');
    refreshPeriodDependentPickers(periodEditor, periodDateInput);
    return;
  }

  const select = event.target.closest('[data-reference-input]');
  if (!select) {
    return;
  }

  const periodEditor = select.closest('[data-period-editor]');
  if (periodEditor) {
    refreshPeriodDependentPickers(periodEditor, select);
    return;
  }

  const action = select.value;
  const activityEditor = select.closest('[data-activity-editor]');
  if (activityEditor && action === pickerActionShowAllGroups) {
    clearActivityPicker(activityEditor, 'role');
    select.value = '';
    refreshActivityPickerPair(activityEditor, select);
    return;
  }

  if (activityEditor && action === pickerActionShowAllRoles) {
    clearActivityPicker(activityEditor, 'group');
    select.value = '';
    refreshActivityPickerPair(activityEditor, select);
    return;
  }

  if (activityEditor) {
    refreshActivityPickerPair(activityEditor, select);
    return;
  }

  if (select.dataset.referencePicker === 'membership-group') {
    updateReferenceSelectOptions(select);
  }
}

function handleGroupTypeAdd(select) {
  const value = select.value;
  const fieldRoot = select.closest('[data-object-field]');
  const list = fieldRoot?.querySelector('[data-list-items]');
  if (!value || !fieldRoot || !list) {
    return;
  }

  if (!list.querySelector(`[data-fixed-reference-value="${cssEscape(value)}"]`)) {
    list.insertAdjacentHTML('beforeend', renderFixedGroupTypeListItem(value));
  }

  const selectedValues = Array.from(list.querySelectorAll('[data-fixed-reference-value]'))
    .map((item) => item.dataset.fixedReferenceValue || '')
    .filter(Boolean);
  const addField = select.closest('.group-type-add-field');
  if (addField) {
    addField.outerHTML = renderGroupTypeAddSelect(selectedValues);
  }
  markCompositeChanged(fieldRoot);
}

function refreshGroupTypeAddSelect(fieldRoot) {
  const selectedValues = Array.from(fieldRoot.querySelectorAll('[data-fixed-reference-value]'))
    .map((item) => item.dataset.fixedReferenceValue || '')
    .filter(Boolean);
  const addField = fieldRoot.querySelector('.group-type-add-field');
  if (addField) {
    addField.outerHTML = renderGroupTypeAddSelect(selectedValues);
  }
}

function refreshReferencePickers(root) {
  if (!root) {
    return;
  }

  root.querySelectorAll('[data-reference-input]').forEach((select) => {
    if (!select.closest('[data-membership-editor], [data-activity-editor]')) {
      updateReferenceSelectOptions(select);
    }
  });

  root.querySelectorAll('[data-membership-editor] [data-reference-picker="membership-group"]').forEach((select) => {
    updateReferenceSelectOptions(select);
  });

  root.querySelectorAll('[data-period-editor]').forEach((editor) => {
    refreshPeriodTimepointPair(editor);
  });

  root.querySelectorAll('[data-activity-editor]').forEach((editor) => {
    refreshActivityPickerPair(editor);
  });
}

function refreshPeriodDependentPickers(periodEditor, changedControl = null) {
  refreshPeriodTimepointPair(periodEditor);

  const membershipEditor = periodEditor?.closest('[data-membership-editor]');
  if (membershipEditor) {
    const groupSelect = membershipEditor.querySelector('[data-reference-picker="membership-group"]');
    if (groupSelect) {
      updateReferenceSelectOptions(groupSelect);
    }
  }

  const activityEditor = periodEditor?.closest('[data-activity-editor]');
  if (activityEditor) {
    refreshActivityPickerPair(activityEditor);
  }
}

function refreshPeriodTimepointPair(editor) {
  if (!editor) {
    return;
  }

  editor.querySelectorAll('[data-reference-picker="period-start-timepoint"], [data-reference-picker="period-end-timepoint"]').forEach((select) => {
    updateReferenceSelectOptions(select);
  });
}

function refreshActivityPickerPair(editor, changedSelect = null) {
  const groupSelect = editor.querySelector('[data-reference-picker="activity-group"]');
  const roleSelect = editor.querySelector('[data-reference-picker="activity-role"]');
  if (!groupSelect || !roleSelect) {
    return;
  }

  let groupId = referenceSelectValue(groupSelect);
  let roleId = referenceSelectValue(roleSelect);
  const group = findReferenceObject('groups', groupId);
  const role = findReferenceObject('roles', roleId);

  if (groupId && roleId && !roleUsableForGroup(role, group)) {
    if (changedSelect === roleSelect) {
      groupSelect.value = '';
      groupId = '';
    } else {
      roleSelect.value = '';
      roleId = '';
    }
  }

  updateReferenceSelectOptions(groupSelect);
  updateReferenceSelectOptions(roleSelect);
}

function clearActivityPicker(editor, nestedField) {
  const select = editor.querySelector(`[data-nested-field="${cssEscape(nestedField)}"]`);
  if (select) {
    select.value = '';
  }
}

function handleReferenceFilterInput(event) {
  const input = event.target.closest('[data-reference-filter]');
  if (!input) {
    return;
  }

  const select = input.closest('[data-reference-field]')?.querySelector('[data-reference-input]');
  filterReferenceOptions(select, input.value);
}

function updateReferenceSelectOptions(select) {
  const current = referenceSelectValue(select);
  const collection = select.dataset.referenceCollection || '';
  const showIds = select.dataset.referenceShowIds === '1';
  const config = referenceOptionConfigForSelect(select, current);
  const nextValue = config.allowOutOfScopeCurrent || referenceValueInScope(collection, current, config) ? current : '';
  select.innerHTML = referenceOptions(collection, showIds, { ...config, currentValue: nextValue });
  select.value = Array.from(select.options).some((option) => option.value === nextValue) ? nextValue : '';
  filterReferenceOptions(select, select.closest('[data-reference-field]')?.querySelector('[data-reference-filter]')?.value || '');
}

function filterReferenceOptions(select, query) {
  if (!select) {
    return;
  }

  const needle = String(query || '').trim().toLocaleLowerCase('de');
  Array.from(select.options).forEach((option) => {
    const isControlOption = !option.value || option.value.startsWith('__picker_');
    const isSelected = option.value && option.value === select.value;
    option.hidden = Boolean(needle)
      && !isControlOption
      && !isSelected
      && !option.textContent.toLocaleLowerCase('de').includes(needle);
  });
}

function referenceValueInScope(collection, value, config = {}) {
  if (!value) {
    return true;
  }

  return referencePickerObjects(collection, { ...config, currentValue: '' })
    .some((object) => objectId(object) === value);
}

function referenceOptionConfigForSelect(select, currentValue = '') {
  const picker = select.dataset.referencePicker || '';
  const config = { currentValue };

  if (picker === 'membership-group') {
    config.birthYear = pickerBirthYear(select);
    config.period = pickerPeriod(select);
  }

  const activityEditor = select.closest('[data-activity-editor]');
  if (picker === 'activity-group') {
    const roleId = referenceSelectValue(activityEditor?.querySelector('[data-reference-picker="activity-role"]'));
    config.birthYear = pickerBirthYear(select);
    config.roleId = roleId;
    config.period = pickerPeriod(select);
    if (roleHasGroupTypeRestrictions(findReferenceObject('roles', roleId))) {
      config.actionValue = pickerActionShowAllGroups;
      config.actionLabel = 'Alle Gruppen anzeigen (Rolle leeren)';
    }
  }

  if (picker === 'activity-role') {
    const groupId = referenceSelectValue(activityEditor?.querySelector('[data-reference-picker="activity-group"]'));
    config.groupId = groupId;
    if (groupTypeIds(findReferenceObject('groups', groupId)).length) {
      config.actionValue = pickerActionShowAllRoles;
      config.actionLabel = 'Alle Rollen anzeigen (Gruppe leeren)';
    }
  }

  if (picker === 'period-start-timepoint') {
    config.minYear = pickerBirthYear(select);
    config.maxYear = periodBoundaryYear(oppositePeriodBoundary(select, 'endTimepoint'));
    config.allowOutOfScopeCurrent = true;
  }

  if (picker === 'period-end-timepoint') {
    config.minYear = Math.max(pickerBirthYear(select), periodBoundaryYear(oppositePeriodBoundary(select, 'startTimepoint')));
    config.allowOutOfScopeCurrent = true;
  }

  return config;
}

function referenceSelectValue(select) {
  const value = String(select?.value || '');
  return value === pickerActionShowAllGroups || value === pickerActionShowAllRoles ? '' : value;
}

function pickerBirthYear(select) {
  const root = ownerRootForElement(select);
  const ownerType = root?.dataset.objectType || root?.dataset.createForm || '';
  if (ownerType !== 'people') {
    return 0;
  }

  const birthdateInput = root.querySelector('[data-object-field="birthdate"]');
  return birthYearFromDateValue(birthdateInput?.value) || Number(select.dataset.ownerBirthYear || 0);
}

function pickerPeriod(select) {
  const periodEditor = select.closest('[data-membership-editor], [data-activity-editor]')?.querySelector('[data-period-editor]');
  return readPeriod(periodEditor);
}

function oppositePeriodBoundary(select, field) {
  return select.closest('[data-period-editor]')?.querySelector(`[data-period-boundary="${cssEscape(field)}"]`) || null;
}

function periodBoundaryYear(boundary) {
  if (!boundary) {
    return 0;
  }

  if (boundary.dataset.periodMode === 'custom') {
    return numericYear(readDateControlRaw(boundary.querySelector('[data-date-control]')));
  }

  const select = boundary.querySelector('[data-reference-input]');
  return periodBoundaryYearFromValue(referenceSelectValue(select), null);
}

function ownerRootForElement(element) {
  return element?.closest('[data-object-type], [data-create-form]');
}

function ownerContextForElement(element) {
  const root = ownerRootForElement(element);
  const ownerType = root?.dataset.objectType || root?.dataset.createForm || '';
  const ownerId = root?.dataset.objectId || '';
  const ownerObject = ownerType && ownerId ? structuredCloneSafe(findReferenceObject(ownerType, ownerId) || {}) : {};
  const birthdateInput = root?.querySelector('[data-object-field="birthdate"]');
  if (birthdateInput) {
    ownerObject.birthdate = readDateValue(readDateControlRaw(birthdateInput));
  }

  return { ownerType, ownerObject };
}

function handleCollectionControlInput(event) {
  const control = event.target.closest('[data-collection-control]');
  if (!control || control.dataset.collectionControlName !== 'search') {
    return;
  }

  updateCollectionControl(control);
}

function handleCollectionControlChange(event) {
  const control = event.target.closest('[data-collection-control]');
  if (!control) {
    return;
  }

  updateCollectionControl(control);
}

function updateCollectionControl(control) {
  const type = control.dataset.collectionType;
  const name = control.dataset.collectionControlName;
  if (!type || !name) {
    return;
  }

  const ui = collectionUi(type);
  let shouldRenderControls = false;
  if (name === 'sort') {
    const nextSort = control.value || collectionDefaultSorts[type];
    ui.sortExplicit = true;
    if (nextSort !== ui.sort) {
      ui.sort = nextSort;
      ui.sortDirection = collectionDefaultSortDirection(type, nextSort);
      shouldRenderControls = true;
    }
  } else if (name === 'search') {
    ui.search = control.value || '';
  } else {
    ui.filters[name] = Array.from(control.selectedOptions || []).map((option) => option.value).filter(Boolean);
  }
  state.collectionVisibleCounts[type] = collectionVisibleStep;

  if (shouldRenderControls) {
    renderCollectionControls();
  }

  if (type === 'users') {
    renderUserList();
  } else {
    renderObjectCollection(type);
  }
  writeUrlState({ view: type });
}

async function handleObjectInput(event) {
  const dateInput = event.target.closest('[data-date-control]');
  if (dateInput) {
    syncDateControlRaw(dateInput);
    if (!dateInput.closest('[data-object-field]')) {
      markDateControlChanged(dateInput);
    }
  }

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
  const dateInput = event.target.closest('[data-date-control]');
  if (dateInput) {
    syncDateControlRaw(dateInput);
    if (!dateInput.closest('[data-object-field]')) {
      markDateControlChanged(dateInput);
      return;
    }
  }

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
  resetDateConfirmFromElement(event.target, event.relatedTarget);
  const input = event.target.closest('[data-object-field]');
  const item = input?.closest('[data-object-type][data-object-id]');
  if (item) {
    scheduleObjectSave(item, 250);
  }
}

function handleEditorFocus(event) {
  const input = event.target.closest('[data-reference-input], [data-certainty-input], [data-date-control]');
  if (!input) {
    return;
  }

  if (typeof input.select === 'function' && input.type !== 'date' && input.type !== 'month') {
    input.select();
  }

  if (typeof input.showPicker === 'function') {
    window.setTimeout(() => {
      try {
        input.showPicker();
      } catch (_error) {
        // Some browsers require direct user activation for picker popups.
      }
    }, 0);
  }
}

document.addEventListener('submit', async (event) => {
  const userCreateForm = event.target.closest('[data-user-create-form]');
  if (userCreateForm) {
    event.preventDefault();
    await createUser(userCreateForm);
    return;
  }

  const form = event.target.closest('[data-create-form]');
  if (!form) {
    return;
  }

  event.preventDefault();
  await createObjectFromForm(form);
});

function markObjectDirty(item) {
  item.dataset.dirty = '1';
  setObjectSaveState(item, 'Ungespeichert', false);
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
    setObjectSaveState(item, localizeErrorMessage(error.message), true);
    return;
  }

  const payloadKey = JSON.stringify(payload);
  if (item.dataset.lastSavedPayload === payloadKey && item.dataset.dirty !== '1') {
    return;
  }

  item.dataset.saving = '1';
  setObjectSaveState(item, 'Wird gespeichert', false);

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
      setObjectSaveState(item, 'Gespeichert', false, true);
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
    setCreateState(form, localizeErrorMessage(error.message), true);
    return false;
  }

  setCreateState(form, 'Wird erstellt', false);
  try {
    await postJson('object-create', { type, object: payload });
    state.createOpen[type] = false;
    await reloadObjectData();
    return true;
  } catch (error) {
    setCreateState(form, localizeErrorMessage(error.message || 'Objekt konnte nicht erstellt werden.'), true);
    return false;
  }
}

async function handleExampleDataClick(event) {
  const button = event.target.closest('#exampleDataButton');
  if (!button) {
    return;
  }

  event.preventDefault();
  await createExampleData();
}

function updateExampleDataVisibility() {
  if (!exampleDataButton) {
    return;
  }

  exampleDataButton.hidden = !canCreateExampleData();
  if (exampleDataState && exampleDataButton.hidden && !state.exampleDataCreating) {
    exampleDataState.hidden = true;
  }
}

function canCreateExampleData() {
  return hasPermission('write')
    && ['people', 'groups', 'timepoints'].every((type) => (state.objects[type] || []).length === 0)
    && objectLabelsMatchStock('group-types', stockGroupTypeLabelGroups)
    && objectLabelsMatchStock('roles', stockRoleLabelGroups);
}

function objectLabelsMatchStock(type, labelGroups) {
  const matched = new Set();
  const labels = (state.objects[type] || []).map((object) => normalizeExampleDataLabel(objectLabel(object, type)));
  if (labels.length !== labelGroups.length) {
    return false;
  }

  return labels.every((label) => {
    const index = labelGroups.findIndex((group, groupIndex) => (
      !matched.has(groupIndex)
      && group.map((candidate) => normalizeExampleDataLabel(candidate)).includes(label)
    ));
    if (index === -1) {
      return false;
    }

    matched.add(index);
    return true;
  });
}

async function createExampleData() {
  if (state.exampleDataCreating || !hasPermission('write')) {
    return;
  }

  state.exampleDataCreating = true;
  setExampleDataState('Erstelle Beispieldaten', false);
  if (exampleDataButton) {
    exampleDataButton.disabled = true;
  }

  try {
    const created = {};
    const existingObject = (type, labelsToFind) => {
      const labels = labelsToFind.map((label) => normalizeExampleDataLabel(label));
      return (state.objects[type] || []).find((object) => labels.includes(normalizeExampleDataLabel(objectLabel(object, type)))) || null;
    };
    const useExisting = (type, key, ...labels) => {
      const object = existingObject(type, labels);
      if (!object) {
        throw new Error(`${labels[0]} fehlt in den Basisdaten.`);
      }

      created[key] = object;
      return object;
    };
    const create = async (type, key, object) => {
      const response = await postJson('object-create', { type, object });
      created[key] = response.object;
      return response.object;
    };
    const id = (key) => objectId(created[key]);
    const ensureRoleGroupTypes = async (roleKey, groupTypeKeys) => {
      const role = created[roleKey];
      const current = Array.isArray(role?.groupTypes) ? role.groupTypes.filter(Boolean) : [];
      const desired = groupTypeKeys.map((groupTypeKey) => id(groupTypeKey)).filter(Boolean);
      const missing = desired.filter((groupTypeId) => !current.includes(groupTypeId));
      if (!role || !missing.length) {
        return;
      }

      const response = await postJson('object-update', {
        type: 'roles',
        id: objectId(role),
        base_revision: Number(role._revision || 0),
        object: {
          groupTypes: [...current, ...missing],
        },
      });
      created[roleKey] = response.object;
      updateObjectInState('roles', response.object);
    };
    const date = (rawValue) => ({ rawValue });
    const period = (startTimepoint = '', customStart = null, endTimepoint = '', customEnd = null) => ({
      startTimepoint,
      customStart,
      endTimepoint,
      customEnd,
    });
    const phase = (groupType, phasePeriod) => ({ groupType, period: phasePeriod });

    useExisting('group-types', 'typeStamm', 'Stamm');
    useExisting('group-types', 'typeMeute', 'Meute');
    useExisting('group-types', 'typeRudel', 'Rudel');
    useExisting('group-types', 'typeSippe', 'Sippe');
    useExisting('group-types', 'typeGilde', 'Gilde');
    useExisting('group-types', 'typeRunde', 'Runde');
    useExisting('group-types', 'typeKreis', 'Kreis');

    useExisting('roles', 'roleStafue', 'Stammesführung');
    useExisting('roles', 'roleStellvStafue', 'Stellv. Stammesführung');
    useExisting('roles', 'roleKawa', 'Kassenwart');
    useExisting('roles', 'roleStellvKawa', 'Stellv. Kassenwart', 'Stellv. Kassenwart*in');
    useExisting('roles', 'roleHandkasse', 'Handkasse');
    useExisting('roles', 'roleMeufue', 'Meutenführung');
    useExisting('roles', 'roleMeutenassi', 'Meutenassistenz');
    useExisting('roles', 'roleRudelfue', 'Rudelführung');
    useExisting('roles', 'roleSifue', 'Sippenführung');
    useExisting('roles', 'roleGildenspr', 'Gildensprecher', 'Gildensprecher*in');
    useExisting('roles', 'roleRundenspr', 'Rundensprecher', 'Rundensprecher*in');
    useExisting('roles', 'roleKreisleit', 'Kreisleitung');
    await ensureRoleGroupTypes('roleStafue', ['typeStamm']);
    await ensureRoleGroupTypes('roleStellvStafue', ['typeStamm']);
    await ensureRoleGroupTypes('roleKawa', ['typeStamm']);
    await ensureRoleGroupTypes('roleStellvKawa', ['typeStamm']);
    await ensureRoleGroupTypes('roleHandkasse', ['typeStamm', 'typeMeute', 'typeRudel', 'typeSippe', 'typeGilde', 'typeRunde', 'typeKreis']);
    await ensureRoleGroupTypes('roleMeufue', ['typeMeute']);
    await ensureRoleGroupTypes('roleMeutenassi', ['typeMeute']);
    await ensureRoleGroupTypes('roleRudelfue', ['typeRudel']);
    await ensureRoleGroupTypes('roleSifue', ['typeSippe']);
    await ensureRoleGroupTypes('roleGildenspr', ['typeGilde']);
    await ensureRoleGroupTypes('roleRundenspr', ['typeRunde']);
    await ensureRoleGroupTypes('roleKreisleit', ['typeKreis']);
    await create('roles', 'roleMatihueschlue', { label: 'Matihüschlüwa', groupTypes: [id('typeStamm')], _certainty: 'confident' });

    await create('timepoints', 'timepointStamm', { name: 'Stammesgründung', date: date('1952-01-01'), _certainty: 'confident' });
    await create('timepoints', 'timepointPfila06', { name: 'Pfingstlager', date: date('2006-06-02'), _certainty: 'confident' });
    await create('timepoints', 'timepointNiko06', { name: 'Nikofahrt', date: date('2006-11-16'), _certainty: 'confident' });
    await create('timepoints', 'timepointNiko07', { name: 'Nikofahrt', date: date('2007-12-05'), _certainty: 'confident' });
    await create('timepoints', 'timepointPfila08', { name: 'Pfingstlager', date: date('2008-05-06'), _certainty: 'confident' });
    await create('timepoints', 'timepointNiko08', { name: 'Nikofahrt', date: date('2008-11-22'), _certainty: 'confident' });
    await create('timepoints', 'timepointPfila12', { name: 'Pfingstlager', date: date('2012-06-01'), _certainty: 'confident' });

    await create('groups', 'groupStamm', {
      name: 'der Vaganten',
      description: 'stammdervaganten.de',
      _certainty: 'confident',
      mainPhase: phase(id('typeStamm'), period(id('timepointStamm'), null, '', date('2000-01-01'))),
      additionalPhases: [],
    });
    await create('groups', 'groupPhoenix', {
      name: 'Phönix',
      _certainty: 'confident',
      mainPhase: phase(id('typeSippe'), period(id('timepointNiko06'), null, id('timepointPfila12'), null)),
      additionalPhases: [
        phase(id('typeRudel'), period(id('timepointPfila06'), null, id('timepointNiko06'), null)),
        phase(id('typeRunde'), period(id('timepointPfila08'), null, id('timepointPfila12'), null)),
      ],
    });

    await create('people', 'scoutBob', {
      forename: 'Bob',
      lastname: 'Meister',
      scoutname: 'Baumeister',
      birthdate: date('2001-02-01'),
      _certainty: 'confident',
      memberships: [{ group: id('groupStamm'), period: period('', date('2011-01-01'), '', date('2022-01-01')) }],
      activities: [{ group: id('groupStamm'), role: id('roleStafue'), period: period('', date('1960-01-01'), id('timepointNiko06'), null) }],
    });
    await create('people', 'scoutKlaus', {
      forename: 'Klaus',
      lastname: 'Heinz',
      contactInfo: 'klaus@heinz.rocks',
      _certainty: 'confident',
      memberships: [{ group: id('groupStamm'), period: period('', date('1997-01-01'), '', date('2003-01-01')) }],
      activities: [{ group: id('groupStamm'), role: id('roleStellvKawa'), period: period('', date('1999-01-01'), '', date('2001-01-01')) }],
    });
    await create('people', 'scoutJaqueline', {
      forename: 'Jaqueline',
      lastname: 'Holz',
      birthdate: date('1997-01-01'),
      contactInfo: '+49800321456',
      notes: 'dazu gekommen durch Klaus',
      _certainty: 'confident',
      memberships: [{ group: id('groupStamm'), period: period('', date('2005-01-01'), '', date('2010-01-01')) }],
      activities: [],
    });

    await reloadObjectData();
    setExampleDataState('Beispieldaten erstellt', false, true);
  } catch (error) {
    setExampleDataState(localizeErrorMessage(error.message || 'Beispieldaten konnten nicht erstellt werden.'), true);
  } finally {
    state.exampleDataCreating = false;
    if (exampleDataButton) {
      exampleDataButton.disabled = false;
    }
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
    delete state.relationshipEditing[objectKey(type, id)];
    await reloadObjectData();
  } catch (error) {
    handleObjectSaveError(item, error);
  }
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
  if (field.kind === 'reference-list') {
    const fixedValues = Array.from(input.querySelectorAll('[data-fixed-reference-value]'))
      .map((item) => item.dataset.fixedReferenceValue || '')
      .filter(Boolean);
    if (fixedValues.length || input.querySelector('[data-group-type-add]')) {
      return fixedValues;
    }

    return Array.from(input.querySelectorAll('[data-reference-input]'))
      .map((control) => normalizeReferenceValue(control.value, control.dataset.referenceCollection || '', control.dataset.referenceValue || ''))
      .filter(Boolean);
  }

  if (field.kind === 'group-phase') {
    const value = readGroupPhase(input);
    return groupPhaseHasValue(value) ? value : null;
  }

  if (field.kind === 'group-phase-list') {
    return readComplexList(input, readGroupPhase, groupPhaseHasValue);
  }

  if (field.kind === 'membership-list') {
    return readComplexList(input, readMembership, membershipHasValue);
  }

  if (field.kind === 'activity-list') {
    return readComplexList(input, readActivity, activityHasValue);
  }

  if (field.kind === 'source-display') {
    const value = input.querySelector('.source-display-text')?.textContent?.trim() || '';
    return value === '-' ? '' : value;
  }

  const raw = input.value;
  if (field.kind === 'json') {
    const trimmed = raw.trim();
    if (trimmed === '') {
      return defaultFieldValue(field);
    }

    try {
      return JSON.parse(trimmed);
    } catch (_error) {
      throw new Error(`${field.label} muss gültiges JSON sein.`);
    }
  }

  if (field.kind === 'date') {
    return readDateValue(readDateControlRaw(input));
  }

  if (field.kind === 'reference') {
    return normalizeReferenceValue(raw, input.dataset.referenceCollection || '', input.dataset.referenceValue || '');
  }

  if (field.kind === 'boolean') {
    return input.checked;
  }

  return raw;
}

function readComplexList(root, reader, hasValue) {
  return Array.from(root.querySelectorAll(':scope [data-list-item]'))
    .map((item) => reader(item))
    .filter(hasValue);
}

function readGroupPhase(root) {
  return {
    groupType: nestedValue(root, 'groupType'),
    period: readPeriod(root.querySelector('[data-period-editor]')),
  };
}

function readMembership(root) {
  return {
    group: nestedValue(root, 'group'),
    period: readPeriod(root.querySelector('[data-period-editor]')),
    _certainty: nestedValue(root, '_certainty') || 'none',
    _sources: nestedValue(root, '_sources'),
  };
}

function readActivity(root) {
  return {
    role: nestedValue(root, 'role'),
    group: nestedValue(root, 'group'),
    period: readPeriod(root.querySelector('[data-period-editor]')),
    _certainty: nestedValue(root, '_certainty') || 'none',
    _sources: nestedValue(root, '_sources'),
  };
}

function readPeriod(root) {
  if (!root) {
    return emptyPeriod();
  }

  const startBoundary = root.querySelector('[data-period-boundary="startTimepoint"]');
  const endBoundary = root.querySelector('[data-period-boundary="endTimepoint"]');

  return {
    startTimepoint: boundaryTimepointValue(startBoundary, 'startTimepoint'),
    customStart: boundaryDateValue(startBoundary, 'customStart'),
    endTimepoint: boundaryTimepointValue(endBoundary, 'endTimepoint'),
    customEnd: boundaryDateValue(endBoundary, 'customEnd'),
  };
}

function boundaryTimepointValue(boundary, field) {
  if (boundary?.dataset.periodMode === 'custom') {
    return '';
  }

  return nestedValue(boundary, field);
}

function boundaryDateValue(boundary, field) {
  if (boundary?.dataset.periodMode !== 'custom') {
    return null;
  }

  return readDateValue(nestedValue(boundary, field));
}

function nestedValue(root, field) {
  const input = root?.querySelector(`[data-nested-field="${cssEscape(field)}"]`);
  if (!input) {
    return '';
  }

  if (input.matches('[data-reference-input]')) {
    return normalizeReferenceValue(input.value, input.dataset.referenceCollection || '', input.dataset.referenceValue || '');
  }

  if (input.matches('[data-date-control]')) {
    return readDateControlRaw(input);
  }

  if (input.matches('.source-display-text')) {
    return input.textContent.trim() === '-' ? '' : input.textContent.trim();
  }

  return input.value.trim();
}

function readDateValue(value) {
  const raw = normalizeDateRaw(value);
  return raw ? { rawValue: raw } : null;
}

function emptyPeriod() {
  return {
    startTimepoint: '',
    customStart: null,
    endTimepoint: '',
    customEnd: null,
  };
}

function periodHasValue(period) {
  return Boolean(period?.startTimepoint || period?.endTimepoint || period?.customStart || period?.customEnd);
}

function groupPhaseHasValue(value) {
  return Boolean(value?.groupType || periodHasValue(value?.period));
}

function membershipHasValue(value) {
  return Boolean(value?.group || periodHasValue(value?.period) || datapointFieldsHaveValue(value));
}

function activityHasValue(value) {
  return Boolean(value?.role || value?.group || periodHasValue(value?.period) || datapointFieldsHaveValue(value));
}

function datapointFieldsHaveValue(value) {
  return Boolean((value?._sources || '').trim() || (value?._certainty && value._certainty !== 'none'));
}

function visibleFields(type) {
  const fields = objectConfigs[type]?.fields || [];
  return fields.filter((field) => {
    if (field.visibility === 'private' && !state.status?.auth?.user) {
      return false;
    }

    return field.visibility !== 'protected' || hasPermission('sensitive');
  });
}

function defaultFieldValue(field) {
  if (Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
    return structuredCloneSafe(field.defaultValue);
  }

  if (field.kind === 'json') {
    return null;
  }

  if (field.kind === 'reference-list' || field.kind === 'group-phase-list' || field.kind === 'membership-list' || field.kind === 'activity-list') {
    return [];
  }

  if (field.kind === 'group-phase') {
    return null;
  }

  if (field.kind === 'date') {
    return null;
  }

  if (field.kind === 'boolean') {
    return false;
  }

  if (field.kind === 'certainty') {
    return 'none';
  }

  return '';
}

function inputValue(value, field) {
  const actual = value === undefined ? defaultFieldValue(field) : value;
  if (field.kind === 'json') {
    return actual === null || actual === undefined ? '' : JSON.stringify(actual, null, 2);
  }

  if (field.kind === 'date') {
    return dateInputValue(actual);
  }

  if (field.kind === 'reference-list' || field.kind === 'group-phase-list' || field.kind === 'membership-list' || field.kind === 'activity-list') {
    return Array.isArray(actual) ? actual : [];
  }

  return actual === null || actual === undefined ? '' : String(actual);
}

function dateInputValue(value) {
  return dateRawString(value);
}

function dateRawString(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return normalizeDateRaw(value);
  }

  if (typeof value === 'object') {
    return normalizeDateRaw(value.rawValue || value.value || value.display || '');
  }

  return '';
}

function normalizeDateRaw(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return raw;
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function datePartsFromRaw(raw) {
  const value = String(raw || '').trim();
  let match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,4})$/);
  if (match) {
    return {
      year: match[3].padStart(4, '0'),
      month: match[2].padStart(2, '0'),
      day: match[1].padStart(2, '0'),
    };
  }

  match = value.match(/^(\d{1,2})\.(\d{1,4})$/);
  if (match) {
    return {
      year: match[2].padStart(4, '0'),
      month: match[1].padStart(2, '0'),
      day: '00',
    };
  }

  match = value.match(/^(\d{1,4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
  if (!match) {
    return null;
  }

  const year = match[1].padStart(4, '0');
  const month = match[2] === undefined ? '00' : match[2].padStart(2, '0');
  const day = match[3] === undefined ? '00' : match[3].padStart(2, '0');
  return { year, month, day };
}

function dateDetailFromRaw(raw) {
  const parts = datePartsFromRaw(raw);
  if (!parts || parts.month === '00') {
    return 'year';
  }

  return parts.day === '00' ? 'month' : 'day';
}

function dateVisibleValueForDetail(raw, detail) {
  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return '';
  }

  if (detail === 'day') {
    return parts.year === '0000' ? '' : `${parts.day}.${parts.month}.${parts.year}`;
  }

  if (detail === 'month') {
    return parts.year === '0000' ? '' : `${parts.month}.${parts.year}`;
  }

  return parts.year === '0000' ? '' : parts.year;
}

function dateRawForDetail(raw, detail) {
  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return '';
  }

  if (detail === 'day') {
    return parts.month === '00' || parts.day === '00' ? '' : `${parts.year}-${parts.month}-${parts.day}`;
  }

  if (detail === 'month') {
    return parts.month === '00' ? `${parts.year}-00-00` : `${parts.year}-${parts.month}-00`;
  }

  return parts.year === '0000' ? '' : `${parts.year}-00-00`;
}

function dateRawFromVisibleValue(value, detail) {
  const visible = String(value || '').trim();
  if (!visible) {
    return '';
  }

  const parts = datePartsFromRaw(visible);
  if (!parts) {
    return '';
  }

  if (detail === 'year') {
    return parts.year === '0000' ? '' : `${parts.year}-00-00`;
  }

  if (detail === 'month') {
    return parts.year === '0000' ? '' : `${parts.year}-${parts.month}-00`;
  }

  return parts.year === '0000' ? '' : `${parts.year}-${parts.month}-${parts.day}`;
}

function readDateControlRaw(input) {
  if (!input) {
    return '';
  }

  const detail = input.dataset.dateDetail || dateDetailFromRaw(input.dataset.dateRaw || input.value);
  const visibleRaw = dateRawFromVisibleValue(input.value, detail);
  if (visibleRaw || input.value.trim() === '') {
    return visibleRaw;
  }

  return input.dataset.dateRaw || normalizeDateRaw(input.value);
}

function syncDateControlRaw(input) {
  if (!input) {
    return;
  }

  const raw = dateRawFromVisibleValue(input.value, input.dataset.dateDetail || 'year');
  if (raw || input.value.trim() === '') {
    input.dataset.dateRaw = raw;
  }
  input.dataset.dateConfirm = '';
  input.dataset.datePreview = '';
  updateDateDetailButtons(input);
}

function dateDetailButtonAria(detail, isConfirming) {
  if (isConfirming) {
    return 'Auf Jahr umstellen und Monat sowie Tag auf 00 setzen';
  }

  if (detail === 'month') {
    return 'Datumsgenauigkeit Monat, zur Tagesauswahl wechseln';
  }

  if (detail === 'day') {
    return 'Datumsgenauigkeit Tag, Jahresauswahl bestätigen';
  }

  return 'Datumsgenauigkeit Jahr, zur Monatsauswahl wechseln';
}

function datePlaceholderForDetail(detail) {
  if (detail === 'day') {
    return 'TT.MM.JJJJ';
  }

  if (detail === 'month') {
    return 'MM.JJJJ';
  }

  return 'JJJJ';
}

function dateDetailActionsHtml(detail, confirmTarget) {
  return dateDetailScale().map((target) => {
    const isConfirming = confirmTarget === target;
    const isIncluded = dateDetailRank(target) <= dateDetailRank(detail);
    const isAppliedIncluded = isIncluded;
    const isCurrent = target === detail;
    const isApplied = target === detail;
    const isDisabled = isApplied && !confirmTarget;
    const isPreviewAdded = false;
    const isPreviewRemoved = false;
    const label = dateDetailActionLabel(detail, target, isConfirming);
    const aria = dateDetailActionAria(detail, target, isConfirming);
    const classes = [
      'date-detail-button',
      isIncluded ? 'is-included' : '',
      isCurrent ? 'is-current' : '',
      isApplied ? 'is-applied' : '',
      isAppliedIncluded ? 'is-applied-included' : '',
      isDisabled ? 'is-disabled' : '',
      isPreviewAdded ? 'is-preview-added' : '',
      isPreviewRemoved ? 'is-preview-removed' : '',
      isConfirming ? 'is-confirming' : '',
    ].filter(Boolean).join(' ');
    return `<button class="${escapeAttribute(classes)}" type="button" data-date-detail-action data-date-detail-target="${escapeAttribute(target)}" ${isDisabled ? 'disabled' : ''} aria-pressed="${isIncluded ? 'true' : 'false'}" aria-label="${escapeAttribute(aria)}" title="${escapeAttribute(aria)}">${escapeHtml(label)}</button>`;
  }).join('');
}

function dateDetailScale() {
  return ['day', 'month', 'year'];
}

function dateDetailRank(detail) {
  return { year: 0, month: 1, day: 2 }[detail] ?? 0;
}

function dateDetailReductionRemovesValue(raw, targetDetail) {
  const parts = datePartsFromRaw(raw);
  if (!parts) {
    return false;
  }

  if (targetDetail === 'year') {
    return parts.month !== '00' || parts.day !== '00';
  }

  if (targetDetail === 'month') {
    return parts.day !== '00';
  }

  return false;
}

function dateDetailActionLabel(detail, target, isConfirming) {
  const targetLabel = { year: 'J', month: 'M', day: 'T' }[target] || target;
  if (isConfirming) {
    return `${targetLabel}?`;
  }

  return targetLabel;
}

function dateDetailActionAria(detail, target, isConfirming) {
  const targetLabel = { year: 'Jahr', month: 'Monat', day: 'Tag' }[target] || target;
  if (isConfirming) {
    return `Auf ${targetLabel} umstellen und detailliertere Datumsteile auf 00 setzen`;
  }

  if (dateDetailRank(target) < dateDetailRank(detail)) {
    return `Datumsgenauigkeit ${targetLabel} bestaetigen`;
  }

  return `Datumsgenauigkeit ${targetLabel} auswaehlen`;
}

function referenceInputValue(value, collection, showIds = true) {
  if (!value) {
    return '';
  }

  const object = findReferenceObject(collection, value);
  if (!object) {
    return value;
  }

  return showIds ? referenceDisplayValue(object, collection) : objectLabel(object, collection);
}

function referenceDisplayValue(object, collection, fullId = false) {
  const label = objectLabel(object, collection);
  const id = objectId(object);
  const displayId = fullId ? id : shortObjectId(id);
  if (!id) {
    return label || fallbackObjectTitle(collection, id);
  }
  if (label && label !== id && displayId && !label.includes(displayId)) {
    return `${label} (${displayId})`;
  }

  return label || fallbackObjectTitle(collection, id);
}

function normalizeReferenceValue(value, collection = '', previousValue = '') {
  const trimmed = String(value || '').trim();
  if (trimmed === pickerActionShowAllGroups || trimmed === pickerActionShowAllRoles) {
    return '';
  }

  if (!trimmed) {
    return '';
  }

  const match = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (match) {
    return match[0];
  }

  const objects = state.objects[collection] || [];
  if (previousValue) {
    const previous = findReferenceObject(collection, previousValue);
    if (previous && (
      trimmed === objectLabel(previous, collection)
      || trimmed === referenceDisplayValue(previous, collection)
      || trimmed === referenceDisplayValue(previous, collection, true)
    )) {
      return objectId(previous);
    }
  }

  const labelMatches = objects.filter((object) => objectLabel(object, collection) === trimmed);
  if (labelMatches.length === 1) {
    return objectId(labelMatches[0]);
  }

  const displayMatch = objects.find((object) => referenceDisplayValue(object, collection) === trimmed || referenceDisplayValue(object, collection, true) === trimmed);
  return displayMatch ? objectId(displayMatch) : trimmed;
}

function findReferenceObject(collection, id) {
  if (!collection || !id) {
    return null;
  }

  return (state.objects[collection] || []).find((object) => objectId(object) === id) || null;
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
  refreshReferencePickers(document);
}

function updateObjectChrome(item, type, object) {
  const title = item.querySelector('[data-object-title]');
  const meta = item.querySelector('[data-object-meta]');
  const tags = item.querySelector('[data-object-tags]');
  const status = item.querySelector('[data-object-status]');
  const modified = item.querySelector('[data-object-modified]');
  const validation = item.querySelector('[data-object-validation]');
  const validationList = item.querySelector('[data-object-validation-list]');
  const warnings = objectValidationWarnings(type, object);
  if (title) {
    title.textContent = objectListTitle(type, object);
  }
  if (meta) {
    const text = objectListMeta(type, object);
    meta.textContent = text;
    meta.hidden = text === '';
  }
  if (tags) {
    const html = objectPropertyTagsHtml(objectPropertyTags(type, object));
    tags.innerHTML = html;
    tags.hidden = html === '';
  }
  if (modified) {
    const text = objectMeta(object);
    modified.innerHTML = objectModifiedHtml(object);
    modified.hidden = text === '';
  }
  if (validation) {
    validation.innerHTML = validationMetaHtml(warnings);
    validation.hidden = item.classList.contains('is-editing') || warnings.length === 0;
  }
  if (validationList) {
    validationList.innerHTML = validationListHtml(warnings);
    validationList.hidden = !item.classList.contains('is-editing') || warnings.length === 0;
  }
  if (status) {
    status.hidden = objectMeta(object) === '' && warnings.length === 0;
  }
  updateCompositeRowSummaries(item, type, object);
}

function updateCompositeRowSummaries(item, type, object) {
  visibleFields(type).forEach((field) => {
    if (field.kind === 'group-phase') {
      const fieldRoot = item.querySelector(`[data-object-field="${cssEscape(field.name)}"]`);
      const row = fieldRoot?.querySelector(':scope [data-list-item]');
      const value = object[field.name] || {};
      const hasValue = complexItemHasValue(field.kind, value);
      const summary = hasValue ? complexItemSummary(field.kind, value) : emptyComplexItemSummary(field.kind);
      const warnings = complexItemValidationWarnings(field.kind, value, { ownerType: type, ownerObject: object, listField: field.name, disableRemove: true });
      const button = row?.querySelector(':scope > .composite-summary');
      if (button) {
        button.innerHTML = compositeSummaryHtml(summary, warnings);
        button.setAttribute('aria-expanded', row.classList.contains('is-collapsed') ? 'false' : 'true');
      }
      if (row) {
        row.classList.toggle('has-summary', Boolean(summary));
        row.dataset.listCollapsible = '1';
      }
      return;
    }

    if (!['group-phase-list', 'membership-list', 'activity-list'].includes(field.kind)) {
      return;
    }

    const fieldRoot = item.querySelector(`[data-object-field="${cssEscape(field.name)}"]`);
    if (!fieldRoot) {
      return;
    }

    const values = Array.isArray(object[field.name]) ? object[field.name] : [];
    fieldRoot.dataset.listSavedCount = String(values.length);
    fieldRoot.querySelectorAll(':scope [data-list-item]').forEach((row, index) => {
      const value = values[index] || {};
      const hasValue = complexItemHasValue(field.kind, value);
      const summary = hasValue ? complexItemSummary(field.kind, value) : emptyComplexItemSummary(field.kind);
      const warnings = complexItemValidationWarnings(field.kind, value, { ownerType: type, ownerObject: object, listField: field.name, listIndex: index });
      let button = row.querySelector(':scope > .composite-summary');

      if (summary && !button) {
        button = document.createElement('button');
        button.className = 'composite-summary';
        button.type = 'button';
        button.dataset.listAction = 'toggle';
        row.insertBefore(button, row.firstElementChild);
      }

      if (button) {
        if (summary) {
          button.innerHTML = compositeSummaryHtml(summary, warnings);
          button.setAttribute('aria-expanded', row.classList.contains('is-collapsed') ? 'false' : 'true');
        } else {
          button.remove();
        }
      }

      row.classList.toggle('has-summary', Boolean(summary));
      row.dataset.listCollapsible = hasValue || row.dataset.relationshipRowKey ? '1' : '0';
      const removeButton = row.querySelector(':scope > .composite-editor [data-list-action="remove"]');
      if (summary && removeButton && !removeButton.classList.contains('icon-button')) {
        removeButton.textContent = `${summary} löschen`;
      }
    });
  });
}

function handleObjectSaveError(item, error) {
  if (error.status === 409 && error.payload?.current) {
    updateObjectInState(item.dataset.objectType, error.payload.current);
    setObjectSaveState(item, 'Konflikt: Bitte vor der nächsten Bearbeitung neu laden.', true);
    return;
  }

  setObjectSaveState(item, localizeErrorMessage(error.message || 'Objekt konnte nicht aktualisiert werden.'), true);
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

function setExampleDataState(text, isError, autoHide = false) {
  if (!exampleDataState) {
    return;
  }

  exampleDataState.hidden = false;
  exampleDataState.textContent = text;
  exampleDataState.className = `object-save-state ${isError ? 'is-error' : ''}`;
  if (autoHide) {
    window.setTimeout(() => {
      if (exampleDataState.textContent === text) {
        exampleDataState.hidden = true;
      }
    }, 2200);
  }
}

function normalizeExampleDataLabel(label) {
  return String(label || '').trim().toLocaleLowerCase('de-DE');
}

function clearCreateState(form) {
  const element = form.querySelector('[data-create-state]');
  if (element) {
    element.hidden = true;
    element.textContent = '';
  }
}

function objectMeta(object) {
  return objectModifiedMeta(object);
}

function objectModifiedMeta(object) {
  return [object._modifiedBy, object._modified ? modifiedDateLine(object._modified) : ''].filter(Boolean).join(' · ');
}

function objectModifiedHtml(object) {
  const date = object._modified ? modifiedDateLine(object._modified) : '';
  const user = object._modifiedBy || '';
  if (!date && !user) {
    return '';
  }

  return [
    user ? `<span class="object-modified-user">${escapeHtml(user)}</span>` : '',
    user && date ? '<span class="object-modified-separator" aria-hidden="true">·</span>' : '',
    date ? `<span class="object-modified-date">${escapeHtml(date)}</span>` : '',
  ].filter(Boolean).join('');
}

function validationMetaHtml(warnings) {
  const list = [...new Set(warnings)].filter(Boolean);
  if (!list.length) {
    return '';
  }

  return [
    `<span class="validation-meta-text" title="${escapeAttribute(list.join(' | '))}">${escapeHtml(list[0])}</span>`,
    `<span class="validation-meta-count" title="${escapeAttribute(list.join(' | '))}">${escapeHtml(validationCountLabel(list.length))}</span>`,
  ].filter(Boolean).join('');
}

function validationListHtml(warnings) {
  return [...new Set(warnings)]
    .filter(Boolean)
    .map((warning) => `<li>${escapeHtml(warning)}</li>`)
    .join('');
}

function validationCountLabel(count) {
  return `${count} ${count === 1 ? 'Problem' : 'Probleme'}`;
}

function modifiedDateLine(value) {
  return [
    relativeModifiedDisplay(value),
    modifiedDateDisplay(value),
  ].filter(Boolean).join(' · ');
}

function relativeModifiedDisplay(value) {
  const date = modifiedDateValue(value);
  if (!date) {
    return '';
  }

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;
  let valueLabel = 'jetzt';

  if (diffMs >= year) {
    valueLabel = `${Math.floor(diffMs / year)}y`;
  } else if (diffMs >= month) {
    valueLabel = `${Math.floor(diffMs / month)}mo`;
  } else if (diffMs >= day) {
    valueLabel = `${Math.floor(diffMs / day)}d`;
  } else if (diffMs >= hour) {
    valueLabel = `${Math.floor(diffMs / hour)}h`;
  } else if (diffMs >= minute) {
    valueLabel = `${Math.floor(diffMs / minute)}m`;
  }

  return valueLabel;
}

function modifiedDateValue(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }

  const time = Date.parse(raw);
  return Number.isNaN(time) ? null : new Date(time);
}

function modifiedDateDisplay(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) {
    return raw;
  }

  const date = `${match[3]}.${match[2]}.${match[1]}`;
  return match[4] && match[5] ? `${date} ${match[4]}:${match[5]}` : date;
}

function fallbackObjectTitle(type, id = '') {
  const base = objectTypeLabels[type] || 'Datensatz';
  const shortId = shortObjectId(id);
  return shortId ? `${base} ${shortId}` : base;
}

function personDisplayName(person, fallbackId = '') {
  const forename = String(person?.forename || '').trim();
  const lastname = String(person?.lastname || '').trim();
  const scoutname = String(person?.scoutname || '').trim();
  const civilName = [forename, lastname].filter(Boolean).join(' ');

  if (scoutname && civilName) {
    return [forename, `"${scoutname}"`, lastname].filter(Boolean).join(' ');
  }

  return scoutname || civilName || fallbackObjectTitle('people', fallbackId);
}

function objectListTitle(type, object) {
  const id = objectId(object);
  if (type === 'people') {
    return personDisplayName(object, id);
  }

  if (type === 'groups') {
    const groupType = groupTypeLabel(object, state.groupTypes || []) || 'Gruppe';
    const name = object.name || object.label || object.description;
    return name ? [groupType, name].filter(Boolean).join(' ') : fallbackObjectTitle(type, id);
  }

  return objectLabel(object, type);
}

function objectPropertyTags(type, object) {
  if (type === 'people') {
    const roleIds = uniqueStrings((Array.isArray(object.activities) ? object.activities : [])
      .map((activity) => activityRoleId(activity))
      .filter(Boolean));
    return roleIds
      .map((id) => referenceLabelForSubtitle('roles', id, 'Rolle'))
      .filter(Boolean);
  }

  if (type === 'groups') {
    return groupTypeIds(object)
      .map((id) => referenceLabelForSubtitle('group-types', id, 'Gruppenart'))
      .filter(Boolean);
  }

  if (type === 'roles') {
    return roleGroupTypeLabels(object);
  }

  return [];
}

function objectPropertyTagsHtml(tags) {
  return uniqueStrings(tags).map((tag) => `<span class="object-property-tag">${escapeHtml(tag)}</span>`).join('');
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    const text = String(value || '').trim();
    const key = text.toLocaleLowerCase('de-DE');
    if (!text || seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(text);
  });
  return result;
}

function objectListMeta(type, object) {
  if (type === 'groups') {
    const period = object.mainPhase && typeof object.mainPhase === 'object' ? object.mainPhase.period : null;
    return periodYearLabel(period) || 'offener Zeitraum';
  }

  if (type === 'timepoints') {
    return timepointValue(object);
  }

  if (type === 'roles') {
    return '';
  }

  if (type === 'people') {
    return personSubtitle(object);
  }

  return '';
}

function personSubtitle(person) {
  const parts = [];
  const relationshipSpan = personRelationshipSpan(person);
  if (relationshipSpan) {
    parts.push(relationshipSpan);
  }

  if (person.birthdate) {
    const age = ageDisplayValue(person.birthdate);
    if (age) {
      parts.push(age);
    }
  }


  return parts.join(' · ');
}

function referenceLabelForSubtitle(collection, id, fallbackLabel) {
  if (!id) {
    return '';
  }

  const object = findReferenceObject(collection, id);
  return object ? objectLabel(object, collection) : `${fallbackLabel} ${shortObjectId(id)}`;
}

function ageDisplayValue(value) {
  const parts = datePartsFromRaw(dateRawString(value));
  if (!parts || parts.year === '0000') {
    return '';
  }

  const today = new Date();
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  let age = today.getFullYear() - year;

  if (month > 0) {
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const birthdayPassed = day > 0
      ? currentMonth > month || (currentMonth === month && currentDay >= day)
      : currentMonth >= month;
    if (!birthdayPassed) {
      age -= 1;
    }
  }

  return `${age} J`;
}

function personRelationshipSpan(person) {
  const periods = [
    ...(Array.isArray(person.memberships) ? person.memberships : []),
    ...(Array.isArray(person.activities) ? person.activities : []),
  ].map((entry) => entry?.period)
    .filter((period) => period && typeof period === 'object' && periodHasValue(period));

  if (!periods.length) {
    return '';
  }

  const starts = periods.map(periodStartYear).filter(Boolean);
  const ends = periods.map(periodEndYear).filter(Boolean);
  const start = starts.length ? Math.min(...starts) : 0;
  const end = ends.length === periods.length && ends.length ? Math.max(...ends) : 0;

  if (start && end) {
    return start === end ? String(start) : `${start}-${end}`;
  }

  if (start) {
    return `seit ${start}`;
  }

  return end ? `bis ${end}` : '';
}

function objectSummary(type, object) {
  return object.description || '';
}

function objectValidationWarnings(type, object) {
  const warnings = [];

  if (type === 'people') {
    collectPersonWarnings(warnings, object);
  }

  if (type === 'groups') {
    collectGroupWarnings(warnings, object);
  }

  if (type === 'group-types') {
    collectGroupTypeWarnings(warnings, object);
  }

  if (type === 'roles') {
    collectRoleWarnings(warnings, object);
  }

  if (type === 'timepoints') {
    collectTimepointWarnings(warnings, object);
  }

  return [...new Set(warnings)];
}

function collectPersonWarnings(warnings, person) {
  if (!hasTrimmedText(person?.forename) || !hasTrimmedText(person?.lastname)) {
    warnings.push('Vorname oder Nachname fehlt.');
  }
  collectDateFieldWarning(warnings, person?.birthdate, 'Geburtsdatum');

  const memberships = Array.isArray(person?.memberships) ? person.memberships : [];
  const activities = Array.isArray(person?.activities) ? person.activities : [];
  if (!memberships.length && !activities.length) {
    warnings.push('Keine Mitgliedschaft oder Aktivität.');
  }

  const birthYear = birthYearFromDateValue(person?.birthdate);
  memberships.forEach((membership) => {
    collectMembershipWarnings(warnings, membership, birthYear, membershipValidationLabel(membership));
  });

  activities.forEach((activity) => {
    collectActivityWarnings(warnings, activity, birthYear, activityValidationLabel(activity));
  });
}

function collectGroupWarnings(warnings, group) {
  if (!hasTrimmedText(group?.name)) {
    warnings.push('Name fehlt.');
  }

  if (!groupPhaseHasValue(group?.mainPhase)) {
    warnings.push('Hauptphase fehlt.');
  } else {
    collectGroupPhaseWarnings(warnings, group.mainPhase, 'Hauptphase', true);
  }

  (Array.isArray(group?.additionalPhases) ? group.additionalPhases : []).forEach((phase) => {
    collectGroupPhaseWarnings(warnings, phase, groupPhaseValidationLabel(phase), true);
  });
}

function collectGroupTypeWarnings(warnings, groupType) {
  if (!hasTrimmedText(groupType?.label)) {
    warnings.push('Name fehlt.');
  }
  collectDuplicateLabelWarning(warnings, 'group-types', groupType, groupType?.label);
}

function collectRoleWarnings(warnings, role) {
  if (!hasTrimmedText(role?.label)) {
    warnings.push('Name fehlt.');
  }
  collectDuplicateLabelWarning(warnings, 'roles', role, role?.label);
  collectReferenceListWarnings(warnings, 'group-types', role?.groupTypes, '', 'Gruppenart nicht gefunden.');
}

function collectTimepointWarnings(warnings, timepoint) {
  if (!hasTrimmedText(timepoint?.name)) {
    warnings.push('Name fehlt.');
  }
  collectDateFieldWarning(warnings, timepoint?.date, 'Datum', true);
  collectDuplicateTimepointWarning(warnings, timepoint);
}

function membershipValidationLabel(membership) {
  const group = findReferenceObject('groups', membership?.group);
  const name = group ? objectListTitle('groups', group) : '';
  return name ? `Mitgliedschaft ${name}` : 'Mitgliedschaft';
}

function activityValidationLabel(activity) {
  const role = findReferenceObject('roles', activityRoleId(activity));
  const name = role ? String(role.label || role.name || role.description || '').trim() : '';
  return name ? `Aktivität ${name}` : 'Aktivität';
}

function groupPhaseValidationLabel(phase) {
  const groupType = findReferenceObject('group-types', groupPhaseTypeId(phase));
  const name = groupType ? objectLabel(groupType, 'group-types') : '';
  return name ? `Phase ${name}` : 'Phase';
}

function collectMembershipWarnings(warnings, membership, birthYear, label) {
  const groupId = periodEntryGroupId(membership);
  if (!groupId) {
    warnings.push(labeledWarning(label, 'Gruppe fehlt.'));
  } else {
    collectReferenceWarning(warnings, 'groups', groupId, label, 'Gruppe nicht gefunden.');
  }

  if (!periodHasValue(membership?.period)) {
    warnings.push(labeledWarning(label, 'Zeitraum fehlt.'));
  }

  collectPeriodWarnings(warnings, membership?.period, label);
  collectBirthPeriodWarning(warnings, birthYear, membership?.period, label);
  collectGroupPeriodWarning(warnings, groupId, membership?.period, label);
}

function collectActivityWarnings(warnings, activity, birthYear, label) {
  const groupId = periodEntryGroupId(activity);
  const roleId = activityRoleId(activity);
  if (!groupId) {
    warnings.push(labeledWarning(label, 'Gruppe fehlt.'));
  } else {
    collectReferenceWarning(warnings, 'groups', groupId, label, 'Gruppe nicht gefunden.');
  }

  if (!roleId) {
    warnings.push(labeledWarning(label, 'Rolle fehlt.'));
  } else {
    collectReferenceWarning(warnings, 'roles', roleId, label, 'Rolle nicht gefunden.');
  }

  if (!periodHasValue(activity?.period)) {
    warnings.push(labeledWarning(label, 'Zeitraum fehlt.'));
  }

  collectPeriodWarnings(warnings, activity?.period, label);
  collectBirthPeriodWarning(warnings, birthYear, activity?.period, label);
  collectGroupPeriodWarning(warnings, groupId, activity?.period, label);
  collectActivityRoleWarning(warnings, activity, label);
}

function collectGroupPhaseWarnings(warnings, phase, label, requirePeriod = false) {
  const groupTypeId = groupPhaseTypeId(phase);
  if (!groupTypeId) {
    warnings.push(labeledWarning(label, 'Gruppenart fehlt.'));
  } else {
    collectReferenceWarning(warnings, 'group-types', groupTypeId, label, 'Gruppenart nicht gefunden.');
  }

  if (requirePeriod && !periodHasValue(phase?.period)) {
    warnings.push(labeledWarning(label, 'Zeitraum fehlt.'));
  }

  collectPeriodWarnings(warnings, phase?.period, label);
}

function labeledWarning(label, text) {
  return label ? `${label}: ${text}` : text;
}

function collectPeriodWarnings(warnings, period, label) {
  if (!period || typeof period !== 'object') {
    return;
  }

  collectReferenceWarning(warnings, 'timepoints', period.startTimepoint, label, 'Startzeitpunkt nicht gefunden.');
  collectReferenceWarning(warnings, 'timepoints', period.endTimepoint, label, 'Endzeitpunkt nicht gefunden.');
  collectDateFieldWarning(warnings, period.customStart, 'Startdatum', false, label);
  collectDateFieldWarning(warnings, period.customEnd, 'Enddatum', false, label);

  const start = periodBoundaryValidationSortKey(period.startTimepoint, period.customStart);
  const end = periodBoundaryValidationSortKey(period.endTimepoint, period.customEnd);
  if (start && end && start > end) {
    warnings.push(labeledWarning(label, 'Ende liegt vor Start.'));
  }
}

function collectBirthPeriodWarning(warnings, birthYear, period, label) {
  const start = periodStartYear(period);
  if (birthYear && start && start < birthYear) {
    warnings.push(labeledWarning(label, 'Start liegt vor Geburtsjahr.'));
  }
}

function collectGroupPeriodWarning(warnings, groupId, period, label) {
  const group = findReferenceObject('groups', groupId);
  if (!group || !periodHasValue(period)) {
    return;
  }

  if (!groupCouldOverlapPeriod(group, period)) {
    warnings.push(labeledWarning(label, 'Zeitraum passt nicht zur Gruppenlaufzeit.'));
  }
}

function collectActivityRoleWarning(warnings, activity, label = 'Aktivität') {
  const role = findReferenceObject('roles', activityRoleId(activity));
  const group = findReferenceObject('groups', periodEntryGroupId(activity));
  if (role && group && !roleUsableForGroup(role, group)) {
    warnings.push(labeledWarning(label, 'Rolle passt nicht zur Gruppenart.'));
  }
}

function collectReferenceWarning(warnings, collection, id, label, text) {
  if (id && !findReferenceObject(collection, id)) {
    warnings.push(labeledWarning(label, text));
  }
}

function collectReferenceListWarnings(warnings, collection, ids, label, text) {
  const missing = uniqueStrings(Array.isArray(ids) ? ids : [])
    .filter((id) => id && !findReferenceObject(collection, id));
  if (missing.length) {
    warnings.push(labeledWarning(label, text));
  }
}

function collectDateFieldWarning(warnings, value, fieldLabel, required = false, label = '') {
  const raw = dateRawString(value);
  if (required && !raw) {
    warnings.push(labeledWarning(label, `${fieldLabel} fehlt.`));
    return;
  }

  if (raw && dateValueIsInvalid(value)) {
    warnings.push(labeledWarning(label, `${fieldLabel} ist ungültig.`));
  }
}

function collectDuplicateLabelWarning(warnings, type, object, value) {
  const label = normalizedText(value);
  if (!label) {
    return;
  }

  const id = objectId(object || {});
  const duplicate = (state.objects[type] || []).some((candidate) => (
    objectId(candidate) !== id
    && normalizedText(candidate?.label) === label
  ));
  if (duplicate) {
    warnings.push('Name ist doppelt vergeben.');
  }
}

function collectDuplicateTimepointWarning(warnings, timepoint) {
  const name = normalizedText(timepoint?.name);
  const date = dateRawString(timepoint?.date);
  if (!name || !date || dateValueIsInvalid(timepoint?.date)) {
    return;
  }

  const id = objectId(timepoint || {});
  const duplicate = (state.objects.timepoints || []).some((candidate) => (
    objectId(candidate) !== id
    && normalizedText(candidate?.name) === name
    && dateRawString(candidate?.date) === date
  ));
  if (duplicate) {
    warnings.push('Zeitpunkt ist doppelt angelegt.');
  }
}

function periodBoundaryValidationSortKey(timepointId, customDate) {
  if (timepointId) {
    const timepoint = findReferenceObject('timepoints', timepointId);
    return timepoint && !dateValueIsInvalid(timepoint.date) ? dateSortKey(timepoint.date) : null;
  }

  if (dateValueIsInvalid(customDate)) {
    return null;
  }

  return dateSortKey(customDate);
}

function dateValueIsInvalid(value) {
  const raw = dateRawString(value);
  if (!raw) {
    return false;
  }

  const parts = datePartsFromRaw(raw);
  return !parts || !datePartsAreValid(parts);
}

function datePartsAreValid(parts) {
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  if (!year || month < 0 || month > 12 || day < 0 || day > 31) {
    return false;
  }

  if (month === 0) {
    return day === 0;
  }

  if (day === 0) {
    return true;
  }

  return day <= new Date(year, month, 0).getDate();
}

function hasTrimmedText(value) {
  return String(value || '').trim() !== '';
}

function normalizedText(value) {
  return String(value || '').trim().toLocaleLowerCase('de-DE');
}

function roleGroupTypeLabels(role) {
  return (Array.isArray(role.groupTypes) ? role.groupTypes : [])
    .map((id) => state.groupTypes.find((candidate) => objectId(candidate) === id))
    .filter(Boolean)
    .map((groupType) => objectLabel(groupType, 'group-types'));
}

function groupTypeLabel(group, groupTypes) {
  const phase = group.mainPhase && typeof group.mainPhase === 'object' ? group.mainPhase : null;
  const id = phase?.groupType || phase?.groupTypeId || phase?.group_type_id || '';
  if (!id) {
    return '';
  }

  const groupType = groupTypes.find((candidate) => objectId(candidate) === id);
  return groupType ? objectLabel(groupType, 'group-types') : '';
}

function groupPhases(group) {
  if (!group || typeof group !== 'object') {
    return [];
  }

  return [
    group.mainPhase && typeof group.mainPhase === 'object' ? group.mainPhase : null,
    ...(Array.isArray(group.additionalPhases) ? group.additionalPhases : []),
  ].filter(Boolean);
}

function groupTypeIds(group) {
  return [...new Set(groupPhases(group)
    .map((phase) => phase.groupType || phase.groupTypeId || phase.group_type_id || '')
    .filter(Boolean))];
}

function roleGroupTypeIds(role) {
  return Array.isArray(role?.groupTypes) ? role.groupTypes.filter(Boolean) : [];
}

function roleHasGroupTypeRestrictions(role) {
  return roleGroupTypeIds(role).length > 0;
}

function roleUsableForGroup(role, group) {
  const allowed = roleGroupTypeIds(role);
  if (!allowed.length) {
    return true;
  }

  const types = groupTypeIds(group);
  if (!types.length) {
    return true;
  }

  return types.some((id) => allowed.includes(id));
}

function groupMatchesRole(group, role) {
  return roleUsableForGroup(role, group);
}

function groupEndedBeforeYear(group, year) {
  const phases = groupPhases(group);
  if (!phases.length || !year) {
    return false;
  }

  const endYears = phases.map((phase) => periodEndYear(phase.period)).filter(Boolean);
  if (endYears.length !== phases.length) {
    return false;
  }

  return Math.max(...endYears) < year;
}

function groupCouldOverlapPeriod(group, period) {
  const targetStart = periodStartYear(period);
  const targetEnd = periodEndYear(period);
  if (!targetStart && !targetEnd) {
    return true;
  }

  const phases = groupPhases(group);
  if (!phases.length) {
    return true;
  }

  return phases.some((phase) => periodsCouldOverlap(phase.period, { startYear: targetStart, endYear: targetEnd }));
}

function periodsCouldOverlap(period, target) {
  const phaseStart = periodStartYear(period);
  const phaseEnd = periodEndYear(period);

  if (target.endYear && phaseStart && phaseStart > target.endYear) {
    return false;
  }

  if (target.startYear && phaseEnd && phaseEnd < target.startYear) {
    return false;
  }

  return true;
}

function periodStartYear(period) {
  if (!period || typeof period !== 'object') {
    return 0;
  }

  return periodBoundaryYearFromValue(period.startTimepoint, period.customStart);
}

function periodEndYear(period) {
  if (!period || typeof period !== 'object') {
    return 0;
  }

  return periodBoundaryYearFromValue(period.endTimepoint, period.customEnd);
}

function periodBoundaryYearFromValue(timepointId, customDate) {
  return numericYear(referenceYear('timepoints', timepointId) || dateYear(customDate));
}

function timepointYear(timepoint) {
  return numericYear(dateYear(timepoint?.date));
}

function birthYearFromDateValue(value) {
  return numericYear(dateYear(value));
}

function numericYear(value) {
  const match = String(value || '').match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function personHasGroup(person, groupId) {
  const memberships = Array.isArray(person.memberships) ? person.memberships : [];
  return memberships.some((membership) => {
    const id = membership?.group || membership?.groupId || membership?.group_id || '';
    return id === groupId;
  });
}

function timepointValue(timepoint) {
  return dateDisplayValue(timepoint.date);
}

function hasPendingObjectEdits() {
  return Boolean(document.querySelector('[data-create-form], [data-user-create-form], [data-user-editor], [data-object-editor], [data-period-action="undo-custom-date"], [data-object-type][data-dirty="1"], [data-object-type][data-saving="1"]'));
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

function renderUsersManagement() {
  if (!hasPermission('manage_users')) {
    return;
  }

  renderCreatePanel('users');
  renderCollectionControls();
  renderNavigationCounts();
  renderSetupResult();
  renderUserList();
}

function renderUserList() {
  const users = collectionUsers();
  userList.innerHTML = users.map((user) => renderUserItem(user)).join('')
    || `<div class="empty-state">${state.users.length ? 'Keine Treffer.' : 'Keine Benutzer.'}</div>`;
}

function renderUserItem(user) {
  const username = user.username || '';
  const isEditing = Boolean(state.editing[objectKey('users', username)]);
  const meta = userMeta(user);

  return `
    <article class="list-item user-item is-clickable ${isEditing ? 'is-editing' : ''}" data-username="${escapeAttribute(username)}">
      <div class="object-main">
        <button class="object-title-row" type="button" data-user-action="toggle-editor" aria-expanded="${isEditing ? 'true' : 'false'}">
          <span class="object-title-text">
            <span class="object-title-heading">${escapeHtml(userTitle(user))}</span>
            <small class="object-subtitle">${escapeHtml(meta)}</small>
          </span>
        </button>
        ${isEditing ? renderUserEditor(user) : ''}
      </div>
    </article>
  `;
}

function renderUserEditor(user) {
  return `
    <div class="object-editor user-editor" data-user-editor>
      <label class="object-field">
        <span>Anzeigename</span>
        <input data-display-name value="${escapeAttribute(user.display_name || '')}" placeholder="${escapeAttribute(user.username || '')}">
      </label>
      <fieldset class="object-field users-permissions-field">
        <legend>Berechtigungen</legend>
        ${renderPermissionCheckboxes(user.permissions)}
      </fieldset>
      <div class="user-editor-side">
        ${renderUserSetupTokens(user)}
      </div>
      <div class="object-editor-actions user-actions">
        <button class="button button-secondary" type="button" data-action="save">Speichern</button>
        <button class="button button-secondary" type="button" data-action="setup">Setup-Link</button>
        <button class="button button-secondary" type="button" data-action="toggle">${user.enabled ? 'Deaktivieren' : 'Aktivieren'}</button>
        ${state.status?.auth?.user?.username === user.username ? '' : '<button class="button button-danger" type="button" data-action="delete-user" data-danger-confirm>Löschen</button>'}
      </div>
    </div>
  `;
}

function userMeta(user) {
  return [
    user.username || 'Benutzername offen',
    formatCount(user.credential_count, 'passkey'),
    user.enabled ? 'aktiv' : 'inaktiv',
  ].join(' / ');
}

function renderUserSetupTokens(user) {
  const tokens = (state.setupTokens || []).filter((token) => token.username === user.username);
  if (!tokens.length) {
    return '<div class="setup-token-list"><small>Keine aktiven Setup-Links.</small></div>';
  }

  return `
    <div class="setup-token-list">
      ${tokens.map((token) => `
        <div class="setup-token-row">
          <small>Setup-Link bis ${escapeHtml(formatDateTime(token.expires_at))}</small>
          <button class="button button-danger" type="button" data-action="delete-setup-token" data-token-id="${escapeAttribute(token.id)}" data-danger-confirm data-danger-confirm-label="Löschen?">Löschen</button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPermissionCheckboxes(permissions) {
  const options = [
    ['read', 'Lesen'],
    ['write', 'Schreiben'],
    ['sensitive', 'Sensible Daten'],
    ['manage_users', 'Benutzer verwalten'],
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
  const username = String(state.setupResult.username || '').trim();
  const title = username ? `${username} Setup-Link` : 'Setup-Link';
  setupResult.innerHTML = `
    <h3>${escapeHtml(title)}</h3>
    <div class="qr-code" aria-label="Setup-QR-Code">${qrSvg(setupUrl)}</div>
    <label>
      <span>URL</span>
      <input id="setupUrlResult" readonly value="${escapeAttribute(setupUrl)}">
    </label>
    <div class="form-actions">
      <button class="button button-secondary" type="button" data-copy="#setupUrlResult">URL kopieren</button>
    </div>
    <small>Läuft ab ${escapeHtml(state.setupResult.expires_at || '')}</small>
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

    return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Setup-URL als QR-Code" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#000">${cells.join('')}</g></svg>`;
  } catch (error) {
    console.error(error);
    return '<span>QR-Code nicht verfügbar</span>';
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

  throw new Error('Die Setup-URL ist zu lang für den eingebauten QR-Generator.');
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
    return 'Die Passkey-Aktion wurde abgebrochen.';
  }

  return localizeErrorMessage(error?.message || 'Passkey-Aktion fehlgeschlagen.');
}

function hasPermission(permission) {
  const permissions = state.status?.auth?.user?.permissions || [];
  return permissions.includes(permission);
}

function canAccessObjects() {
  return true;
}

function objectLabel(object, type = '') {
  if (!object || typeof object !== 'object') {
    return '';
  }

  if (type === 'people') {
    return personDisplayName(object, objectId(object));
  }

  if (type === 'roles') {
    return object.label || fallbackObjectTitle(type, objectId(object));
  }

  return object.label || object.name || object.description || object.data?.label || fallbackObjectTitle(type, objectId(object));
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
  authMessage.textContent = localizeErrorMessage(text);
  authMessage.className = `message global-message ${isError ? 'is-error' : 'is-good'}`;
}

function clearAuthMessage() {
  authMessage.hidden = true;
  authMessage.textContent = '';
  authMessage.className = 'message global-message';
}

function formatCount(value = 0, noun) {
  const count = Number(value || 0);
  const forms = countNouns[noun] || [noun, noun];
  return `${count} ${count === 1 ? forms[0] : forms[1]}`;
}

function formatDateTime(value) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) {
    return value || '';
  }

  return new Intl.DateTimeFormat('de', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function localizeErrorMessage(text) {
  const message = String(text || '');
  const exact = {
    'Request failed': 'Anfrage fehlgeschlagen',
    'Login failed.': 'Login fehlgeschlagen.',
    'Authentication required.': 'Login erforderlich.',
    'Invalid CSRF token.': 'Ungültiges CSRF-Token.',
    'Unknown user.': 'Unbekannter Benutzer.',
    'You cannot delete your own user.': 'Der eigene Benutzer kann nicht gelöscht werden.',
    'At least one user manager must remain.': 'Mindestens ein Benutzerverwalter muss bestehen bleiben.',
    'This passkey is already registered.': 'Dieser Passkey ist bereits registriert.',
    'Unknown passkey.': 'Unbekannter Passkey.',
    'Setup token is required.': 'Setup-Token ist erforderlich.',
    'Setup token ID is required': 'Setup-Token-ID ist erforderlich.',
    'Setup token is not valid.': 'Setup-Token ist ungültig.',
    'Challenge expired or was already used.': 'Die Anfrage ist abgelaufen oder wurde bereits verwendet.',
    'Username is already in use.': 'Benutzername wird bereits verwendet.',
    'Unknown permission.': 'Unbekannte Berechtigung.',
    'Unknown object.': 'Unbekanntes Objekt.',
    'Object has been deleted.': 'Objekt wurde gelöscht.',
    'Object has already been deleted.': 'Objekt wurde bereits gelöscht.',
    'Sensitive permission is required for this field.': 'Für dieses Feld ist die Berechtigung für sensible Daten erforderlich.',
    'Unknown collection.': 'Unbekannte Sammlung.',
    'Invalid object ID.': 'Ungültige Objekt-ID.',
    'Unsupported credential type.': 'Nicht unterstützter Anmeldedatentyp.',
    'Invalid attestation object.': 'Ungültiges Attestation-Objekt.',
    'Passkey was created for a different site.': 'Der Passkey wurde für eine andere Website erstellt.',
    'Credential ID mismatch.': 'Die Anmeldedaten-ID stimmt nicht überein.',
    'Passkey mismatch.': 'Passkey stimmt nicht überein.',
    'Passkey was used for a different site.': 'Der Passkey wurde für eine andere Website verwendet.',
    'The PHP OpenSSL extension is required for passkey login.': 'Die PHP-Erweiterung OpenSSL ist für den Passkey-Login erforderlich.',
    'Passkey signature verification failed.': 'Die Passkey-Signaturprüfung ist fehlgeschlagen.',
    'Passkey sign counter did not advance.': 'Der Signaturzähler des Passkeys wurde nicht erhöht.',
    'Missing WebAuthn field.': 'WebAuthn-Feld fehlt.',
    'Missing WebAuthn response.': 'WebAuthn-Antwort fehlt.',
    'Invalid WebAuthn client data.': 'Ungültige WebAuthn-Clientdaten.',
    'WebAuthn client data did not match this request.': 'Die WebAuthn-Clientdaten passen nicht zu dieser Anfrage.',
    'Cross-origin WebAuthn responses are not accepted.': 'Cross-Origin-WebAuthn-Antworten werden nicht akzeptiert.',
    'Authenticator data is too short.': 'Authenticatordaten sind zu kurz.',
    'Attested credential data is missing.': 'Attestierte Anmeldedaten fehlen.',
    'Attested credential data is incomplete.': 'Attestierte Anmeldedaten sind unvollständig.',
    'Credential ID is incomplete.': 'Anmeldedaten-ID ist unvollständig.',
    'Credential public key is missing.': 'Öffentlicher Schlüssel der Anmeldedaten fehlt.',
    'User presence was not verified.': 'Benutzerpräsenz wurde nicht bestätigt.',
    'User verification is required.': 'Benutzerverifizierung ist erforderlich.',
    'Only ES256 passkeys are supported.': 'Es werden nur ES256-Passkeys unterstützt.',
    'Invalid ES256 public key.': 'Ungültiger öffentlicher ES256-Schlüssel.',
  };

  if (exact[message]) {
    return exact[message];
  }

  if (message.startsWith('Request failed:')) {
    return message.replace('Request failed:', 'Anfrage fehlgeschlagen:');
  }

  if (message.startsWith('Username must be 2-64 characters')) {
    return 'Benutzername muss 2 bis 64 Zeichen lang sein und darf nur Buchstaben, Zahlen, Punkt, Bindestrich, Unterstrich oder @ enthalten.';
  }

  return message;
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
