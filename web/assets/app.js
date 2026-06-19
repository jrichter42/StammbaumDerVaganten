import { makeQrMatrix } from './js/qr.js';
import {
  decodeCreationOptions,
  decodeRequestOptions,
  credentialToJson,
} from './js/webauthn.js';
import {
  dateYear,
  dateDisplayValue,
  dateInputValue,
  dateRawString,
  normalizeDateRaw,
  datePartsFromRaw,
  dateDetailFromRaw,
  dateVisibleValueForDetail,
  dateRawForDetail,
  dateRawFromVisibleValue,
  datePlaceholderForDetail,
  dateDetailScale,
  dateDetailRank,
  dateDetailReductionRemovesValue,
} from './js/date-values.js';
import {
  emptyTimeframe,
  timeframeFromSearchParams,
  writeTimeframeSearchParams,
  timeframeLabel,
  timeframeBounds,
  dateValueBounds,
  periodBounds,
  boundsOverlap,
  combineBounds,
  dateKeyToParts,
  dateKeyLabel,
} from './js/timeframe.js';
import {
  publicYearSpan,
  publicGraphShortLabel,
  shortObjectId,
  foldSearchText,
  modifiedDateLine,
  uniqueStrings,
  hasTrimmedText,
  normalizedText,
  formatDateTime,
  escapeHtml,
  escapeAttribute,
} from './js/formatting.js';

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
const visualizationViews = ['tree', 'timeline'];
const contextGraphTypeGroups = {
  data: ['people', 'groups', 'timepoints'],
  structure: ['roles', 'group-types'],
};
const contextNavigationLinkSelector = [
  '.reference-link[data-link-view][data-link-id]',
  '.reverse-link[data-link-view][data-link-id]',
].join(', ');
const contextEdgeTargetSelector = '[data-graph-edge-type][data-graph-edge-id][data-graph-edge-edit]';
const collectionTypes = [...objectCollections, 'users'];
const collectionVisibleStep = 100;
const sortCollator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });
const pickerActionShowAllGroups = '__picker_show_all_groups__';
const pickerActionShowAllRoles = '__picker_show_all_roles__';
const certaintyOptions = [
  ['none', '0 - Keine Angabe'],
  ['no_idea', '1 - Unbekannt / sehr unsicher'],
  ['estimation_bad', '2 - Grobe Schätzung'],
  ['estimation_medium', '3 - Plausible Schätzung'],
  ['estimation_good', '4 - Gute Schätzung'],
  ['confident', '5 - Sicher'],
  ['set_in_stone', '6 - Belegt / gesichert'],
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
      { name: 'parentGroupType', label: 'Übergeordnete Gruppenart', kind: 'reference', collection: 'group-types', picker: 'parent-group-type' },
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
      { name: 'location', label: 'Ort' },
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
  auditLog: [],
  changeLog: [],
  auditFilters: { event: '', username: '' },
  changeLogFilters: { type: '', username: '', action: '', fields: [] },
  setupTokens: [],
  setupResult: null,
  account: null,
  accountOpen: false,
  loginOpen: false,
  contextGraphTypes: Object.fromEntries(objectCollections.map((type) => [type, true])),
  createOpen: {},
  collectionUi: Object.fromEntries(collectionTypes.map((type) => [type, { sort: collectionDefaultSorts[type], sortDirection: collectionDefaultSortDirection(type, collectionDefaultSorts[type]), search: '', filters: {}, sortExplicit: false }])),
  collectionVisibleCounts: Object.fromEntries(collectionTypes.map((type) => [type, collectionVisibleStep])),
  deepLinkTarget: null,
  editing: {},
  initialObjects: new Set(),
  relationshipEditing: {},
  groupRelationEditing: {},
  editTimers: {},
  exampleDataCreating: false,
  publicGraphGroupType: '',
  timeframe: emptyTimeframe(),
  sourceOverride: readStoredSourceOverride(),
};

const connectionStatus = document.querySelector('#connectionStatus');
const currentUserLabel = document.querySelector('#currentUserLabel');
const currentUserName = document.querySelector('#currentUserName');
const accountButton = document.querySelector('#accountButton');
const loginButton = document.querySelector('#loginButton');
const logoutButton = document.querySelector('#logoutButton');
const passkeyLoginButton = document.querySelector('#passkeyLoginButton');
const loginPanel = document.querySelector('#loginPanel');
const loginEmailForm = document.querySelector('#loginEmailForm');
const loginEmailInput = document.querySelector('#loginEmailInput');
const loginEmailState = document.querySelector('#loginEmailState');
const authScreen = document.querySelector('#authScreen');
const publicVisualizationNav = document.querySelector('#publicVisualizationNav');
const workspace = document.querySelector('#workspace');
const accountPage = document.querySelector('#accountPage');
const accountForm = document.querySelector('#accountForm');
const accountUsername = document.querySelector('#accountUsername');
const accountState = document.querySelector('#accountState');
const accountPasskeys = document.querySelector('#accountPasskeys');
const authMessage = document.querySelector('#authMessage');
const globalSearch = document.querySelector('#globalSearch');
const globalSearchInput = document.querySelector('#globalSearchInput');
const globalSearchResults = document.querySelector('#globalSearchResults');
const timeframeControl = document.querySelector('#timeframeControl');
const sourceControl = document.querySelector('#sourceControl');
const sourceInput = document.querySelector('#sourceInput');
const setupForm = document.querySelector('#setupForm');
const setupPanel = document.querySelector('#setupPanel');
const usersNav = document.querySelector('#usersNav');
const auditNav = document.querySelector('#auditNav');
const logNav = document.querySelector('#logNav');
const usersNavGroup = document.querySelector('#usersNavGroup');
const exampleDataButton = document.querySelector('#exampleDataButton');
const exampleDataState = document.querySelector('#exampleDataState');
const userList = document.querySelector('#userList');
const auditList = document.querySelector('#auditList');
const auditControls = document.querySelector('#auditControls');
const changeLogControls = document.querySelector('#changeLogControls');
const changeLogList = document.querySelector('#changeLogList');
const contentArea = document.querySelector('.content-area');
const backToTopButton = document.querySelector('#backToTopButton');
const contextResizer = document.querySelector('#contextResizer');
const contextPanel = document.querySelector('#contextPanel');
const contextGraphContainer = document.querySelector('#contextGraph');
const contextGraphStatus = document.querySelector('#contextGraphStatus');
const contextGraphTypeToggles = Array.from(document.querySelectorAll('[data-context-graph-type-toggle]'));
const contextGraphTypeGroupToggles = Array.from(document.querySelectorAll('[data-context-graph-type-group-toggle]'));
const treeGroupTypeFilters = Array.from(document.querySelectorAll('[data-tree-group-type-filter]'));
const treeGroupTypeClearButtons = Array.from(document.querySelectorAll('[data-tree-group-type-clear]'));
const accessControlWarning = document.querySelector('#accessControlWarning');
let authMessageTimer = 0;
let accessControlCheckAttempted = false;

let incomingSetupToken = '';
let urlLoginToken = '';
let isSetupPage = false;
let isLoginLinkPage = Boolean(urlLoginToken);
let publicNetwork = null;
let publicGraphSignature = '';
let contextNetwork = null;
let contextGraphSignature = '';
let contextGraphFrame = 0;
let contextGraphTimer = 0;
const contextGraphSync = {
  nodeById: new Map(),
  edgeById: new Map(),
  nodeEdgeIds: new Map(),
  targetEdgeIds: new Map(),
  nodeDataSet: null,
  edgeDataSet: null,
  passiveNodeIds: [],
  passiveEdgeIds: [],
  hover: emptyContextGraphHover(),
  listHighlights: [],
};
let contextResizeActive = false;
let contextPanelRatio = 0.4;
let treeGraphFrame = 0;
captureAuthFragment();

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

accountButton?.addEventListener('click', openAccountPage);
loginButton.addEventListener('click', beginLogin);
passkeyLoginButton.addEventListener('click', beginLogin);
loginEmailForm?.addEventListener('submit', requestEmailLoginLink);
logoutButton.addEventListener('click', logout);
globalSearchInput?.addEventListener('input', renderGlobalSearchResults);
sourceInput?.addEventListener('input', handleSourceInput);
sourceInput?.addEventListener('blur', () => updateSourceControl());
timeframeControl?.addEventListener('click', handleTimeframeClick);
timeframeControl?.addEventListener('input', handleTimeframeInput);
timeframeControl?.addEventListener('change', handleTimeframeInput);
timeframeControl?.addEventListener('wheel', handleTimeframeWheel, { passive: false });
timeframeControl?.addEventListener('keydown', handleTimeframeKeydown);
timeframeControl?.addEventListener('focusin', handleTimeframeFocus);
timeframeControl?.addEventListener('focusout', handleTimeframeBlur);
treeGroupTypeFilters.forEach((filter) => filter.addEventListener('change', handlePublicGraphFilterChange));
treeGroupTypeClearButtons.forEach((button) => button.addEventListener('click', clearPublicGraphFilter));
contextGraphTypeToggles.forEach((toggle) => toggle.addEventListener('change', handleContextGraphTypeToggle));
contextGraphTypeGroupToggles.forEach((toggle) => toggle.addEventListener('change', handleContextGraphTypeGroupToggle));
renderContextGraphTypeToggles();
setupForm.addEventListener('submit', beginSetup);
accountForm?.addEventListener('submit', handleAccountSubmit);
accountForm?.addEventListener('input', handleAccountInput);
accountForm?.addEventListener('change', handleAccountInput);
accountForm?.addEventListener('focusout', handleAccountBlur);
accountPage?.addEventListener('click', handleAccountClick);
userList.addEventListener('click', handleUserAction);
userList.addEventListener('click', copySetupValue);
userList.addEventListener('input', handleUserEditorInput);
userList.addEventListener('change', handleUserEditorInput);
userList.addEventListener('focusout', handleUserEditorBlur);
document.addEventListener('click', handleNavigationJump);
document.addEventListener('click', handleChangeLogClick);
document.addEventListener('click', handleAuditControlClick);
document.addEventListener('click', handleChangeLogControlClick);
document.addEventListener('click', handleGlobalSearchClick);
document.addEventListener('click', handleExampleDataClick);
document.addEventListener('click', handleObjectClick);
document.addEventListener('click', handleVisualizationClick);
document.addEventListener('pointermove', handleDateDetailPointerMove);
document.addEventListener('pointerover', handleDateDetailPreview);
document.addEventListener('pointerover', handleObjectGraphHover);
document.addEventListener('pointerout', handleDateDetailPreviewEnd);
document.addEventListener('pointerout', handleObjectGraphHoverEnd);
document.addEventListener('input', handleCollectionControlInput);
document.addEventListener('change', handleAuditControlChange);
document.addEventListener('change', handleChangeLogControlChange);
document.addEventListener('input', handleReferenceFilterInput);
document.addEventListener('input', handleObjectInput);
document.addEventListener('change', handleCollectionControlChange);
document.addEventListener('change', handleReferencePickerChange);
document.addEventListener('change', handleObjectChange);
document.addEventListener('focusout', handleObjectBlur);
document.addEventListener('focusin', handleEditorFocus);
document.addEventListener('input', scheduleContextGraphRenderSoon);
document.addEventListener('change', scheduleContextGraphRenderSoon);
contentArea?.addEventListener('scroll', updateBackToTopButton, { passive: true });
backToTopButton?.addEventListener('click', scrollBackToTop);
contextResizer?.addEventListener('pointerdown', beginContextResize);
window.addEventListener('beforeunload', handleBeforeUnload);
window.addEventListener('pagehide', clearIncomingSetupToken);
window.addEventListener('scroll', updateBackToTopButton, { passive: true });
window.addEventListener('resize', handleContextLayoutResize);
window.addEventListener('resize', updateBackToTopButton);
window.addEventListener('resize', scheduleContextGraphRender);
window.addEventListener('resize', scheduleTreeGraphRender);
window.addEventListener('hashchange', handleAuthFragmentChange);
window.addEventListener('popstate', handleUrlStateChange);

updateBackToTopButton();
initialize();
window.setInterval(pollObjects, 12000);

async function initialize() {
  if (!urlLoginToken) {
    await refresh();
    return;
  }

  state.loginOpen = true;
  clearAuthMessage();
  try {
    await postJson('auth-email-login-verify', { token: normalizeLoginTokenInput(urlLoginToken) });
    urlLoginToken = '';
    state.loginOpen = false;
    state.accountOpen = false;
    isLoginLinkPage = false;
    await refresh();
    showAuthMessage('Login erfolgreich. Du kannst einen Passkey in deinem Benutzerkonto einrichten; die Kontoeinstellungen erreichst du oben rechts neben deinem Namen.', false);
  } catch (error) {
    console.error(error);
    urlLoginToken = '';
    state.loginOpen = true;
    isLoginLinkPage = false;
    await refresh();
    showAuthMessage(localizeErrorMessage(error.message || 'Login-Link ist ungültig.'), true);
  }
}

function updateBackToTopButton() {
  if (!backToTopButton) {
    return;
  }

  if (!workspace || workspace.hidden) {
    backToTopButton.hidden = true;
    return;
  }

  const root = appScrollRoot();
  const scrollTop = root === document.scrollingElement
    ? window.scrollY || root.scrollTop || 0
    : root.scrollTop || 0;
  backToTopButton.hidden = scrollTop <= 80;
}

function scrollBackToTop() {
  const root = appScrollRoot();
  if (root === document.scrollingElement) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  root.scrollTo({ top: 0, behavior: 'smooth' });
}

function beginContextResize(event) {
  if (!workspace || window.getComputedStyle(contextResizer).display === 'none') {
    return;
  }

  event.preventDefault();
  contextResizeActive = true;
  document.body.classList.add('is-context-resizing');
  contextResizer.setPointerCapture?.(event.pointerId);
  resizeContextPanel(event.clientX);
  document.addEventListener('pointermove', handleContextResize);
  document.addEventListener('pointerup', endContextResize, { once: true });
  document.addEventListener('pointercancel', endContextResize, { once: true });
}

function handleContextResize(event) {
  if (!contextResizeActive) {
    return;
  }

  event.preventDefault();
  resizeContextPanel(event.clientX);
}

function endContextResize() {
  contextResizeActive = false;
  document.body.classList.remove('is-context-resizing');
  document.removeEventListener('pointermove', handleContextResize);
  applyContextSplitRatio();
  scheduleContextGraphResize();
}

function resizeContextPanel(clientX) {
  const metrics = contextSplitMetrics();
  if (!metrics) {
    return;
  }

  const leftWidth = Math.max(metrics.minLeft, Math.min(metrics.total - metrics.minRight, clientX - metrics.left));
  contextPanelRatio = Math.max(0, Math.min(1, (metrics.total - leftWidth) / metrics.total));
  applyContextSplitRatio(metrics);
  scheduleContextGraphResize();
}

function handleContextLayoutResize() {
  applyContextSplitRatio();
}

function applyContextSplitRatio(metrics = contextSplitMetrics()) {
  if (!workspace || contextPanelRatio === null || !metrics) {
    return;
  }

  const minRatio = metrics.minRight / metrics.total;
  const maxRatio = 1 - (metrics.minLeft / metrics.total);
  const ratio = Math.max(minRatio, Math.min(maxRatio, contextPanelRatio));
  const width = Math.round(metrics.total * ratio);
  workspace.style.setProperty('--context-panel-width', `${width}px`);
}

function contextSplitMetrics() {
  if (!workspace || !contentArea || !contextPanel || !contextResizer) {
    return null;
  }

  if (workspace.hidden || window.getComputedStyle(contextPanel).display === 'none') {
    return null;
  }

  const contentRect = contentArea.getBoundingClientRect();
  const panelRect = contextPanel.getBoundingClientRect();
  const total = contentRect.width + panelRect.width;
  if (total <= 0) {
    return null;
  }

  const wantedMinLeft = contextContentMinWidth();
  const wantedMinRight = 280;
  const minRight = Math.min(wantedMinRight, total * 0.45);
  const minLeft = Math.min(wantedMinLeft, Math.max(0, total - minRight));
  return {
    left: contentRect.left,
    total,
    minLeft,
    minRight,
  };
}

function contextContentMinWidth() {
  const view = document.querySelector('.view.is-active');
  const hasObjectEditor = Boolean(view?.querySelector('.object-editor-layout.has-side'));
  return hasObjectEditor ? 520 : 300;
}

function scheduleContextGraphResize() {
  window.requestAnimationFrame(() => {
    if (!contextNetwork) {
      return;
    }

    contextNetwork.setSize?.('100%', '100%');
    contextNetwork.redraw();
  });
}

function handleBeforeUnload(event) {
  const form = openCreateForm();
  if (!form || isPristineCreateForm(form)) {
    return;
  }

  event.preventDefault();
  event.returnValue = '';
}

function activateView(viewName, opts = {}) {
  if (state.status?.auth && !state.status.auth.user && !visualizationViews.includes(viewName)) {
    viewName = 'tree';
    opts = {};
  }
  const previousViewName = currentViewName();
  if (viewName !== 'users') {
    clearAdminSetupResult();
  }
  state.accountOpen = false;
  state.loginOpen = false;
  if (workspace) {
    workspace.dataset.activeView = viewName;
  }

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === viewName);
  });

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('is-active', view.id === `view-${viewName}`);
  });

  const { silent, ...urlExtra } = opts;
  if (!silent) {
    writeUrlState({ view: viewName, ...urlExtra });
  }
  if (visualizationViews.includes(viewName)) {
    publicGraphSignature = '';
    renderVisualizations();
  }
  if ((viewName === 'log' || viewName === 'audit') && previousViewName !== viewName) {
    scrollCurrentViewToTop();
  }
  renderContextGraphTypeToggles();
  scheduleContextGraphRender();
}

function captureAuthFragment() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const setup = normalizeSetupInput(fragment.get('setup') || '');
  const login = setup ? '' : normalizeLoginTokenInput(fragment.get('login') || '');
  if (!setup && !login) {
    return false;
  }

  incomingSetupToken = setup;
  urlLoginToken = login;
  isSetupPage = Boolean(setup);
  isLoginLinkPage = Boolean(login);
  setupPanel.hidden = !setup;
  if (!setup) {
    clearIncomingSetupToken();
  }

  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  return true;
}

async function handleAuthFragmentChange() {
  if (!captureAuthFragment()) {
    if (isSetupPage) {
      leaveIncomingSetupFlow();
    }
    return;
  }

  await initialize();
}

function scrollCurrentViewToTop() {
  const scrollRoot = appScrollRoot();
  scrollRoot.scrollTo({ top: 0, left: 0 });
  updateBackToTopButton();
}

function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const id = params.get('id');
  state.timeframe = timeframeFromSearchParams(params);
  state.publicGraphGroupType = params.get('group-type') || params.get('gruppenart') || params.get('groupType') || '';

  if (visualizationViews.includes(view) || view === 'tribe') {
    window.requestAnimationFrame(() => activateView(view === 'tribe' ? 'tree' : view));
    return;
  }

  if (view === 'account') {
    state.accountOpen = true;
    return;
  }

  if (view === 'audit') {
    window.requestAnimationFrame(() => activateView('audit'));
    return;
  }

  if (view === 'log') {
    window.requestAnimationFrame(() => activateView('log'));
    return;
  }

  if (view && (objectCollections.includes(view) || view === 'users')) {
    const collectionType = viewCollectionType(view);
    const urlSort = readUrlSortState(collectionType, params);
    const edit = id && objectCollections.includes(view) ? readNestedEditParam(params) : '';
    state.deepLinkTarget = id && objectCollections.includes(view) ? { view, id, edit } : null;
    state.collectionUi[collectionType] = {
      ...collectionUi(collectionType),
      sort: urlSort.sort,
      sortDirection: urlSort.direction,
      search: params.get('q') || '',
      sortExplicit: urlSort.explicit,
    };
    window.requestAnimationFrame(() => activateView(view, id ? { id, edit } : {}));
  }
}

function writeUrlState(extra = {}) {
  if (isSetupPage) {
    return;
  }

  const activeView = extra.view || document.querySelector('[data-view].is-active')?.dataset.view || 'people';
  if (visualizationViews.includes(activeView)) {
    const params = new URLSearchParams();
    params.set('view', activeView);
    if (activeView === 'tree' && state.publicGraphGroupType) {
      params.set('group-type', state.publicGraphGroupType);
    }
    writeTimeframeSearchParams(params, state.timeframe);
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
    const activeEdit = Object.prototype.hasOwnProperty.call(extra, 'edit') ? extra.edit : activeNestedEditKey(collectionType, activeId);
    if (activeEdit) {
      params.set('edit', activeEdit);
    }
  }
  if (ui?.search) {
    params.set('q', ui.search);
  }
  if (activeSort && ui.sortExplicit) {
    params.set('sort', `${ui.sortDirection === 'desc' ? '-' : ''}${activeSort}`);
  }
  writeTimeframeSearchParams(params, state.timeframe);

  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

function writeTreeGraphUrlState() {
  if (isSetupPage) {
    return;
  }

  const loggedIn = Boolean(state.status?.auth?.user);
  const activeView = document.querySelector('[data-view].is-active')?.dataset.view || '';
  const params = new URLSearchParams();
  if (loggedIn || visualizationViews.includes(activeView)) {
    params.set('view', visualizationViews.includes(activeView) ? activeView : activeView || 'people');
  }
  if (state.publicGraphGroupType) {
    params.set('group-type', state.publicGraphGroupType);
  }
  writeTimeframeSearchParams(params, state.timeframe);

  const query = params.toString();
  window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
}

function handleUrlStateChange() {
  const params = new URLSearchParams(window.location.search);
  state.timeframe = timeframeFromSearchParams(params);
  renderTimeframeControl();
  applyTimeframeChange(false);
}

function renderTimeframeControl() {
  if (!timeframeControl) {
    return;
  }

  const bounds = availableDataYearBounds();
  const slider = timeframeControl.querySelector('[data-timeframe-slider]');
  const selectedYear = Math.min(bounds.max, Math.max(bounds.min, state.timeframe.start?.year || bounds.max));
  if (slider) {
    slider.min = String(bounds.min);
    slider.max = String(bounds.max);
    slider.value = String(selectedYear);
  }
  timeframeControl.querySelector('[data-timeframe-action="previous"]')?.toggleAttribute('disabled', selectedYear <= bounds.min);
  timeframeControl.querySelector('[data-timeframe-action="next"]')?.toggleAttribute('disabled', selectedYear >= bounds.max);
  updateTimeframeCompactValue();
}

function updateTimeframeCompactValue() {
  const value = timeframeControl.querySelector('.timeframe-value');
  const clear = timeframeControl.querySelector('.timeframe-clear');
  if (value && document.activeElement !== value) {
    value.value = timeframeLabel(state.timeframe);
  }
  if (clear) {
    clear.disabled = !state.timeframe.start;
  }
}

function handleTimeframeClick(event) {
  const action = event.target.closest('[data-timeframe-action]')?.dataset.timeframeAction;
  if (!action) {
    return;
  }

  if (action === 'clear') {
    state.timeframe = emptyTimeframe();
  } else if (action === 'previous' || action === 'next') {
    const delta = action === 'previous' ? -1 : 1;
    setSimpleTimeframeYear((state.timeframe.start || defaultTimeframePoint()).year + delta);
  }
  applyTimeframeChange(true, event.type !== 'input');
}

function handleTimeframeInput(event) {
  if (event.target.matches('.timeframe-value')) {
    const raw = event.target.value.trim();
    if (/^\d{4}$/.test(raw)) {
      setSimpleTimeframeYear(raw);
      applyTimeframeChange();
      event.target.value = timeframeLabel(state.timeframe);
    }
    return;
  }
  if (event.target.matches('[data-timeframe-slider]')) {
    setSimpleTimeframeYear(event.target.value);
    applyTimeframeChange(true, event.type !== 'input');
  }
}

function handleTimeframeWheel(event) {
  if (!event.target.closest('.timeframe-compact') || Math.abs(event.deltaY) < 1) {
    return;
  }
  event.preventDefault();
  const delta = event.deltaY > 0 ? -1 : 1;
  setSimpleTimeframeYear((state.timeframe.start || defaultTimeframePoint()).year + delta);
  applyTimeframeChange();
}

function handleTimeframeKeydown(event) {
  if (event.target.matches('.timeframe-value')) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
    }
    return;
  }
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.target.matches('input[type="range"]')) {
    return;
  }
  event.preventDefault();
  const delta = event.key === 'ArrowLeft' ? -1 : 1;
  setSimpleTimeframeYear((state.timeframe.start || defaultTimeframePoint()).year + delta);
  applyTimeframeChange();
}

function handleTimeframeFocus(event) {
  if (event.target.matches('.timeframe-value')) {
    event.target.select();
  }
}

function handleTimeframeBlur(event) {
  if (event.target.matches('.timeframe-value')) {
    event.target.value = timeframeLabel(state.timeframe);
  }
}

function setSimpleTimeframeYear(year) {
  const bounds = availableDataYearBounds();
  const normalizedYear = Math.min(bounds.max, Math.max(bounds.min, Number(year) || bounds.max));
  state.timeframe = {
    start: { year: normalizedYear, month: null, day: null, precision: 'year' },
    end: null,
  };
}

function defaultTimeframePoint() {
  const bounds = availableDataYearBounds();
  return { year: bounds.max || new Date().getFullYear(), month: null, day: null, precision: 'year' };
}

function availableDataYearBounds() {
  const years = [];
  (state.objects.timepoints || []).forEach((timepoint) => {
    const bounds = dateValueBounds(timepoint.date);
    const start = dateKeyToParts(bounds?.start);
    if (start?.year) {
      years.push(start.year);
    }
  });
  objectCollections.forEach((type) => {
    (state.objects[type] || []).forEach((object) => {
      JSON.stringify(object).replace(/\b(\d{4})-\d{2}-\d{2}\b/g, (_match, year) => {
        years.push(Number(year));
        return _match;
      });
    });
  });
  const current = new Date().getFullYear();
  return {
    min: years.length ? Math.min(current, ...years) : current - 20,
    max: current,
  };
}

function normalizeTimeframeRange() {
  if (!state.timeframe.start || !state.timeframe.end) {
    return;
  }
  const startBounds = timeframeBounds({ start: state.timeframe.start, end: null });
  const endBounds = timeframeBounds({ start: state.timeframe.end, end: null });
  if (endBounds.end < startBounds.start) {
    state.timeframe.end = { ...state.timeframe.start };
  }
}

function applyTimeframeChange(updateUrl = true, renderControl = true) {
  normalizeTimeframeRange();
  if (updateUrl) {
    if (state.status?.auth?.user) {
      writeUrlState();
    } else {
      writeTreeGraphUrlState();
    }
  }
  publicGraphSignature = '';
  contextGraphSignature = '';
  if (renderControl) {
    renderTimeframeControl();
  } else {
    updateTimeframeCompactValue();
  }
  renderSectionCounts();
  renderCollectionControls();
  objectCollections.forEach((type) => {
    if (!document.querySelector(`#view-${cssEscape(type)} [data-object-editor]`)) {
      renderObjectCollection(type);
    }
  });
  applyTimeframeToOpenEditors();
  renderGlobalSearchResults();
  renderVisualizations();
  scheduleContextGraphRender();
}

function applyTimeframeToOpenEditors() {
  document.querySelectorAll('[data-object-type][data-object-id]').forEach((item) => {
    const type = item.dataset.objectType;
    const object = findReferenceObject(type, item.dataset.objectId);
    if (!object) {
      return;
    }
    if (!item.querySelector('[data-object-editor]')) {
      item.hidden = !objectRelevantToTimeframe(type, object);
      return;
    }
    item.hidden = false;
    item.classList.toggle('is-outside-timeframe', !objectRelevantToTimeframe(type, object));
    item.querySelectorAll('[data-relationship-row-key]').forEach((row) => {
      const relevant = relationshipRowRelevantToTimeframe(type, object, row.dataset.relationshipRowKey);
      row.hidden = !relevant && item.dataset.dirty !== '1' && row.dataset.dirty !== '1';
    });
  });
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

function activeNestedEditKey(type, id = '') {
  return id ? state.relationshipEditing[objectKey(type, id)] || '' : '';
}

function readNestedEditParam(params) {
  const value = String(params.get('edit') || '').trim();
  return validNestedEditKey(value) ? value : '';
}

function validNestedEditKey(value) {
  return value === 'mainPhase' || /^(additionalPhases|memberships|activities):\d+$/.test(value);
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
  if (target.edit) {
    state.relationshipEditing[objectKey(target.view, target.id)] = target.edit;
  }
  state.editing[objectKey(target.view, target.id)] = true;
  renderObjectCollection(target.view);
  window.requestAnimationFrame(() => {
    if (target.edit) {
      openNestedEditRow(target.view, target.id, target.edit);
      return;
    }
    scrollObjectEditorIntoView(target.view, target.id, item.parentElement?.id || '');
  });
}

async function handleNavigationJump(event) {
  const referenceResult = event.target.closest('[data-reference-result-value], [data-reference-create-payload]');
  if (referenceResult) {
    event.preventDefault();
    await handleReferenceFilterResultClick(referenceResult);
    return;
  }

  if (!event.target.closest('[data-reference-field]')) {
    hideReferenceFilterResults();
  }

  const referenceLink = event.target.closest('[data-reference-link]');
  if (referenceLink) {
    event.preventDefault();
    await followReferenceLink(referenceLink);
    return;
  }

  const nestedEditLink = event.target.closest('[data-nested-edit-link]');
  if (nestedEditLink) {
    event.preventDefault();
    await followNestedEditLink(nestedEditLink);
    return;
  }

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

async function followReferenceLink(link) {
  const type = link.dataset.linkView || '';
  const id = link.dataset.linkId || '';
  if (!objectCollections.includes(type) || !id) {
    return;
  }

  if (focusExistingCreateForm(link)) {
    return;
  }

  if (!(await canSwitchToView(type))) {
    return;
  }

  clearCollectionNarrowingForDeepLink(type);
  activateView(type, { id, edit: '' });
  await refreshActivatedView(type);

  const item = objectItemElement(type, id);
  if (!item) {
    state.deepLinkTarget = { view: type, id, edit: '' };
    return;
  }

  if (!state.editing[objectKey(type, id)]) {
    await focusObjectEditor(item);
  } else {
    writeUrlState({ view: type, id, edit: '' });
    scrollObjectEditorIntoView(type, id, item.parentElement?.id || '');
  }
}

async function handleReferenceFilterResultClick(button) {
  const field = button.closest('[data-reference-field]');
  const select = field?.querySelector('[data-reference-input]');
  const input = field?.querySelector('[data-reference-filter]');
  if (!field || !select) {
    return;
  }

  if (button.dataset.referenceResultValue) {
    selectReferenceValue(select, button.dataset.referenceResultValue);
    if (input) {
      input.value = '';
    }
    hideReferenceFilterResults(field);
    return;
  }

  const type = button.dataset.referenceCreateType || select.dataset.referenceCollection || '';
  let payload = null;
  try {
    payload = JSON.parse(button.dataset.referenceCreatePayload || 'null');
  } catch (_error) {
    payload = null;
  }

  if (!objectCollections.includes(type) || !payload || button.dataset.creating === '1') {
    return;
  }

  button.dataset.creating = '1';
  button.disabled = true;
  const previousText = button.textContent;
  button.textContent = 'Wird erstellt ...';

  try {
    const response = await postJson('object-create', { type, object: payload });
    const created = response.object;
    const id = objectId(created);
    updateObjectInState(type, created);
    updateReferenceSelectOptions(select);
    ensureReferenceOption(select, created, type);
    selectReferenceValue(select, id);
    if (input) {
      input.value = '';
    }
    hideReferenceFilterResults(field);
  } catch (error) {
    button.disabled = false;
    button.dataset.creating = '';
    button.textContent = localizeErrorMessage(error.message || previousText || 'Erstellen fehlgeschlagen');
  }
}

function selectReferenceValue(select, value) {
  select.value = value || '';
  filterReferenceOptions(select, '');
  updateReferenceControlLink(select);
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function ensureReferenceOption(select, object, collection) {
  const id = objectId(object);
  if (!id || Array.from(select.options).some((option) => option.value === id)) {
    return;
  }

  const option = document.createElement('option');
  option.value = id;
  option.textContent = referenceOptionLabel(object, collection, [object], select.dataset.referenceShowIds === '1');
  select.appendChild(option);
}

async function followNestedEditLink(link) {
  const type = link.dataset.linkView || '';
  const id = link.dataset.linkId || '';
  const edit = link.dataset.linkEdit || '';
  if (!objectCollections.includes(type) || !id || !validNestedEditKey(edit)) {
    return;
  }

  if (!(await flushGroupEditsBeforePersonLink(link))) {
    return;
  }

  if (focusExistingCreateForm(link)) {
    return;
  }

  if (!(await canSwitchToView(type))) {
    return;
  }

  clearCollectionNarrowingForDeepLink(type);
  activateView(type, { id, edit });
  await refreshActivatedView(type);

  const item = objectItemElement(type, id);
  if (!item) {
    state.deepLinkTarget = { view: type, id, edit };
    return;
  }

  const key = objectKey(type, id);
  state.relationshipEditing[key] = edit;
  if (!state.editing[key]) {
    await focusObjectEditor(item);
  } else {
    writeUrlState({ view: type, id, edit });
  }

  openNestedEditRow(type, id, edit);
}

async function flushGroupEditsBeforePersonLink(link) {
  const groupItem = link.closest('[data-object-type="groups"][data-object-id]');
  if (!groupItem) {
    return true;
  }

  const drafts = Array.from(groupItem.querySelectorAll('[data-group-relation-add][data-dirty="1"]'));
  for (const draft of drafts) {
    window.clearTimeout(state.editTimers[groupRelationDraftTimerKey(draft)]);
    if (!(await flushGroupRelationDraft(draft))) {
      draft.querySelector('[data-nested-field="person"]')?.focus();
      return false;
    }
  }

  const rows = Array.from(groupItem.querySelectorAll('[data-group-reverse-row][data-dirty="1"]'));
  for (const row of rows) {
    window.clearTimeout(state.editTimers[groupReverseTimerKey(row)]);
    if (!(await flushGroupReverseRow(row))) {
      return false;
    }
  }

  const key = objectKey('groups', groupItem.dataset.objectId || '');
  window.clearTimeout(state.editTimers[key]);
  if (groupItem.dataset.saving === '1') {
    await waitForElementSave(groupItem);
  }
  if (groupItem.dataset.dirty === '1') {
    await flushObjectEdit(groupItem, false);
  }
  return groupItem.dataset.dirty !== '1' && groupItem.dataset.saving !== '1';
}

async function handleChangeLogClick(event) {
  const button = event.target.closest('[data-change-log]');
  if (!button) {
    return;
  }

  const type = button.dataset.linkView || '';
  const id = button.dataset.linkId || '';
  const edit = button.dataset.linkEdit || '';
  if (!objectCollections.includes(type) || !id) {
    return;
  }

  if (focusExistingCreateForm(button) || !(await canSwitchToView(type))) {
    return;
  }

  clearCollectionNarrowingForDeepLink(type);
  activateView(type, edit ? { id, edit } : { id });
  await refreshActivatedView(type);

  const item = objectItemElement(type, id);
  if (!item) {
    state.deepLinkTarget = { view: type, id, edit };
    return;
  }

  if (edit && validNestedEditKey(edit)) {
    state.relationshipEditing[objectKey(type, id)] = edit;
  }
  await focusObjectEditor(item);
  if (edit && validNestedEditKey(edit)) {
    openNestedEditRow(type, id, edit);
  }
}

function objectItemElement(type, id) {
  return document.querySelector(`[data-object-type="${cssEscape(type)}"][data-object-id="${cssEscape(id)}"]`);
}

function clearCollectionNarrowingForDeepLink(type) {
  const ui = collectionUi(type);
  ui.search = '';
  ui.filters = {};
}

function openNestedEditRow(type, id, edit) {
  if (!validNestedEditKey(edit)) {
    return false;
  }

  const item = objectItemElement(type, id);
  const row = item?.querySelector(`[data-relationship-row-key="${cssEscape(edit)}"]`);
  if (!item || !row) {
    scrollObjectEditorIntoView(type, id, item?.parentElement?.id || '');
    return false;
  }

  const fieldRoot = row.closest('[data-object-field]');
  if (fieldRoot) {
    collapseRelationshipRowsForPerson(fieldRoot, row);
  }
  row.classList.remove('is-collapsed');
  row.querySelector('[data-list-action="toggle"]')?.setAttribute('aria-expanded', 'true');
  scrollElementIntoView(row);
  return true;
}

async function canSwitchToView(viewName) {
  if (!viewName || viewName === currentViewName()) {
    return true;
  }

  if (!(await resolveOpenCreateFormBeforeSwitch())) {
    return false;
  }

  return closeOpenEditorsBeforeSwitch();
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
  const drafts = Array.from(document.querySelectorAll('[data-group-relation-add][data-dirty="1"]'));
  for (const draft of drafts) {
    window.clearTimeout(state.editTimers[groupRelationDraftTimerKey(draft)]);
    if (!(await flushGroupRelationDraft(draft))) {
      return false;
    }
  }

  const reverseRows = Array.from(document.querySelectorAll('[data-group-reverse-row][data-dirty="1"]'));
  for (const row of reverseRows) {
    window.clearTimeout(state.editTimers[groupReverseTimerKey(row)]);
    if (!(await flushGroupReverseRow(row))) {
      return false;
    }
  }

  const objectItems = Array.from(document.querySelectorAll('[data-object-editor]'))
    .map((editor) => editor.closest('[data-object-type][data-object-id]'))
    .filter(Boolean);
  const hasUserEditor = Boolean(document.querySelector('[data-user-editor]'));
  if (!objectItems.length && !hasUserEditor) {
    return true;
  }

  const renderTypes = new Set();
  for (const item of objectItems) {
    const type = item.dataset.objectType;
    const id = item.dataset.objectId;
    const key = objectKey(type, id);
    window.clearTimeout(state.editTimers[key]);
    await flushObjectEdit(item, true);
    if (item.dataset.dirty === '1' || item.dataset.saving === '1') {
      return false;
    }
    state.editing[key] = false;
    delete state.relationshipEditing[key];
    renderTypes.add(type);
  }

  if (hasUserEditor) {
    const userItems = Array.from(document.querySelectorAll('[data-user-editor]'))
      .map((editor) => editor.closest('[data-username]'))
      .filter(Boolean);
    for (const item of userItems) {
      const username = item.dataset.username || '';
      window.clearTimeout(state.editTimers[objectKey('users', username)]);
      await flushUserEdit(item, true);
      if (item.dataset.dirty === '1' || item.dataset.saving === '1') {
        return false;
      }
      state.editing[objectKey('users', username)] = false;
    }
    renderUserList();
  }

  renderTypes.forEach((type) => {
    renderObjectCollection(type);
  });
  return true;
}

async function refreshActivatedView(viewName) {
  if (viewName === 'users') {
    await loadManagedUsers();
    renderUsersManagement();
    return;
  }

  if (viewName === 'audit') {
    await loadAuditLog();
    renderAuditLog();
    return;
  }

  if (viewName === 'log') {
    await loadChangeLog();
    renderChangeLog();
    return;
  }

  if (visualizationViews.includes(viewName)) {
    if (canAccessObjects() && !hasPendingObjectEdits()) {
      try {
        await loadObjects();
      } catch (error) {
        console.error(error);
      }
    }
    renderVisualizations();
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

  if (!(await closeOpenEditorsBeforeSwitch())) {
    return;
  }
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
    .filter(({ type, object }) => objectRelevantToTimeframe(type, object))
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
    state.status = await getJson('api.php?action=status&counts=0');
    renderShell();

    const user = state.status.auth?.user || null;
    if (user) {
      await verifyAccessControls();
    }
    if (user && state.accountOpen) {
      await loadAccount();
      renderAccountPage();
      const writable = Boolean(state.status.storage && state.status.storage.writable);
      setConnection(writable ? 'Online' : 'Eingeloggt', writable ? 'is-online' : '');
      return;
    }

    if (!user) {
      state.status = await getJson('api.php?action=status');
      renderShell();
    }
    await loadObjects();
    if (hasPermission('manage_users')) {
      await loadChangeLog();
    }

    if (hasPermission('manage_users')) {
      await loadManagedUsers();
      await loadAuditLog();
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
  const accountOpen = Boolean(user && state.accountOpen);
  const fullPageOpen = accountOpen || isSetupPage || state.loginOpen || isLoginLinkPage;
  document.body.classList.toggle('is-full-page-open', fullPageOpen);
  if (!user && accessControlWarning) {
    accessControlWarning.hidden = true;
  }
  authScreen.hidden = !isSetupPage && (Boolean(user) || (!state.loginOpen && !isLoginLinkPage));
  workspace.hidden = accountOpen || isSetupPage || state.loginOpen || isLoginLinkPage;
  workspace.classList.toggle('is-public', !user);
  if (publicVisualizationNav) {
    publicVisualizationNav.hidden = Boolean(user) || accountOpen || isSetupPage || state.loginOpen || isLoginLinkPage;
  }
  if (accountPage) {
    accountPage.hidden = !accountOpen;
  }
  connectionStatus.hidden = !user;
  if (globalSearch) {
    globalSearch.hidden = !user || accountOpen;
  }
  if (sourceControl) {
    sourceControl.hidden = !user || accountOpen || !hasPermission('write');
  }
  if (timeframeControl) {
    timeframeControl.hidden = accountOpen || isSetupPage || state.loginOpen || isLoginLinkPage;
  }
  loginButton.hidden = Boolean(user);
  logoutButton.hidden = !user;
  currentUserLabel.hidden = !user;
  if (accountButton) {
    accountButton.hidden = !user;
  }
  if (loginPanel) {
    loginPanel.hidden = Boolean(user) || isSetupPage || (!state.loginOpen && !isLoginLinkPage);
  }
  setupPanel.hidden = !isSetupPage;

  if (user) {
    currentUserName.textContent = user.display_name || user.username || 'Eingeloggt';
  } else if (!visualizationViews.includes(currentViewName())) {
    activateView('tree', { silent: true });
  }
  renderTimeframeControl();
  updateSourceControl();

  const canManageUsers = hasPermission('manage_users');
  usersNavGroup.hidden = !canManageUsers;
  usersNav.hidden = !canManageUsers;
  if (auditNav) {
    auditNav.hidden = !canManageUsers;
  }
  if (logNav) {
    logNav.hidden = !canManageUsers;
  }
  if (!canManageUsers && document.querySelector('#view-users')?.classList.contains('is-active')) {
    activateView('people', { silent: true });
  }
  if (!canManageUsers && document.querySelector('#view-audit')?.classList.contains('is-active')) {
    activateView('people', { silent: true });
  }
  if (!canManageUsers && document.querySelector('#view-log')?.classList.contains('is-active')) {
    activateView('people', { silent: true });
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
}

function updateSourceControl() {
  if (!sourceInput) {
    return;
  }

  const fallback = defaultEditSource();
  sourceInput.value = state.sourceOverride;
  sourceInput.placeholder = fallback;
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
  if (!window.isSecureContext) {
    showAuthMessage('Passkeys benötigen einen sicheren HTTPS-Kontext.', true);
  }
}

async function verifyAccessControls() {
  const current = state.status?.auth?.access_control_check || {};
  if (current.fresh || accessControlCheckAttempted) {
    renderAccessControlWarning(current);
    return;
  }

  accessControlCheckAttempted = true;
  let success = false;
  for (let attempt = 0; attempt < 2 && !success; attempt += 1) {
    try {
      const response = await fetch('config/app.json', {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'same-origin',
      });
      success = response.status === 403 || response.status === 404;
    } catch (_error) {
      success = false;
    }
  }

  try {
    const response = await postJson('access-control-check', { success });
    state.status.auth.access_control_check = response.access_control_check;
  } catch (error) {
    console.error(error);
    state.status.auth.access_control_check = { success: false, fresh: false };
  }
  renderAccessControlWarning(state.status.auth.access_control_check);
}

function renderAccessControlWarning(check = {}) {
  if (!accessControlWarning) {
    return;
  }
  accessControlWarning.hidden = check.success === true;
}

function openLoginPanel() {
  state.loginOpen = true;
  state.accountOpen = false;
  clearAuthMessage();
  clearLoginEmailState();
  renderShell();
  window.requestAnimationFrame(() => {
    loginEmailInput?.focus();
  });
}

async function requestEmailLoginLink(event) {
  event.preventDefault();
  clearAuthMessage();
  const email = String(new FormData(loginEmailForm).get('email') || '').trim();
  if (!email) {
    showLoginEmailState('E-Mail-Adresse ist erforderlich.', true);
    loginEmailInput?.focus();
    return;
  }

  showLoginEmailState('Login-Link wird gesendet ...', false);
  const startedAt = performance.now();
  try {
    await postJson('auth-email-login-request', { email });
    await waitAtLeast(startedAt, 1400);
    showLoginEmailState('Wenn die Adresse registriert ist, wurde ein Login-Link gesendet.', false);
  } catch (error) {
    console.error(error);
    showLoginEmailState(localizeErrorMessage(error.message || 'Login-Link konnte nicht gesendet werden.'), true);
  }
}

async function beginLogin() {
  clearAuthMessage();
  if (!window.PublicKeyCredential) {
    openLoginPanel();
    showLoginEmailState('Dieser Browser unterstützt keine Passkeys. Du kannst stattdessen einen Login-Link anfordern.', true);
    return;
  }
  if (!window.isSecureContext) {
    openLoginPanel();
    showLoginEmailState('Passkeys benötigen HTTPS, außer auf lokalen Entwicklungs-Hosts. Du kannst stattdessen einen Login-Link anfordern.', true);
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

    state.loginOpen = false;
    await refresh();
  } catch (error) {
    console.error(error);
    openLoginPanel();
    showLoginEmailState(`${passkeyErrorMessage(error)} Du kannst stattdessen einen Login-Link anfordern.`, true);
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

  const setup = incomingSetupToken;
  if (!setup) {
    leaveIncomingSetupFlow();
    showAuthMessage('Setup-Link ist ungültig.', true);
    return;
  }

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

    leaveIncomingSetupFlow(false);
    await refresh();
  } catch (error) {
    console.error(error);
    if (isTerminalSetupTokenError(error)) {
      leaveIncomingSetupFlow();
    }
    showAuthMessage(passkeyErrorMessage(error), true);
  }
}

function clearIncomingSetupToken() {
  incomingSetupToken = '';
}

function leaveIncomingSetupFlow(render = true) {
  clearIncomingSetupToken();
  isSetupPage = false;
  setupPanel.hidden = true;
  if (render) {
    renderShell();
  }
}

function isTerminalSetupTokenError(error) {
  const serverMessage = String(error?.payload?.error || '');
  return serverMessage === 'Setup token is required.'
    || serverMessage === 'Setup token is not valid.';
}

async function logout() {
  try {
    await postJson('auth-logout');
  } finally {
    clearAdminSetupResult();
    state.users = [];
    state.account = null;
    state.accountOpen = false;
    state.loginOpen = false;
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
  state.status = await getJson('api.php?action=status&counts=0');
  renderShell();
  if (canAccessObjects()) {
    await loadObjects();
  } else {
    clearObjects();
  }
  render();
}

async function pollObjects() {
  if (document.hidden || state.accountOpen || !canAccessObjects() || hasPendingObjectEdits()) {
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

async function loadAuditLog() {
  if (!hasPermission('manage_users')) {
    state.auditLog = [];
    return;
  }

  const response = await getJson('api.php?action=admin-audit');
  state.auditLog = Array.isArray(response.audit) ? response.audit : [];
  renderNavigationCounts();
}

async function loadChangeLog() {
  if (!hasPermission('manage_users')) {
    state.changeLog = [];
    return;
  }

  const response = await getJson('api.php?action=object-changes');
  state.changeLog = Array.isArray(response.changes) ? response.changes : [];
  renderNavigationCounts();
}

async function openAccountPage(event) {
  event?.preventDefault();
  if (!(await resolveOpenCreateFormBeforeSwitch())) {
    return;
  }

  if (!(await closeOpenEditorsBeforeSwitch())) {
    return;
  }
  clearAdminSetupResult();
  state.accountOpen = true;
  state.loginOpen = false;
  clearAuthMessage();
  clearAccountMessage();
  window.history.replaceState(null, '', `${window.location.pathname}?view=account`);
  renderShell();
  await loadAccount();
}

async function loadAccount() {
  if (!state.status?.auth?.user) {
    state.account = null;
    renderAccountPage();
    return;
  }

  const response = await getJson('api.php?action=account');
  state.account = response.account || null;
  if (state.account?.user && state.status?.auth) {
    state.status.auth.user = state.account.user;
  }
  renderAccountPage();
}

async function handleAccountSubmit(event) {
  event.preventDefault();
  await flushAccountEdit(true);
}

function handleAccountInput() {
  markAccountDirty();
  scheduleAccountSave(1200);
}

function handleAccountBlur(event) {
  if (event.target.closest('input, textarea, select')) {
    scheduleAccountSave(300);
  }
}

function accountPayload() {
  const formData = new FormData(accountForm);
  return {
    display_name: String(formData.get('display_name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
  };
}

function markAccountDirty() {
  accountForm.dataset.dirty = '1';
  showAccountMessage('Ungespeichert', false);
}

function scheduleAccountSave(delay) {
  const key = objectKey('account', 'self');
  window.clearTimeout(state.editTimers[key]);
  state.editTimers[key] = window.setTimeout(() => {
    flushAccountEdit(false);
  }, delay);
}

async function flushAccountEdit(force = false) {
  if (!accountForm || accountForm.dataset.saving === '1') {
    return;
  }

  const payload = accountPayload();
  const payloadKey = JSON.stringify(payload);
  if (!force && accountForm.dataset.dirty !== '1') {
    return;
  }
  if (payloadKey === accountForm.dataset.lastSavedPayload && accountForm.dataset.dirty !== '1') {
    return;
  }

  accountForm.dataset.saving = '1';
  showAccountMessage('Wird gespeichert ...', false);
  try {
    const response = await postJson('account-update', payload);
    state.account = response.account || null;
    if (response.user) {
      state.status.auth.user = response.user;
    }
    renderShell();
    accountForm.dataset.dirty = '';
    accountForm.dataset.lastSavedPayload = payloadKey;
    showAccountMessage('Gespeichert.', false, true);
  } catch (error) {
    console.error(error);
    showAccountMessage(localizeErrorMessage(error.message || 'Benutzerkonto konnte nicht gespeichert werden.'), true);
  } finally {
    accountForm.dataset.saving = '';
  }
}

async function handleAccountClick(event) {
  const backLink = event.target.closest('.account-toolbar a[href="./"]');
  if (backLink) {
    event.preventDefault();
    await flushAccountEdit(true);
    state.accountOpen = false;
    window.history.replaceState(null, '', window.location.pathname);
    renderShell();
    return;
  }

  if (!event.target.closest('[data-danger-confirm]')) {
    resetDangerConfirmations();
  }

  const addButton = event.target.closest('[data-account-action="add-passkey"]');
  if (addButton) {
    await flushAccountEdit(true);
    await addAccountPasskey();
    return;
  }

  const logoutAllButton = event.target.closest('[data-account-action="logout-all"]');
  if (logoutAllButton) {
    if (!confirmDangerButton(logoutAllButton)) {
      return;
    }
    await flushAccountEdit(true);
    try {
      await postJson('account-logout-all');
      window.location.assign(`${window.location.pathname}${window.location.search}`);
    } catch (error) {
      console.error(error);
      showAccountMessage(localizeErrorMessage(error.message || 'Sitzungen konnten nicht abgemeldet werden.'), true);
    }
    return;
  }

  const deleteButton = event.target.closest('[data-account-passkey-delete]');
  if (!deleteButton) {
    return;
  }

  if (!confirmDangerButton(deleteButton)) {
    return;
  }

  try {
    const response = await postJson('account-delete-passkey', {
      credential_id: deleteButton.dataset.accountPasskeyDelete || '',
    });
    state.account = response.account || null;
    if (state.account?.user && state.status?.auth) {
      state.status.auth.user = state.account.user;
    }
    resetDangerConfirmations();
    renderAccountPage();
    showAccountMessage('Passkey gelöscht.', false);
  } catch (error) {
    console.error(error);
    showAccountMessage(localizeErrorMessage(error.message || 'Passkey konnte nicht gelöscht werden.'), true);
  }
}

async function addAccountPasskey() {
  clearAccountMessage();
  if (!window.PublicKeyCredential) {
    showAccountMessage('Dieser Browser unterstützt keine Passkeys.', true);
    return;
  }
  if (!window.isSecureContext) {
    showAccountMessage('Passkeys benötigen HTTPS, außer auf lokalen Entwicklungs-Hosts.', true);
    return;
  }

  showAccountMessage('Passkey wird erstellt ...', false);
  try {
    const options = await postJson('account-passkey-options');
    const credential = await navigator.credentials.create({
      publicKey: decodeCreationOptions(options.publicKey),
    });

    if (!credential) {
      throw new Error('Das Passkey-Setup wurde abgebrochen.');
    }

    const response = await postJson('account-passkey-verify', {
      challenge_id: options.challenge_id,
      credential: credentialToJson(credential),
    });

    state.account = response.account || null;
    if (state.account?.user && state.status?.auth) {
      state.status.auth.user = state.account.user;
    }
    renderAccountPage();
    showAccountMessage('Passkey hinzugefügt.', false);
  } catch (error) {
    console.error(error);
    showAccountMessage(passkeyErrorMessage(error), true);
  }
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
    state.editing = { [objectKey('users', username)]: true };
    state.createOpen.users = false;
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
        await closeUserEditor(username);
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
      await flushUserEdit(item, true);
      const response = await postJson('admin-create-setup-token', { username });
      state.setupResult = response.setup;
      await loadManagedUsers();
      return;
    }

    if (button.dataset.action === 'delete-setup-token') {
      if (!confirmDangerButton(button)) {
        return;
      }

      const tokenId = button.dataset.tokenId || '';
      const response = await postJson('admin-delete-setup-token', { token_id: tokenId });
      state.setupTokens = response.setup_tokens || [];
      if (String(state.setupResult?.id || '') === tokenId) {
        state.setupResult = null;
      }
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
      if (String(state.setupResult?.username || '') === username) {
        state.setupResult = null;
      }
      resetDangerConfirmations();
      renderNavigationCounts();
      renderUserList();
      return;
    }

    if (button.dataset.action === 'toggle') {
      await flushUserEdit(item, true);
      await postJson('admin-update-user', {
        username,
        enabled: !user.enabled,
      });
      await reloadAfterUserChange(username);
      return;
    }
  } catch (error) {
    showAuthMessage(localizeErrorMessage(error.message || 'Benutzer konnte nicht aktualisiert werden.'), true);
  }
}

function handleUserEditorInput(event) {
  const item = event.target.closest('[data-username]');
  const editor = event.target.closest('[data-user-editor]');
  if (!item || !editor) {
    return;
  }

  markUserDirty(item);
  scheduleUserSave(item, 900);
}

function handleUserEditorBlur(event) {
  const item = event.target.closest('[data-username]');
  const editor = event.target.closest('[data-user-editor]');
  if (!item || !editor) {
    return;
  }

  scheduleUserSave(item, 250);
}

async function closeUserEditor(username) {
  const item = document.querySelector(`[data-username="${cssEscape(username)}"]`);
  if (item) {
    await flushUserEdit(item, true);
  }
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
  if (!button) {
    return;
  }

  const target = document.querySelector(button.dataset.copy);
  const value = target?.value || target?.textContent || '';
  if (!value) {
    return;
  }

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }

    await navigator.clipboard.writeText(value);
    setSetupCopyButtonState(button, true);
    showAuthMessage('Setup-Link kopiert.', false, 2400);
  } catch (error) {
    target?.focus();
    target?.select?.();
    showAuthMessage('Kopieren nicht möglich. URL ist zum manuellen Kopieren markiert.', true, 4500);
  }
}

function setSetupCopyButtonState(button, copied) {
  const label = copied ? 'Kopiert' : 'Setup-Link kopieren';
  button.innerHTML = setupCopyIcon(copied ? 'check' : 'copy');
  button.setAttribute('aria-label', label);
  button.title = label;
  button.classList.toggle('is-copied', copied);

  const status = button.parentElement?.parentElement?.querySelector('[data-copy-status]');
  if (status) {
    status.textContent = copied ? 'Setup-Link kopiert.' : '';
  }

  window.clearTimeout(Number(button.dataset.copyResetTimer || 0));
  if (copied) {
    button.dataset.copyResetTimer = String(window.setTimeout(() => {
      if (button.isConnected) {
        setSetupCopyButtonState(button, false);
      }
    }, 1200));
  } else {
    delete button.dataset.copyResetTimer;
  }
}

function setupCopyIcon(name) {
  const paths = name === 'check'
    ? '<path d="m20 6-11 11-5-5"></path>'
    : '<rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>';
  return `<svg class="setup-copy-icon" aria-hidden="true" viewBox="0 0 24 24">${paths}</svg>`;
}

function clearAdminSetupResult() {
  state.setupResult = null;
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
  renderTimeframeControl();
  renderVisualizations();
  renderSectionCounts();
  renderCollectionControls();
  renderObjectCollections();
  renderUsersManagement();
  renderAuditLog();
  renderChangeLog();
  applyDeepLinkTarget();
  scheduleContextGraphRender();
}

function markUserDirty(item) {
  item.dataset.dirty = '1';
  setUserSaveState(item, 'Ungespeichert', false);
}

function scheduleUserSave(item, delay) {
  const key = objectKey('users', item.dataset.username || '');
  window.clearTimeout(state.editTimers[key]);
  state.editTimers[key] = window.setTimeout(() => {
    flushUserEdit(item, false);
  }, delay);
}

function userEditorPayload(item) {
  return {
    username: item.dataset.username || '',
    display_name: item.querySelector('input[data-display-name]')?.value.trim() || '',
    email: item.querySelector('input[data-email]')?.value.trim() || '',
    permissions: Array.from(item.querySelectorAll('input[data-permission]:checked')).map((input) => input.value),
  };
}

async function flushUserEdit(item, force = false) {
  if (!item?.isConnected || item.dataset.saving === '1') {
    return;
  }
  if (!force && item.dataset.dirty !== '1') {
    return;
  }

  const payload = userEditorPayload(item);
  const payloadKey = JSON.stringify(payload);
  if (payloadKey === item.dataset.lastSavedPayload && item.dataset.dirty !== '1') {
    return;
  }

  item.dataset.saving = '1';
  setUserSaveState(item, 'Wird gespeichert', false);
  try {
    const response = await postJson('admin-update-user', payload);
    updateManagedUserInState(response.user || payload);
    item.dataset.dirty = '';
    item.dataset.lastSavedPayload = payloadKey;
    updateUserChrome(item, response.user || payload);
    setUserSaveState(item, 'Gespeichert', false, true);
  } catch (error) {
    setUserSaveState(item, localizeErrorMessage(error.message || 'Benutzer konnte nicht aktualisiert werden.'), true);
    showAuthMessage(localizeErrorMessage(error.message || 'Benutzer konnte nicht aktualisiert werden.'), true, 4500);
  } finally {
    item.dataset.saving = '';
  }
}

function updateManagedUserInState(user) {
  const username = user.username || '';
  const index = state.users.findIndex((candidate) => candidate.username === username);
  if (index !== -1) {
    state.users[index] = { ...state.users[index], ...user };
  }
  if (state.status?.auth?.user?.username === username) {
    state.status.auth.user = { ...state.status.auth.user, ...user };
    renderShell();
  }
}

function updateUserChrome(item, user) {
  const title = item.querySelector('.object-title-heading');
  const meta = item.querySelector('.object-subtitle');
  if (title) {
    title.textContent = userTitle(user);
  }
  if (meta) {
    meta.textContent = userMeta(user);
  }
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

function renderVisualizations() {
  renderTreeGraph();
  if (currentViewName() === 'timeline') {
    renderTimelineVisualization();
  }
}

function handlePublicGraphFilterChange(event) {
  state.publicGraphGroupType = event.target.value || '';
  publicGraphSignature = '';
  writeTreeGraphUrlState();
  renderTreeGraph();
}

function scheduleTreeGraphRender() {
  if (treeGraphFrame) {
    return;
  }

  treeGraphFrame = window.requestAnimationFrame(() => {
    treeGraphFrame = 0;
    publicGraphSignature = '';
    renderTreeGraph();
  });
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

function handleContextGraphTypeToggle(event) {
  const toggle = event.target.closest('[data-context-graph-type-toggle]');
  if (!toggle) {
    return;
  }

  const type = toggle.value || '';
  if (!objectCollections.includes(type)) {
    return;
  }

  if (type === currentContextGraphForcedType()) {
    toggle.checked = true;
    return;
  }

  state.contextGraphTypes[type] = toggle.checked;
  contextGraphSignature = '';
  renderContextGraphTypeToggles();
  scheduleContextGraphRender();
}

function handleContextGraphTypeGroupToggle(event) {
  const toggle = event.target.closest('[data-context-graph-type-group-toggle]');
  if (!toggle) {
    return;
  }

  const types = contextGraphTypeGroups[toggle.value || ''] || [];
  const forcedType = currentContextGraphForcedType();
  types.forEach((type) => {
    if (type !== forcedType) {
      state.contextGraphTypes[type] = toggle.checked;
    }
  });

  contextGraphSignature = '';
  renderContextGraphTypeToggles();
  scheduleContextGraphRender();
}

function renderContextGraphTypeToggles() {
  const forcedType = currentContextGraphForcedType();
  const enabled = (type) => type === forcedType || state.contextGraphTypes[type] !== false;
  contextGraphTypeToggles.forEach((toggle) => {
    const type = toggle.value || '';
    const forced = type === forcedType;
    toggle.checked = enabled(type);
    toggle.disabled = forced;
    toggle.closest('label')?.classList.toggle('is-forced', forced);
  });
  contextGraphTypeGroupToggles.forEach((toggle) => {
    const types = contextGraphTypeGroups[toggle.value || ''] || [];
    const enabledCount = types.filter(enabled).length;
    toggle.checked = Boolean(types.length && enabledCount === types.length);
    toggle.indeterminate = enabledCount > 0 && enabledCount < types.length;
    toggle.closest('label')?.classList.toggle('is-partial', toggle.indeterminate);
  });
}

function currentContextGraphForcedType() {
  const view = currentViewName();
  return objectCollections.includes(view) ? view : '';
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
  return new Set((groups || []).flatMap((group) => (
    objectId(group) && objectRelevantToTimeframe('groups', group) ? groupTypeIds(group) : []
  )));
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

  const graph = lineageGraphData(groups, people, roles, groupTypes, state.publicGraphGroupType);
  renderVisualizationSummary(root.querySelector('[data-visualization-summary="tree"]'), [
    `${graph.nodes.length} Gruppen`,
    `${graph.edges.length} Verbindungen`,
    `${graph.memberCount} bekannte Mitglieder`,
    `${graph.leaderCount} bekannte Leitungen`,
  ]);
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

  bindVisualizationNetwork(publicNetwork, graph);
  settleGraph(publicNetwork, graph);
}

function bindVisualizationNetwork(network, graph) {
  const nodes = new Map((graph.nodes || []).map((node) => [node.id, node]));
  const edges = new Map((graph.edges || []).map((edge) => [edge.id, edge]));
  network.on('click', (event) => {
    const entry = event.edges?.length ? edges.get(event.edges[0]) : nodes.get(event.nodes?.[0]);
    if (entry?.navigation) {
      navigateToVisualizationTarget(entry.navigation);
    }
  });
}

async function navigateToVisualizationTarget(target) {
  if (!state.status?.auth?.user || !target?.type || !target.id) {
    return;
  }
  if (!(await canSwitchToView(target.type))) {
    return;
  }
  clearCollectionNarrowingForDeepLink(target.type);
  state.deepLinkTarget = { view: target.type, id: target.id, edit: target.edit || '' };
  activateView(target.type, { id: target.id, edit: target.edit || '' });
  await refreshActivatedView(target.type);
  applyDeepLinkTarget();
}

function renderVisualizationSummary(root, values) {
  if (root) {
    root.innerHTML = values.map((value) => `<span>${escapeHtml(value)}</span>`).join('');
  }
}

function renderTimelineVisualization() {
  const root = document.querySelector('[data-visualization-timeline]');
  const status = document.querySelector('[data-visualization-status="timeline"]');
  const summary = document.querySelector('[data-visualization-summary="timeline"]');
  if (!root) {
    return;
  }

  const data = timelineVisualizationData();
  renderVisualizationSummary(summary, [
    data.periodLabel,
    `${data.groupCount} Gruppen`,
    `${data.leadershipCount} bekannte Stammesführungen`,
  ]);
  if (!data.lanes.length) {
    root.innerHTML = '';
    setTreeGraphStatus(status, 'Keine datierten Gruppen oder Stammesführungen im gewählten Zeitraum.');
    return;
  }
  setTreeGraphStatus(status, '');
  const ticks = timelineTicks(data.start, data.end);
  root.innerHTML = `
    <div class="timeline-chart">
      <div class="timeline-axis">${ticks.map((tick) => `<span class="timeline-tick" style="left:${tick.left}%"><span>${tick.label}</span></span>`).join('')}</div>
      ${data.lanes.map((lane) => `
        <div class="timeline-lane" style="min-height:${Math.max(46, lane.rowCount * 36 + 10)}px">
          <span class="timeline-lane-label" title="${escapeAttribute(lane.label)}">${escapeHtml(lane.label)}</span>
          ${lane.segments.map((segment) => `
            <button class="timeline-segment ${segment.leadership ? 'is-leadership' : ''} ${segment.openStart ? 'is-open-start' : ''} ${segment.openEnd ? 'is-open-end' : ''}" type="button"
              style="left:${segment.left}%;width:${segment.width}%;top:${8 + segment.row * 36}px"
              data-visualization-target-type="${escapeAttribute(segment.navigation.type)}"
              data-visualization-target-id="${escapeAttribute(segment.navigation.id)}"
              data-visualization-target-edit="${escapeAttribute(segment.navigation.edit || '')}"
              title="${escapeAttribute(segment.title)}">${escapeHtml(segment.label)}</button>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function timelineVisualizationData() {
  const rawLanes = [];
  const allBounds = [];
  const leadershipSegments = [];
  (state.objects.people || []).forEach((person) => {
    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, index) => {
      const role = findReferenceObject('roles', activityRoleId(activity));
      if (!isTribeLeadershipRole(role)) {
        return;
      }
      const bounds = effectiveActivityBounds(activity);
      if (!bounds || (state.timeframe.start && !boundsOverlap(bounds, timeframeBounds(state.timeframe)))) {
        return;
      }
      allBounds.push(bounds);
      leadershipSegments.push({
        bounds,
        label: objectListTitle('people', person),
        title: [objectListTitle('people', person), objectLabel(role, 'roles'), relationshipPeriodLabel(activity.period)].filter(Boolean).join(' · '),
        navigation: { type: 'people', id: objectId(person), edit: `activities:${index}` },
        leadership: true,
      });
    });
  });
  if (leadershipSegments.length) {
    rawLanes.push({ label: 'Stammesführung', segments: leadershipSegments });
  }

  (state.objects.groups || []).forEach((group) => {
    const segments = groupPhaseEntries(group).flatMap(({ phase, rowKey }) => {
      const bounds = effectivePhaseBounds(phase);
      if (!bounds || (state.timeframe.start && !boundsOverlap(bounds, timeframeBounds(state.timeframe)))) {
        return [];
      }
      allBounds.push(bounds);
      const type = objectLabel(findReferenceObject('group-types', groupPhaseTypeId(phase)), 'group-types');
      const parent = objectLabel(findReferenceObject('groups', groupPhaseParentGroupId(phase)), 'groups');
      return [{
        bounds,
        label: type || objectListTitle('groups', group),
        title: [type, parent ? `unter ${parent}` : '', relationshipPeriodLabel(phase.period)].filter(Boolean).join(' · '),
        navigation: { type: 'groups', id: objectId(group), edit: rowKey },
      }];
    });
    if (segments.length) {
      rawLanes.push({ label: objectListTitle('groups', group), segments });
    }
  });

  const domain = timelineDomain(allBounds);
  if (!domain) {
    return { lanes: [], start: 0, end: 0, groupCount: 0, leadershipCount: 0, periodLabel: timeframeLabel(state.timeframe) };
  }
  const startMs = dateKeyTimestamp(domain.start);
  const endMs = dateKeyTimestamp(domain.end);
  const duration = Math.max(1, endMs - startMs);
  const lanes = rawLanes.map((lane) => {
    const segments = lane.segments.flatMap((segment) => {
      const clipped = clipTimelineBounds(segment.bounds, domain);
      if (!clipped) {
        return [];
      }
      const left = ((dateKeyTimestamp(clipped.start) - startMs) / duration) * 100;
      const width = Math.max(0.8, ((dateKeyTimestamp(clipped.end) - dateKeyTimestamp(clipped.start)) / duration) * 100);
      return [{
        ...segment,
        left,
        width,
        openStart: segment.bounds.start === null || segment.bounds.start < domain.start,
        openEnd: segment.bounds.end === null || segment.bounds.end > domain.end,
      }];
    });
    const packed = packTimelineSegments(segments);
    return { ...lane, segments: packed.segments, rowCount: packed.rowCount };
  }).filter((lane) => lane.segments.length);

  return {
    lanes,
    start: domain.start,
    end: domain.end,
    groupCount: lanes.filter((lane) => lane.label !== 'Stammesführung').length,
    leadershipCount: leadershipSegments.length,
    periodLabel: `${dateKeyLabel(domain.start)}–${dateKeyLabel(domain.end)}`,
  };
}

function packTimelineSegments(segments) {
  const rowEnds = [];
  const packed = segments
    .slice()
    .sort((left, right) => left.left - right.left || right.width - left.width)
    .map((segment) => {
      const end = segment.left + segment.width;
      let row = rowEnds.findIndex((rowEnd) => rowEnd <= segment.left);
      if (row === -1) {
        row = rowEnds.length;
      }
      rowEnds[row] = end;
      return { ...segment, row };
    });
  return { segments: packed, rowCount: Math.max(1, rowEnds.length) };
}

function isTribeLeadershipRole(role) {
  const label = foldSearchText(role?.label || role?.name || '');
  return label.includes('stammesfuhrung') && !label.includes('stellv');
}

function timelineDomain(boundsList) {
  const scope = timeframeBounds(state.timeframe);
  if (scope) {
    return scope;
  }
  const combined = combineBounds(boundsList);
  if (!combined) {
    return null;
  }
  const known = boundsList.flatMap((bounds) => [bounds?.start, bounds?.end]).filter(Number.isFinite);
  return {
    start: combined.start ?? Math.min(...known),
    end: combined.end ?? Math.max(...known),
  };
}

function clipTimelineBounds(bounds, domain) {
  const start = Math.max(bounds.start ?? domain.start, domain.start);
  const end = Math.min(bounds.end ?? domain.end, domain.end);
  return start <= end ? { start, end } : null;
}

function timelineTicks(start, end) {
  const startYear = dateKeyToParts(start)?.year;
  const endYear = dateKeyToParts(end)?.year;
  if (!startYear || !endYear) {
    return [];
  }
  const step = Math.max(1, Math.ceil((endYear - startYear + 1) / 10));
  const startMs = dateKeyTimestamp(start);
  const duration = Math.max(1, dateKeyTimestamp(end) - startMs);
  const ticks = [];
  for (let year = startYear; year <= endYear; year += step) {
    ticks.push({
      label: String(year),
      left: ((Date.UTC(year, 0, 1) - startMs) / duration) * 100,
    });
  }
  return ticks;
}

function dateKeyTimestamp(key) {
  const parts = dateKeyToParts(key);
  return parts ? Date.UTC(parts.year, parts.month - 1, parts.day) : 0;
}

function handleVisualizationClick(event) {
  const button = event.target.closest('[data-visualization-target-type][data-visualization-target-id]');
  if (!button) {
    return;
  }
  navigateToVisualizationTarget({
    type: button.dataset.visualizationTargetType,
    id: button.dataset.visualizationTargetId,
    edit: button.dataset.visualizationTargetEdit || '',
  });
}

function setTreeGraphStatus(status, text) {
  if (!status) {
    return;
  }

  status.textContent = text;
  status.hidden = !text;
}

function scheduleContextGraphRender() {
  if (contextGraphTimer) {
    window.clearTimeout(contextGraphTimer);
    contextGraphTimer = 0;
  }

  if (contextGraphFrame) {
    return;
  }

  contextGraphFrame = window.requestAnimationFrame(() => {
    contextGraphFrame = 0;
    renderContextGraph();
  });
}

function scheduleContextGraphRenderSoon() {
  if (contextGraphTimer) {
    window.clearTimeout(contextGraphTimer);
  }

  contextGraphTimer = window.setTimeout(() => {
    contextGraphTimer = 0;
    scheduleContextGraphRender();
  }, 180);
}

function renderContextGraph() {
  if (!contextPanel || !contextGraphContainer) {
    return;
  }

  if (workspace?.hidden || window.getComputedStyle(contextPanel).display === 'none') {
    destroyContextGraph();
    return;
  }

  if ([...visualizationViews, 'users'].includes(currentViewName())) {
    destroyContextGraph();
    return;
  }

  const visNetwork = window.vis;
  if (!visNetwork?.Network || !visNetwork?.DataSet) {
    setTreeGraphStatus(contextGraphStatus, 'Graph-Bibliothek konnte nicht geladen werden.');
    return;
  }

  const graph = contextGraphData();
  if (!graph.nodes.length) {
    destroyContextGraph();
    setTreeGraphStatus(contextGraphStatus, graph.status || 'Kein Kontext.');
    return;
  }

  const signature = JSON.stringify({ view: currentViewName(), graph });
  if (signature === contextGraphSignature && contextNetwork) {
    contextNetwork.redraw();
    applyContextGraphHighlight();
    return;
  }

  contextGraphSignature = signature;
  setContextGraphSnapshot(graph);
  setTreeGraphStatus(contextGraphStatus, '');
  if (contextNetwork) {
    contextNetwork.destroy();
  }

  contextGraphSync.nodeDataSet = new visNetwork.DataSet(graph.nodes);
  contextGraphSync.edgeDataSet = new visNetwork.DataSet(graph.edges);
  contextNetwork = new visNetwork.Network(contextGraphContainer, {
    nodes: contextGraphSync.nodeDataSet,
    edges: contextGraphSync.edgeDataSet,
  }, publicGraphOptions(graph));

  contextNetwork.on('hoverNode', handleContextGraphNodeHover);
  contextNetwork.on('blurNode', handleContextGraphNodeBlur);
  contextNetwork.on('hoverEdge', handleContextGraphEdgeHover);
  contextNetwork.on('blurEdge', handleContextGraphEdgeBlur);
  contextNetwork.on('click', handleContextGraphClick);
  settleGraph(contextNetwork, graph);
  applyContextGraphHighlight();
}

function destroyContextGraph() {
  if (contextNetwork) {
    contextNetwork.destroy();
    contextNetwork = null;
  }
  contextGraphSignature = '';
  resetContextGraphSync();
  clearContextListHighlight();
}

function setContextGraphSnapshot(graph) {
  contextGraphSync.nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  contextGraphSync.edgeById = new Map(graph.edges.map((edge) => [edge.id, edge]));
  contextGraphSync.nodeEdgeIds = new Map();
  contextGraphSync.targetEdgeIds = new Map();

  graph.edges.forEach((edge) => {
    appendContextGraphIndex(contextGraphSync.nodeEdgeIds, edge.from, edge.id);
    appendContextGraphIndex(contextGraphSync.nodeEdgeIds, edge.to, edge.id);

    const target = edge.target || null;
    if (!target?.type || !target.id || !target.edit) {
      return;
    }

    appendContextGraphIndex(
      contextGraphSync.targetEdgeIds,
      contextGraphTargetKey(target.type, target.id, target.edit),
      edge.id,
    );
  });
}

function appendContextGraphIndex(index, key, value) {
  const values = index.get(key) || [];
  if (!values.includes(value)) {
    index.set(key, [...values, value]);
  }
}

function resetContextGraphSync() {
  contextGraphSync.nodeById = new Map();
  contextGraphSync.edgeById = new Map();
  contextGraphSync.nodeEdgeIds = new Map();
  contextGraphSync.targetEdgeIds = new Map();
  contextGraphSync.nodeDataSet = null;
  contextGraphSync.edgeDataSet = null;
  contextGraphSync.passiveNodeIds = [];
  contextGraphSync.passiveEdgeIds = [];
  contextGraphSync.hover = emptyContextGraphHover();
}

function settleGraph(network, graph) {
  if (!network) {
    return;
  }

  let didSettle = false;
  const finish = () => {
    if (didSettle || !network) {
      return;
    }

    didSettle = true;
    network.stopSimulation();
    network.fit({ animation: false, maxZoomLevel: 1.15 });
    if (network.getScale() < 0.72) {
      network.moveTo({ scale: 0.72, animation: false });
    }
  };

  network.once?.('stabilizationIterationsDone', finish);
  window.setTimeout(finish, 1100);
  network.stabilize?.(graphStabilizationIterations(graph));
}

function graphStabilizationIterations(graph) {
  return Math.max(400, Math.min(1000, 200 + ((graph.nodes?.length || 0) * 12)));
}

function graphPhysicsOptions(graph) {
  return {
    enabled: true,
    solver: 'forceAtlas2Based',
    adaptiveTimestep: true,
    maxVelocity: 18,
    minVelocity: 0.22,
    forceAtlas2Based: {
      gravitationalConstant: -100,
      centralGravity: 0.0075,
      springLength: 100,
      springConstant: 0.01,
      damping: 0.5,
      avoidOverlap: 0.95,
    },
    stabilization: {
      enabled: true,
      iterations: graphStabilizationIterations(graph),
      updateInterval: 10,
      fit: true,
    },
  };
}

function graphInteractionOptions() {
  return {
    dragNodes: true,
    dragView: true,
    hover: true,
    hoverConnectedEdges: false,
    tooltipDelay: 140,
    navigationButtons: false,
    keyboard: false,
    selectConnectedEdges: false,
    zoomView: true,
  };
}

function graphEdgeBehaviorOptions() {
  return {
    selectionWidth: 2,
    hoverWidth: 2,
    smooth: {
      enabled: true,
      type: 'cubicBezier',
      forceDirection: 'vertical',
      roundness: 0.4,
    },
  };
}

function handleObjectGraphHover(event) {
  setContextGraphHover(objectGraphHoverTarget(event.target));
}

function handleObjectGraphHoverEnd(event) {
  setContextGraphHover(objectGraphHoverTarget(event.relatedTarget));
}

function objectGraphHoverTarget(element) {
  const navigationLink = element?.closest?.(contextNavigationLinkSelector);
  if (navigationLink) {
    const type = navigationLink.dataset.linkView || '';
    const id = navigationLink.dataset.linkId || '';
    if (objectCollections.includes(type) && id) {
      return { nodeId: contextNodeId(type, id) };
    }
  }

  const reverseTitle = element?.closest?.(
    `[data-group-reverse-row] [data-group-reverse-action="toggle"], ${contextEdgeTargetSelector}:not([data-group-reverse-row])`
  );
  const reverseRow = reverseTitle?.closest?.(contextEdgeTargetSelector);
  if (reverseRow) {
    const edgeIds = contextEdgeIdsForTarget(
      reverseRow.dataset.graphEdgeType || '',
      reverseRow.dataset.graphEdgeId || '',
      reverseRow.dataset.graphEdgeEdit || '',
    );
    if (edgeIds.length) {
      return { edgeIds, allEdgesPrimary: true };
    }
  }

  const row = element?.closest?.('.composite-summary')?.closest?.('.composite-item[data-relationship-row-key]');
  if (row) {
    const owner = row.closest('.object-item[data-object-type][data-object-id]');
    const edgeIds = owner
      ? contextEdgeIdsForTarget(owner.dataset.objectType, owner.dataset.objectId, row.dataset.relationshipRowKey || '')
      : [];
    if (edgeIds.length) {
      return { edgeIds, allEdgesPrimary: true };
    }
  }

  const title = element?.closest?.('.object-title-row[data-object-action="toggle-editor"]');
  const item = title?.closest('.object-item[data-object-type][data-object-id]');
  if (item?.closest('.view.is-active')) {
    const type = item.dataset.objectType || '';
    const id = item.dataset.objectId || '';
    if (objectCollections.includes(type) && id) {
      return { nodeId: contextNodeId(type, id) };
    }
  }

  return {};
}

function emptyContextGraphHover() {
  return {
    nodeId: '',
    edgeIds: [],
    primaryEdgeId: '',
    allEdgesPrimary: false,
  };
}

function setContextGraphHover(target = {}) {
  const edgeIds = Array.from(new Set(target.edgeIds || []));
  contextGraphSync.hover = {
    nodeId: target.nodeId || '',
    edgeIds,
    primaryEdgeId: target.primaryEdgeId || edgeIds[0] || '',
    allEdgesPrimary: target.allEdgesPrimary === true,
  };
  applyContextGraphHighlight();
}

function patchContextGraphHover(changes) {
  setContextGraphHover({ ...contextGraphSync.hover, ...changes });
}

function applyContextGraphHighlight() {
  if (!contextNetwork) {
    return;
  }

  const plan = contextGraphHighlightPlan();
  updatePassiveContextEdges(
    plan.passiveEdgeSourceNodeId,
    plan.selectedEdgeIds,
    plan.relatedPassiveEdgeIds,
  );
  updatePassiveContextNodes(plan.passiveNodeSourceEdgeIds, plan.selectedNodeIds);

  if (plan.selectedNodeIds.length || plan.selectedEdgeIds.length) {
    contextNetwork.setSelection({
      nodes: plan.selectedNodeIds,
      edges: plan.selectedEdgeIds,
    }, { unselectAll: true });
    return;
  }

  contextNetwork.unselectAll();
}

function contextGraphHighlightPlan() {
  const hover = contextGraphSync.hover;
  const activeNodeId = activeContextGraphNodeId();
  const hoveredNodeId = contextGraphSync.nodeById.has(hover.nodeId) ? hover.nodeId : '';
  const selectedNodes = Array.from(new Set([activeNodeId, hoveredNodeId].filter(Boolean)));
  const persistentEdgeIds = persistentContextEditEdgeIds();
  const passiveNodeSources = Array.from(new Set([
    ...persistentEdgeIds,
    ...hover.edgeIds,
    ...(hover.nodeId
      ? contextEdgeIdsForNode(hover.nodeId)
      : []),
  ]));
  const passiveEdgeSource = hover.nodeId || '';
  const relatedPassiveEdgeIds = hover.allEdgesPrimary
    ? []
    : hover.edgeIds.filter((edgeId) => edgeId !== hover.primaryEdgeId);
  const edges = [...persistentEdgeIds];
  if (!hover.nodeId && hover.edgeIds.length) {
    edges.push(...(hover.allEdgesPrimary
      ? hover.edgeIds
      : [hover.primaryEdgeId]
    ).filter((edgeId) => contextGraphSync.edgeById.has(edgeId)));
  }
  const selectedEdges = Array.from(new Set(edges));

  return {
    selectedNodeIds: selectedNodes,
    selectedEdgeIds: selectedEdges,
    passiveNodeSourceEdgeIds: passiveNodeSources,
    passiveEdgeSourceNodeId: passiveEdgeSource,
    relatedPassiveEdgeIds,
  };
}

function activeContextGraphNodeId() {
  const type = currentViewName();
  const id = activeEditingId(type);
  const nodeId = objectCollections.includes(type) && id ? contextNodeId(type, id) : '';
  return nodeId && contextGraphSync.nodeById.has(nodeId) ? nodeId : '';
}

function contextEdgeIdsForNode(nodeId) {
  return nodeId ? contextGraphSync.nodeEdgeIds.get(nodeId) || [] : [];
}

function updatePassiveContextNodes(edgeIds, excludedNodeIds = []) {
  if (!contextGraphSync.nodeDataSet) {
    return;
  }

  if (contextGraphSync.passiveNodeIds.length) {
    contextGraphSync.nodeDataSet.update(contextGraphSync.passiveNodeIds.map((id) => {
      const node = contextGraphSync.nodeById.get(id);
      return {
        id,
        color: contextNodeBaseColor(node?.group || ''),
        borderWidth: node?.group === 'focus' ? 2 : 1,
        borderWidthSelected: 5,
      };
    }));
  }

  const sourceIds = Array.isArray(edgeIds) ? edgeIds : [edgeIds].filter(Boolean);
  const excluded = new Set(Array.isArray(excludedNodeIds) ? excludedNodeIds : [excludedNodeIds].filter(Boolean));
  contextGraphSync.passiveNodeIds = Array.from(new Set(sourceIds.flatMap((edgeId) => {
    const edge = contextGraphSync.edgeById.get(edgeId);
    return edge ? [edge.from, edge.to] : [];
  }))).filter((id) => !excluded.has(id));

  if (contextGraphSync.passiveNodeIds.length) {
    contextGraphSync.nodeDataSet.update(contextGraphSync.passiveNodeIds.map((id) => {
      const node = contextGraphSync.nodeById.get(id);
      const color = contextNodeBaseColor(node?.group || '');
      return {
        id,
        color: { ...color, border: '#ffff00' },
        borderWidth: 1,
        borderWidthSelected: 1,
      };
    }));
  }
}

function contextNodeBaseColor(group) {
  const color = {
    focus: { border: '#ffff00', background: '#2a2711' },
    person: { border: '#ef859d', background: '#2a1820' },
    group: { border: '#d8d85a', background: '#1f2118' },
    groupType: { border: '#00b74f', background: '#12231a' },
    role: { border: '#8e7fae', background: '#201a2b' },
    timepoint: { border: '#ef7d00', background: '#2a1c10' },
  }[group] || { border: 'rgba(216,216,90,0.48)', background: '#151b20' };
  return {
    ...color,
    highlight: { border: '#ffff00', background: color.background },
    hover: { border: '#ffff00', background: color.background },
  };
}

function updatePassiveContextEdges(nodeId, excludedEdgeIds = [], relatedEdgeIds = []) {
  if (!contextGraphSync.edgeDataSet) {
    return;
  }

  if (contextGraphSync.passiveEdgeIds.length) {
    contextGraphSync.edgeDataSet.update(contextGraphSync.passiveEdgeIds.map((id) => {
      const edge = contextGraphSync.edgeById.get(id);
      return {
        id,
        color: {
          color: 'rgba(195,201,197,0.62)',
          highlight: '#d8d85a',
          hover: '#d8d85a',
          inherit: false,
        },
        width: edge?.width || 1.6,
        selectionWidth: edge?.selectionWidth ?? 2,
        hoverWidth: edge?.hoverWidth ?? 2,
        font: {
          color: '#cfd6d2',
          strokeColor: '#0b0f12',
          strokeWidth: 4,
        },
      };
    }));
  }

  const excluded = new Set(excludedEdgeIds);
  const nodeEdgeIds = contextEdgeIdsForNode(nodeId);
  contextGraphSync.passiveEdgeIds = Array.from(new Set([...nodeEdgeIds, ...relatedEdgeIds]))
    .filter((id) => !excluded.has(id));

  if (contextGraphSync.passiveEdgeIds.length) {
    contextGraphSync.edgeDataSet.update(contextGraphSync.passiveEdgeIds.map((id) => ({
      id,
      color: {
        color: '#ffff00',
        highlight: '#ffff00',
        hover: '#ffff00',
        inherit: false,
      },
      width: contextGraphSync.edgeById.get(id)?.width || 1.6,
      selectionWidth: 0,
      hoverWidth: 0,
      font: {
        color: '#fbf7de',
        strokeColor: '#0b0f12',
        strokeWidth: 4,
      },
    })));
  }
}

function handleContextGraphNodeHover(params) {
  const target = contextNodeTarget(params.node);
  if (!target) {
    return;
  }

  setContextGraphHover({ nodeId: params.node });
  if (!setContextListHighlight(target.type, target.id)) {
    highlightContextEdgeTargetForNode(params.node);
  }
}

function handleContextGraphNodeBlur(params) {
  if (contextGraphSync.hover.nodeId === params.node) {
    patchContextGraphHover({ nodeId: '' });
  }
  clearContextListHighlight();
}

function handleContextGraphClick(params) {
  const edgeId = params.edges?.[0] || '';
  if (edgeId && !params.nodes?.length) {
    void openContextGraphEdgeTarget(contextGraphEdgeTarget(edgeId));
    window.setTimeout(applyContextGraphHighlight, 0);
    return;
  }

  const nodeId = params.nodes?.[0] || '';
  if (!nodeId) {
    window.setTimeout(applyContextGraphHighlight, 0);
    return;
  }

  void openContextGraphTarget(contextNodeTarget(nodeId));
  window.setTimeout(applyContextGraphHighlight, 0);
}

async function openContextGraphEdgeTarget(target) {
  if (!target?.type || !target.id || !target.edit) {
    return;
  }

  const currentType = currentViewName();
  const currentId = activeEditingId(currentType);
  const currentItem = objectItemElement(currentType, currentId);
  if (!currentItem) {
    await openContextGraphTarget(target);
    return;
  }

  if (toggleContextNestedEditTarget(currentItem, currentType, currentId, target)) {
    return;
  }

  if (currentType === 'groups') {
    toggleContextGroupReverseTarget(currentItem, currentId, target);
  }
}

function toggleContextNestedEditTarget(item, type, id, target) {
  if (target.type !== type || target.id !== id || !validNestedEditKey(target.edit)) {
    return false;
  }

  const row = item.querySelector(`[data-relationship-row-key="${cssEscape(target.edit)}"]`);
  if (row && !row.classList.contains('is-collapsed')) {
    if (elementInScrollView(row)) {
      closeNestedEditRow(row);
    } else {
      scrollElementIntoView(row);
    }
    return true;
  }

  state.relationshipEditing[objectKey(type, id)] = target.edit;
  openNestedEditRow(type, id, target.edit);
  writeUrlState({ view: type, id, edit: target.edit });
  applyContextGraphHighlight();
  return true;
}

function toggleContextGroupReverseTarget(groupItem, groupId, target) {
  const row = contextGraphReverseRow(groupItem, target.type, target.id, target.edit);
  if (!row) {
    return;
  }

  if (!row.classList.contains('is-collapsed')) {
    if (elementInScrollView(row)) {
      row.classList.add('is-collapsed');
      row.querySelector('[data-group-reverse-action="toggle"]')?.setAttribute('aria-expanded', 'false');
      delete state.groupRelationEditing[objectKey('groups', groupId)];
      applyContextGraphHighlight();
    } else {
      scrollElementIntoView(row);
    }
    return;
  }

  collapseGroupEditRows(groupItem, row);
  const key = objectKey('groups', groupId);
  state.groupRelationEditing[key] = row.dataset.groupReverseKey || '';
  row.classList.remove('is-collapsed');
  row.querySelector('[data-group-reverse-action="toggle"]')?.setAttribute('aria-expanded', 'true');
  writeUrlState({ view: 'groups', id: groupId, edit: '' });
  scrollElementIntoView(row);
  applyContextGraphHighlight();
}

function handleContextGraphEdgeHover(params) {
  const target = contextGraphEdgeTarget(params.edge);
  if (!target) {
    return;
  }

  const edgeIds = contextEdgeIdsForTarget(target.type, target.id, target.edit || '');
  patchContextGraphHover({
    edgeIds,
    primaryEdgeId: params.edge,
    allEdgesPrimary: false,
  });
  setContextListHighlight(target.type, target.id, target.edit || '');
}

function handleContextGraphEdgeBlur(params) {
  if (contextGraphSync.hover.edgeIds.includes(params.edge)) {
    patchContextGraphHover({
      edgeIds: [],
      primaryEdgeId: '',
      allEdgesPrimary: false,
    });
  }
  clearContextListHighlight();
}

async function openContextGraphTarget(target) {
  if (!target?.type || !target.id) {
    return;
  }
  const edit = validNestedEditKey(target.edit || '') ? target.edit : '';

  if (focusExistingCreateForm(contextGraphContainer)) {
    return;
  }

  if (await toggleVisibleContextGraphTarget(target.type, target.id, edit)) {
    return;
  }

  if (!(await canSwitchToView(target.type))) {
    return;
  }

  clearCollectionNarrowingForDeepLink(target.type);
  expandCollectionVisibleCountToObject(target.type, target.id);
  renderCollectionControls();
  activateView(target.type, { id: target.id, edit });
  await refreshActivatedView(target.type);

  let item = objectItemElement(target.type, target.id);
  if (!item) {
    state.deepLinkTarget = { view: target.type, id: target.id, edit };
    renderObjectCollection(target.type);
    item = objectItemElement(target.type, target.id);
  }

  if (item) {
    if (edit) {
      state.relationshipEditing[objectKey(target.type, target.id)] = edit;
    }
    if (!state.editing[objectKey(target.type, target.id)]) {
      await focusObjectEditor(item);
    } else {
      writeUrlState({ view: target.type, id: target.id, edit });
    }
    if (edit) {
      openNestedEditRow(target.type, target.id, edit);
    }
  }
}

async function toggleVisibleContextGraphTarget(type, id, edit = '') {
  if (currentViewName() !== type) {
    return false;
  }

  const item = objectItemElement(type, id);
  const key = objectKey(type, id);
  if (!item || !state.editing[key]) {
    return false;
  }

  if (!edit) {
    if (elementInScrollView(item)) {
      await closeObjectEditor(item);
    } else {
      scrollObjectEditorIntoView(type, id, item.parentElement?.id || '');
    }
    return true;
  }

  const row = item.querySelector(`[data-relationship-row-key="${cssEscape(edit)}"]`);
  const isRowOpen = row && !row.classList.contains('is-collapsed');
  if (!row || !isRowOpen) {
    return false;
  }

  if (elementInScrollView(row)) {
    closeNestedEditRow(row);
  } else {
    scrollElementIntoView(row);
  }
  return true;
}

function closeNestedEditRow(row) {
  const fieldRoot = row.closest('[data-object-field]');
  const ownerItem = row.closest('[data-object-type][data-object-id]');
  if (!fieldRoot || !ownerItem) {
    return false;
  }

  row.classList.add('is-collapsed');
  row.querySelector('[data-list-action="toggle"]')?.setAttribute('aria-expanded', 'false');
  syncNestedEditUrl(fieldRoot, row, false);
  return true;
}

function elementInScrollView(element) {
  if (!element) {
    return false;
  }

  const scrollRoot = appScrollRoot();
  const rootRect = scrollRoot === document.documentElement
    ? { top: 0, bottom: window.innerHeight || document.documentElement.clientHeight }
    : scrollRoot.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const margin = 16;
  const usableHeight = rootRect.bottom - rootRect.top - (margin * 2);
  if (rect.height > usableHeight) {
    return rect.top >= rootRect.top - 2 && rect.top < rootRect.top + margin + 48;
  }

  return rect.top >= rootRect.top - 2 && rect.bottom <= rootRect.bottom - margin;
}

function setContextListHighlight(type, id, edit = '') {
  return showContextListHighlights(contextListHighlightElements(type, id, edit));
}

function contextListHighlightElements(type, id, edit = '') {
  const activeType = currentViewName();
  const activeId = activeEditingId(activeType);
  const activeItem = objectItemElement(activeType, activeId);
  const activeRoot = activeItem || document.querySelector('.view.is-active');
  const links = contextNavigationLinks(activeRoot, type, id);
  if (!edit && (type !== activeType || id !== activeId) && links.length) {
    return links;
  }

  if (activeType === type) {
    const item = objectItemElement(type, id);
    if (item?.closest('.view.is-active')) {
      const row = edit ? item.querySelector(`[data-relationship-row-key="${cssEscape(edit)}"]`) : null;
      const target = row?.querySelector('.composite-summary')
        || item.querySelector('.object-title-row[data-object-action="toggle-editor"]')
        || row
        || item;
      return [target];
    }
  }

  if (activeType !== 'groups' || !edit) {
    return links;
  }

  const groupId = activeEditingId('groups');
  const groupItem = objectItemElement('groups', groupId);
  const reverseRow = contextGraphReverseRow(groupItem, type, id, edit);
  if (!reverseRow) {
    return [];
  }

  return [reverseRow.querySelector('[data-group-reverse-action="toggle"]') || reverseRow];
}

function contextNavigationLinks(root, type, id) {
  return Array.from(root?.querySelectorAll(contextNavigationLinkSelector) || [])
    .filter((link) => link.dataset.linkView === type && link.dataset.linkId === id);
}

function showContextListHighlights(elements) {
  clearContextListHighlight();
  contextGraphSync.listHighlights = Array.from(new Set((elements || []).filter(Boolean)));
  contextGraphSync.listHighlights.forEach((element) => element.classList.add('is-graph-highlighted'));
  return contextGraphSync.listHighlights.length > 0;
}

function contextGraphReverseRow(groupItem, type, id, edit) {
  if (!groupItem || !type || !id || !edit) {
    return null;
  }

  return groupItem.querySelector(
    `[data-group-reverse-row][data-graph-edge-type="${cssEscape(type)}"]`
      + `[data-graph-edge-id="${cssEscape(id)}"]`
      + `[data-graph-edge-edit="${cssEscape(edit)}"]`
  );
}

function clearContextListHighlight() {
  contextGraphSync.listHighlights.forEach((element) => {
    element.classList.remove('is-graph-highlighted');
  });
  contextGraphSync.listHighlights = [];
}

function contextNodeTarget(nodeId) {
  const raw = String(nodeId || '');
  const separator = raw.indexOf(':');
  if (separator <= 0) {
    return null;
  }

  const type = raw.slice(0, separator);
  const id = raw.slice(separator + 1);
  if (!objectCollections.includes(type) || !id) {
    return null;
  }

  return { type, id };
}

function contextEdgeIdsForTarget(type, id, edit) {
  if (!type || !id || !edit) {
    return [];
  }

  return contextGraphSync.targetEdgeIds.get(contextGraphTargetKey(type, id, edit)) || [];
}

function contextGraphEdgeTarget(edgeId) {
  return contextGraphSync.edgeById.get(edgeId)?.target || null;
}

function contextGraphTargetKey(type, id, edit) {
  return JSON.stringify([type, id, edit]);
}

function persistentContextEditEdgeIds() {
  const target = activeContextEditTarget();
  return target ? contextEdgeIdsForTarget(target.type, target.id, target.edit) : [];
}

function activeContextEditTarget() {
  const type = currentViewName();
  const id = activeEditingId(type);
  if (!objectCollections.includes(type) || !id) {
    return null;
  }

  const key = objectKey(type, id);
  const nestedEdit = state.relationshipEditing[key] || '';
  if (nestedEdit) {
    return { type, id, edit: nestedEdit };
  }

  if (type !== 'groups') {
    return null;
  }

  const reverseEdit = String(state.groupRelationEditing[key] || '');
  const match = /^(membership|activity):([^:]+):(\d+)$/.exec(reverseEdit);
  if (!match) {
    return null;
  }

  const field = match[1] === 'activity' ? 'activities' : 'memberships';
  return { type: 'people', id: match[2], edit: `${field}:${match[3]}` };
}

function highlightContextEdgeTargetForNode(nodeId) {
  let match = null;
  for (const edge of contextGraphSync.edgeById.values()) {
    const target = contextGraphEdgeTarget(edge.id);
    if (!target?.edit || (edge.from !== nodeId && edge.to !== nodeId)) {
      continue;
    }

    const listHighlights = contextListHighlightElements(target.type, target.id, target.edit);
    if (listHighlights.length) {
      match = { edge, target, listHighlights };
      break;
    }
  }
  if (!match) {
    return false;
  }

  showContextListHighlights(match.listHighlights);
  const { edge, target } = match;
  const edgeIds = contextEdgeIdsForTarget(target.type, target.id, target.edit || '');
  setContextGraphHover({
    nodeId: contextGraphSync.hover.nodeId,
    edgeIds,
    primaryEdgeId: edge.id,
  });
  return true;
}

function contextGraphData() {
  const activeObject = activeContextObject();
  if (activeObject) {
    return filterContextGraphData(objectContextGraphData(activeObject.type, activeObject.object, { focus: true, status: 'Bearbeitung' }));
  }

  const view = currentViewName();
  if (!objectCollections.includes(view)) {
    return { nodes: [], edges: [], layout: 'context', status: '' };
  }

  const objects = collectionObjects(view).slice(0, 28);
  return filterContextGraphData(collectionContextGraphData(view, objects));
}

function filterContextGraphData(graph) {
  const enabledTypes = enabledContextGraphTypes();
  if (enabledTypes.size >= objectCollections.length) {
    return graph;
  }

  const nodes = graph.nodes.filter((node) => enabledTypes.has(node.type || contextTypeFromNodeId(node.id)));
  const nodeIds = new Set(nodes.map((node) => node.id));
  return {
    ...graph,
    nodes,
    edges: graph.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)),
    status: graph.nodes.length && !nodes.length ? 'Keine passenden Kontext-Typen.' : graph.status,
  };
}

function enabledContextGraphTypes() {
  const forcedType = currentContextGraphForcedType();
  return new Set(objectCollections.filter((type) => type === forcedType || state.contextGraphTypes[type] !== false));
}

function activeContextObject() {
  const editor = document.querySelector('.view.is-active [data-object-editor]');
  const item = editor?.closest('[data-object-type][data-object-id]');
  if (!item) {
    return null;
  }

  const type = item.dataset.objectType || '';
  const id = item.dataset.objectId || '';
  if (!objectCollections.includes(type) || !id) {
    return null;
  }

  const saved = findReferenceObject(type, id) || {};
  let payload = {};
  try {
    payload = collectObjectFields(item);
  } catch (_error) {
    payload = {};
  }

  return { type, object: { ...saved, ...payload, _id: id } };
}

function collectionContextGraphData(type, objects) {
  const graph = createContextGraph(`${labels[type] || type}: ${objects.length}`);
  objects.forEach((object, index) => addObjectRelations(graph, type, object, {
    focus: false,
    compact: true,
    rowIndex: index,
    collectionType: type,
  }));
  return finishContextGraph(graph);
}

function objectContextGraphData(type, object, options = {}) {
  const graph = createContextGraph(options.status || objectListTitle(type, object));
  addObjectRelations(graph, type, object, { ...options, compact: false });
  return finishContextGraph(graph);
}

function createContextGraph(status = '') {
  return {
    nodes: [],
    edges: [],
    nodeMap: new Map(),
    edgeIds: new Set(),
    placementPriorities: new Map(),
    layout: 'context',
    status,
  };
}

function finishContextGraph(graph) {
  graph.nodes = Array.from(graph.nodeMap.values());
  delete graph.nodeMap;
  delete graph.edgeIds;
  delete graph.placementPriorities;
  return graph;
}

function addObjectRelations(graph, type, object, options = {}) {
  if (!objectId(object)) {
    return;
  }

  if (type === 'people') {
    addPersonContext(graph, object, options);
  } else if (type === 'groups') {
    addGroupContext(graph, object, options);
  } else if (type === 'group-types') {
    addGroupTypeContext(graph, object, options);
  } else if (type === 'roles') {
    addRoleContext(graph, object, options);
  } else if (type === 'timepoints') {
    addTimepointContext(graph, object, options);
  }
}

function placePrimaryContextNode(graph, nodeId, options = {}) {
  if (!nodeId) {
    return;
  }

  if (Number.isInteger(options.rowIndex)) {
    placeContextNode(graph, nodeId, 0, contextRowY(options.rowIndex), 20);
    return;
  }

  if (options.focus) {
    placeContextNode(graph, nodeId, 0, 0, 30);
  }
}

function placeRelationContextNode(graph, nodeId, options = {}, relation = 'context', index = 0, total = 1) {
  if (!nodeId) {
    return;
  }

  const safeTotal = Math.max(1, Number(total) || 1);
  const safeIndex = Math.max(0, Number(index) || 0);
  const rowMode = Number.isInteger(options.rowIndex);
  const baseY = rowMode ? contextRowY(options.rowIndex) : 0;
  const compactOffset = (safeIndex - ((safeTotal - 1) / 2)) * 44;
  const focusOffset = 92 + (safeIndex * 58);
  const priority = contextRelationPriority(relation);

  if (rowMode) {
    const x = {
      membership: -250,
      phase: -250,
      parent: -250,
      groupType: -250,
      person: -250,
      activity: 250,
      child: 250,
      group: 250,
      role: 250,
    }[relation] || 180;
    const unorderedX = x + compactOffset;
    const y = ['child', 'group', 'person', 'parent', 'groupType', 'role'].includes(relation)
      ? baseY
      : baseY + compactOffset;
    placeContextNode(graph, nodeId, ['child', 'group', 'person', 'parent', 'groupType', 'role'].includes(relation) ? unorderedX : x, y, priority);
    return;
  }

  if (relation === 'membership' || relation === 'phase' || relation === 'parent' || relation === 'groupType') {
    const unordered = relation === 'parent' || relation === 'groupType';
    placeContextNode(
      graph,
      nodeId,
      unordered ? compactOffset * 1.7 : 0,
      unordered ? -108 : -(92 + ((safeTotal - 1 - safeIndex) * 58)),
      priority,
    );
    return;
  }

  if (relation === 'activity' || relation === 'child' || relation === 'group' || relation === 'person' || relation === 'role') {
    const unordered = relation === 'child' || relation === 'group' || relation === 'person' || relation === 'role';
    placeContextNode(
      graph,
      nodeId,
      unordered ? compactOffset * 1.7 : 0,
      unordered ? 108 : focusOffset,
      priority,
    );
    return;
  }

  placeContextNode(graph, nodeId, 0, focusOffset, priority);
}

function placeContextNode(graph, nodeId, x, y, priority = 0) {
  const node = graph.nodeMap.get(nodeId);
  if (!node) {
    return;
  }

  const previous = graph.placementPriorities.get(nodeId) ?? -Infinity;
  if (priority < previous) {
    return;
  }

  graph.placementPriorities.set(nodeId, priority);
  node.x = Math.round(x);
  node.y = Math.round(y);
}

function contextRelationPriority(relation) {
  return {
    membership: 14,
    phase: 14,
    parent: 13,
    groupType: 13,
    activity: 12,
    child: 11,
    group: 11,
    person: 11,
    role: 11,
  }[relation] || 10;
}

function contextRowY(index) {
  return index * 170;
}

function contextPeriodEntries(values, collection, idGetter, secondaryGetter = null) {
  return (Array.isArray(values) ? values : [])
    .map((value, index) => ({
      value,
      index,
      label: [
        secondaryGetter ? secondaryGetter(value) : '',
        objectListTitle(collection, findReferenceObject(collection, idGetter(value)) || {}),
      ].filter(Boolean).join(' '),
    }))
    .sort((left, right) => contextPeriodCompare(left.value?.period, right.value?.period, left.label, right.label));
}

function contextPeriodCompare(leftPeriod, rightPeriod, leftLabel = '', rightLabel = '') {
  const leftStart = periodStartSortKey(leftPeriod);
  const rightStart = periodStartSortKey(rightPeriod);
  const leftValue = Number.isFinite(leftStart) ? leftStart : Number.MAX_SAFE_INTEGER;
  const rightValue = Number.isFinite(rightStart) ? rightStart : Number.MAX_SAFE_INTEGER;
  if (leftValue !== rightValue) {
    return leftValue - rightValue;
  }

  return sortCollator.compare(String(leftLabel || ''), String(rightLabel || ''));
}

function addPersonContext(graph, person, options = {}) {
  const personNode = addContextNode(graph, 'people', person, options.focus);
  placePrimaryContextNode(graph, personNode, options);
  const memberships = Array.isArray(person.memberships) ? person.memberships : [];
  const activities = Array.isArray(person.activities) ? person.activities : [];

  const membershipEntries = contextPeriodEntries(memberships, 'groups', periodEntryGroupId)
    .filter(({ value }) => relationshipRelevantToTimeframe('membership', value))
    .slice(0, options.compact ? 4 : 16);
  const activityEntries = contextPeriodEntries(activities, 'groups', periodEntryGroupId, (activity) => objectLabel(findReferenceObject('roles', activityRoleId(activity)), 'roles'))
    .filter(({ value }) => relationshipRelevantToTimeframe('activity', value))
    .slice(0, options.compact ? 4 : 16);

  membershipEntries.forEach(({ value: membership, index }, slot) => {
    const group = findReferenceObject('groups', periodEntryGroupId(membership));
    const groupNode = addContextNode(graph, 'groups', group);
    placeRelationContextNode(graph, groupNode, options, 'membership', slot, membershipEntries.length);
    addContextEdge(graph, personNode, groupNode, ['Mitgliedschaft', relationshipPeriodLabel(membership.period)].filter(Boolean).join('\n'), 'membership', {
      type: 'people',
      id: objectId(person),
      edit: `memberships:${index}`,
    });
  });

  activityEntries.forEach(({ value: activity, index }, slot) => {
    const group = findReferenceObject('groups', periodEntryGroupId(activity));
    const groupNode = addContextNode(graph, 'groups', group);
    placeRelationContextNode(graph, groupNode, options, 'activity', slot, activityEntries.length);
    const role = objectLabel(findReferenceObject('roles', activityRoleId(activity)), 'roles') || 'Aktivität';
    addContextEdge(graph, personNode, groupNode, [role, relationshipPeriodLabel(activity.period)].filter(Boolean).join('\n'), 'activity', {
      type: 'people',
      id: objectId(person),
      edit: `activities:${index}`,
    });
  });
}

function addGroupContext(graph, group, options = {}) {
  const groupNode = addContextNode(graph, 'groups', group, options.focus);
  placePrimaryContextNode(graph, groupNode, options);
  const phaseEntries = groupPhaseEntries(group)
    .filter(({ phase }) => relationshipRelevantToTimeframe('phase', phase))
    .sort((left, right) => contextPeriodCompare(left.phase?.period, right.phase?.period, objectLabel(findReferenceObject('group-types', groupPhaseTypeId(left.phase)), 'group-types'), objectLabel(findReferenceObject('group-types', groupPhaseTypeId(right.phase)), 'group-types')));
  phaseEntries.forEach(({ phase, rowKey }, slot) => {
    const typeNode = addContextNode(graph, 'group-types', findReferenceObject('group-types', groupPhaseTypeId(phase)));
    placeRelationContextNode(graph, typeNode, options, 'phase', slot, phaseEntries.length);
    const target = { type: 'groups', id: objectId(group), edit: rowKey };
    addContextEdge(graph, typeNode, groupNode, periodYearLabel(phase.period), 'type', target);

    const parentNode = addContextNode(graph, 'groups', findReferenceObject('groups', groupPhaseParentGroupId(phase)));
    placeRelationContextNode(graph, parentNode, options, 'parent', slot, phaseEntries.length);
    addContextEdge(graph, parentNode, groupNode, periodYearLabel(phase.period), 'parent', target);
  });

  const limit = options.compact ? 5 : 18;
  let used = 0;
  (state.objects.people || []).some((person) => {
    const personNode = addContextNode(graph, 'people', person);
    let matched = false;
    (Array.isArray(person.memberships) ? person.memberships : []).forEach((membership, index) => {
      if (periodEntryGroupId(membership) === objectId(group) && relationshipRelevantToTimeframe('membership', membership)) {
        matched = true;
        placeRelationContextNode(graph, personNode, options, 'membership', used, limit);
        addContextEdge(graph, personNode, groupNode, ['Mitgliedschaft', relationshipPeriodLabel(membership.period)].filter(Boolean).join('\n'), 'membership', {
          type: 'people',
          id: objectId(person),
          edit: `memberships:${index}`,
        });
      }
    });
    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, index) => {
      if (periodEntryGroupId(activity) === objectId(group) && relationshipRelevantToTimeframe('activity', activity)) {
        matched = true;
        const role = objectLabel(findReferenceObject('roles', activityRoleId(activity)), 'roles') || 'Aktivität';
        placeRelationContextNode(graph, personNode, options, 'activity', used, limit);
        addContextEdge(graph, personNode, groupNode, [role, relationshipPeriodLabel(activity.period)].filter(Boolean).join('\n'), 'activity', {
          type: 'people',
          id: objectId(person),
          edit: `activities:${index}`,
        });
      }
    });
    if (!matched) {
      removeContextNodeIfLoose(graph, personNode);
    }
    used += matched ? 1 : 0;
    return used >= limit;
  });
}

function addGroupTypeContext(graph, groupType, options = {}) {
  const typeNode = addContextNode(graph, 'group-types', groupType, options.focus);
  placePrimaryContextNode(graph, typeNode, options);
  const parentNode = addContextNode(graph, 'group-types', findReferenceObject('group-types', groupTypeParentGroupTypeId(groupType)));
  placeRelationContextNode(graph, parentNode, options, 'parent', 0, 1);
  addContextEdge(graph, parentNode, typeNode, 'untergeordnet', 'type', {
    type: 'group-types',
    id: objectId(groupType),
  });

  (state.groupTypes || []).sort((left, right) => sortCollator.compare(objectListTitle('group-types', left), objectListTitle('group-types', right))).forEach((candidate, index) => {
    if (groupTypeParentGroupTypeId(candidate) === objectId(groupType)) {
      const childNode = addContextNode(graph, 'group-types', candidate);
      placeRelationContextNode(graph, childNode, options, 'child', index, 8);
      addContextEdge(graph, typeNode, childNode, 'untergeordnet', 'type', {
        type: 'group-types',
        id: objectId(candidate),
      });
    }
  });

  (state.objects.groups || [])
    .filter((group) => objectRelevantToTimeframe('groups', group) && groupTypeIds(group).includes(objectId(groupType)))
    .sort((left, right) => compareCollectionObjects('groups', left, right))
    .slice(0, options.compact ? 5 : 18)
    .forEach((group, index) => {
      const groupNode = addContextNode(graph, 'groups', group);
      placeRelationContextNode(graph, groupNode, options, 'group', index, options.compact ? 5 : 18);
      addContextEdge(graph, typeNode, groupNode, 'Gruppe', 'type', {
        type: 'groups',
        id: objectId(group),
      });
    });

  (state.objects.roles || [])
    .filter((role) => roleGroupTypeIds(role).includes(objectId(groupType)))
    .sort((left, right) => compareCollectionObjects('roles', left, right))
    .slice(0, options.compact ? 5 : 18)
    .forEach((role, index) => {
      const roleNode = addContextNode(graph, 'roles', role);
      placeRelationContextNode(graph, roleNode, options, 'role', index, options.compact ? 5 : 18);
      addContextEdge(graph, roleNode, typeNode, 'nutzbar für', 'type', {
        type: 'roles',
        id: objectId(role),
      });
    });
}

function addRoleContext(graph, role, options = {}) {
  const roleNode = addContextNode(graph, 'roles', role, options.focus);
  placePrimaryContextNode(graph, roleNode, options);
  roleGroupTypeIds(role).forEach((typeId, index) => {
    const typeNode = addContextNode(graph, 'group-types', findReferenceObject('group-types', typeId));
    placeRelationContextNode(graph, typeNode, options, 'groupType', index, roleGroupTypeIds(role).length);
    addContextEdge(graph, roleNode, typeNode, 'nutzbar für', 'type');
  });

  const limit = options.compact ? 5 : 18;
  let used = 0;
  (state.objects.people || []).some((person) => {
    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, index) => {
      if (activityRoleId(activity) !== objectId(role) || used >= limit || !relationshipRelevantToTimeframe('activity', activity)) {
        return;
      }
      used += 1;
      const personNode = addContextNode(graph, 'people', person);
      const groupNode = addContextNode(graph, 'groups', findReferenceObject('groups', periodEntryGroupId(activity)));
      const target = { type: 'people', id: objectId(person), edit: `activities:${index}` };
      placeRelationContextNode(graph, personNode, options, 'person', used - 1, limit);
      placeRelationContextNode(graph, groupNode, options, 'group', used - 1, limit);
      addContextEdge(graph, personNode, roleNode, relationshipPeriodLabel(activity.period), 'activity', target);
      addContextEdge(graph, roleNode, groupNode, objectLabel(findReferenceObject('groups', periodEntryGroupId(activity)), 'groups'), 'activity', target);
    });
    return used >= limit;
  });
}

function addTimepointContext(graph, timepoint, options = {}) {
  const timepointNode = addContextNode(graph, 'timepoints', timepoint, options.focus);
  placePrimaryContextNode(graph, timepointNode, options);
  const limit = options.compact ? 5 : 18;
  let used = 0;

  (state.objects.groups || []).some((group) => {
    groupPhaseEntries(group).forEach(({ phase, rowKey }) => {
      if (used >= limit || !relationshipRelevantToTimeframe('phase', phase) || !periodTouchesTimepoint(timepoint, phase.period)) {
        return;
      }
      used += 1;
      const groupNode = addContextNode(graph, 'groups', group);
      placeRelationContextNode(graph, groupNode, options, 'phase', used - 1, limit);
      addContextEdge(graph, groupNode, timepointNode, objectLabel(findReferenceObject('group-types', groupPhaseTypeId(phase)), 'group-types') || 'Phase', 'time', {
        type: 'groups',
        id: objectId(group),
        edit: rowKey,
      });
    });
    return used >= limit;
  });

  (state.objects.people || []).some((person) => {
    (Array.isArray(person.memberships) ? person.memberships : []).forEach((membership, index) => {
      if (used >= limit || !relationshipRelevantToTimeframe('membership', membership) || !periodTouchesTimepoint(timepoint, membership.period)) {
        return;
      }
      used += 1;
      const personNode = addContextNode(graph, 'people', person);
      placeRelationContextNode(graph, personNode, options, 'membership', used - 1, limit);
      addContextEdge(graph, personNode, timepointNode, objectLabel(findReferenceObject('groups', periodEntryGroupId(membership)), 'groups') || 'Mitgliedschaft', 'time', {
        type: 'people',
        id: objectId(person),
        edit: `memberships:${index}`,
      });
    });
    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, index) => {
      if (used >= limit || !relationshipRelevantToTimeframe('activity', activity) || !periodTouchesTimepoint(timepoint, activity.period)) {
        return;
      }
      used += 1;
      const personNode = addContextNode(graph, 'people', person);
      placeRelationContextNode(graph, personNode, options, 'activity', used - 1, limit);
      addContextEdge(graph, personNode, timepointNode, objectLabel(findReferenceObject('roles', activityRoleId(activity)), 'roles') || 'Aktivität', 'time', {
        type: 'people',
        id: objectId(person),
        edit: `activities:${index}`,
      });
    });
    return used >= limit;
  });
}

function periodTouchesTimepoint(timepoint, period) {
  return periodBoundaryMatchesTimepoint(timepoint, period, 'start') || periodBoundaryMatchesTimepoint(timepoint, period, 'end');
}

function addContextNode(graph, type, object, focus = false) {
  if (!object || !objectId(object)) {
    return '';
  }

  const id = contextNodeId(type, objectId(object));
  const existing = graph.nodeMap.get(id);
  if (existing) {
    if (focus) {
      existing.group = 'focus';
    }
    return id;
  }

  const meta = objectListMeta(type, object);
  graph.nodeMap.set(id, {
    id,
    type,
    label: publicGraphEntryLabel([
      objectListTitle(type, object),
      meta,
    ]),
    group: focus ? 'focus' : contextNodeGroup(type),
    shape: contextNodeShape(type),
  });
  return id;
}

function removeContextNodeIfLoose(graph, nodeId) {
  if (!nodeId) {
    return;
  }

  const hasEdge = graph.edges.some((edge) => edge.from === nodeId || edge.to === nodeId);
  if (!hasEdge) {
    graph.nodeMap.delete(nodeId);
  }
}

function addContextEdge(graph, from, to, label = '', group = 'context', target = null) {
  if (!from || !to || from === to) {
    return;
  }

  const targetKey = target ? `${target.type || ''}:${target.id || ''}:${target.edit || ''}` : '';
  const id = `${from}->${to}:${group}:${label}:${targetKey}`;
  if (graph.edgeIds.has(id)) {
    return;
  }

  graph.edgeIds.add(id);
  const smooth = contextEdgeSmooth(graph, from, to);
  graph.edges.push({
    id,
    from,
    to,
    label: publicGraphEdgeLabel(String(label || '').split('\n')),
    group,
    target,
    arrows: 'to',
    smooth,
    selectionWidth: 2,
    hoverWidth: 2,
    width: group === 'activity' ? 2.1 : 1.5,
  });
}

function contextEdgeSmooth(graph, from, to) {
  const fromNode = graph.nodeMap.get(from) || {};
  const toNode = graph.nodeMap.get(to) || {};
  const connectedCount = graph.edges.filter((edge) => (
    edge.from === from
    || edge.to === from
    || edge.from === to
    || edge.to === to
  )).length;
  const sameColumn = Math.abs(Number(fromNode.x || 0) - Number(toNode.x || 0)) < 80;
  const lane = connectedCount % 5;
  const direction = connectedCount % 2 === 0 ? 'curvedCW' : 'curvedCCW';
  const roundness = (sameColumn ? 0.24 : 0.14) + (lane * 0.055);

  return {
    enabled: true,
    type: direction,
    roundness: Math.min(0.48, roundness),
  };
}

function contextNodeId(type, id) {
  return `${type}:${id}`;
}

function contextTypeFromNodeId(nodeId) {
  const text = String(nodeId || '');
  const index = text.indexOf(':');
  return index === -1 ? '' : text.slice(0, index);
}

function contextNodeGroup(type) {
  return {
    people: 'person',
    groups: 'group',
    'group-types': 'groupType',
    roles: 'role',
    timepoints: 'timepoint',
  }[type] || 'context';
}

function contextNodeShape(type) {
  return {
    people: 'ellipse',
    groups: 'box',
    'group-types': 'box',
    roles: 'diamond',
    timepoints: 'dot',
  }[type] || 'box';
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

function publicGraphGroupDateLevels(groups) {
  const entries = groups.map((group) => ({
    id: objectId(group),
    start: periodStartSortKey(group?.mainPhase?.period),
  })).filter((entry) => entry.id);
  const datedStarts = [...new Set(entries
    .map((entry) => entry.start)
    .filter((start) => Number.isFinite(start)))]
    .sort((left, right) => left - right);
  const fallbackLevel = datedStarts.length ? datedStarts.length : 0;

  return new Map(entries.map((entry) => [
    entry.id,
    Number.isFinite(entry.start) ? datedStarts.indexOf(entry.start) : fallbackLevel,
  ]));
}

function lineageGraphData(groups, people, roles, groupTypes, groupTypeFilter = '') {
  const visibleGroups = groups.filter((group) => (
    objectId(group)
    && objectRelevantToTimeframe('groups', group)
    && (!groupTypeFilter || groupTypeIds(group).includes(groupTypeFilter))
  ));
  const groupIds = new Set(visibleGroups.map(objectId));
  const stats = publicGroupStats(visibleGroups, people);
  const memberIds = new Set();
  const leaderIds = new Set();
  const counts = new Map(visibleGroups.map((group) => [objectId(group), {
    members: new Set(),
    leaders: new Set(),
  }]));
  const levels = publicGraphGroupDateLevels(visibleGroups);
  const edgeMap = new Map();

  people.forEach((person, personIndex) => {
    const personId = objectId(person);
    const memberships = (Array.isArray(person.memberships) ? person.memberships : [])
      .map((membership, index) => ({ membership, index, groupId: periodEntryGroupId(membership) }))
      .filter((entry) => groupIds.has(entry.groupId) && relationshipRelevantToTimeframe('membership', entry.membership));
    const activities = (Array.isArray(person.activities) ? person.activities : [])
      .map((activity, index) => ({
        activity,
        index,
        groupId: periodEntryGroupId(activity),
        role: roles.find((candidate) => objectId(candidate) === activityRoleId(activity)),
      }))
      .filter((entry) => (
        groupIds.has(entry.groupId)
        && isLeadershipRole(entry.role)
        && relationshipRelevantToTimeframe('activity', entry.activity)
      ));

    memberships.forEach(({ groupId }) => {
      if (personId) {
        counts.get(groupId).members.add(personId);
        memberIds.add(personId);
      }
    });
    activities.forEach(({ groupId }) => {
      if (personId) {
        counts.get(groupId).leaders.add(personId);
        leaderIds.add(personId);
      }
    });

    activities.forEach((activityEntry) => {
      memberships.forEach((membershipEntry) => {
        if (!supportsGroupLineage(membershipEntry, activityEntry)) {
          return;
        }
        const key = `${membershipEntry.groupId}:${activityEntry.groupId}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            id: `lineage:${key}`,
            from: `group:${membershipEntry.groupId}`,
            to: `group:${activityEntry.groupId}`,
            connections: [],
          });
        }
        edgeMap.get(key).connections.push({
          personId,
          personLabel: publicPersonLabel(person, personIndex),
          role: publicRoleLabel(activityEntry.role),
          activityIndex: activityEntry.index,
          period: relationshipPeriodLabel(activityEntry.activity.period),
        });
      });
    });
  });

  const nodes = visibleGroups.map((group, index) => {
    const id = objectId(group);
    const type = groupTypeLabel(group, groupTypes);
    const groupStats = stats.get(id) || { members: 0, activities: 0, span: '' };
    const groupCounts = counts.get(id);
    return {
      id: `group:${id}`,
      label: publicGraphEntryLabel([
        publicGroupName(group, index),
        [type || 'Gruppe', groupStats.span].filter(Boolean).join(' · '),
        `${groupCounts.members.size} bekannte Mitglieder`,
        `${groupCounts.leaders.size} bekannte Leitungen`,
      ]),
      title: publicGraphTitle([
        publicGroupName(group, index),
        groupStats.span ? `Zeitraum: ${groupStats.span}` : '',
        `${groupCounts.members.size} bekannte Mitglieder`,
        `${groupCounts.leaders.size} bekannte Leitungen`,
      ]),
      group: 'group',
      level: levels.get(id) || 0,
      shape: 'box',
      navigation: { type: 'groups', id },
    };
  });
  const compositionEdges = visibleGroups.flatMap((group) => (
    groupPhaseEntries(group)
      .filter(({ phase }) => relationshipRelevantToTimeframe('phase', phase))
      .flatMap(({ phase, rowKey }) => {
        const parentId = groupPhaseParentGroupId(phase);
        if (!parentId || !groupIds.has(parentId)) {
          return [];
        }
        return [{
          id: `composition:${parentId}:${objectId(group)}:${rowKey}`,
          from: `group:${parentId}`,
          to: `group:${objectId(group)}`,
          label: publicGraphEdgeLabel(['Phase', periodYearLabel(phase.period)]),
          title: publicGraphTitle([
            'Formale Gruppenzuordnung',
            relationshipPeriodLabel(phase.period),
          ]),
          arrows: 'to',
          group: 'type',
          navigation: { type: 'groups', id: objectId(group), edit: rowKey },
        }];
      })
  ));
  const lineageEdges = Array.from(edgeMap.values()).map((edge) => {
    const names = uniqueStrings(edge.connections.map((entry) => entry.personLabel));
    const first = edge.connections[0];
    return {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: publicGraphEdgeLabel([names.length === 1 ? names[0] : `${names.length} Personen`, 'Verbindung']),
      title: publicGraphTitle(edge.connections.map((entry) => [entry.personLabel, entry.role, entry.period].filter(Boolean).join(' · '))),
      group: 'activity',
      arrows: 'to',
      width: 2.1,
      navigation: first ? { type: 'people', id: first.personId, edit: `activities:${first.activityIndex}` } : null,
    };
  });

  return {
    nodes,
    edges: [...compositionEdges, ...lineageEdges],
    layout: 'top-down',
    memberCount: memberIds.size,
    leaderCount: leaderIds.size,
  };
}

function isLeadershipRole(role) {
  return /(fuhrung|leitung|sprecher)/.test(foldSearchText(role?.label || role?.name || ''));
}

function supportsGroupLineage(membershipEntry, activityEntry) {
  if (!membershipEntry.groupId || membershipEntry.groupId === activityEntry.groupId) {
    return false;
  }
  const membership = effectiveMembershipBounds(membershipEntry.membership);
  const activity = effectiveActivityBounds(activityEntry.activity);
  const target = effectiveGroupBounds(activityEntry.groupId);
  if (!membership || !activity || !Number.isFinite(activity.start)) {
    return false;
  }
  if (Number.isFinite(membership.start) && activity.start < membership.start) {
    return false;
  }
  if (Number.isFinite(membership.end) && activity.start < membership.end - 10000) {
    return false;
  }
  return !Number.isFinite(target?.start) || Math.abs(activity.start - target.start) <= 30000;
}

function publicGraphOptions(graph = {}) {
  const topDown = graph.layout === 'top-down';
  const contextGraph = graph.layout === 'context';
  return {
    autoResize: false,
    layout: {
      randomSeed: 7,
      improvedLayout: !contextGraph,
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
    physics: graphPhysicsOptions(graph),
    interaction: graphInteractionOptions(),
    nodes: {
      borderWidth: 1,
      borderWidthSelected: 5,
      margin: { top: 12, right: 14, bottom: 12, left: 14 },
      widthConstraint: contextGraph
        ? { minimum: 170, maximum: 230 }
        : { minimum: 168, maximum: 210 },
      color: {
        border: 'rgba(216,216,90,0.48)',
        background: '#151b20',
        highlight: { border: '#ffff00', background: '#151b20' },
        hover: { border: '#ffff00', background: '#151b20' },
      },
      font: {
        color: '#ece8d9',
        face: 'Aptos, Segoe UI, Inter, sans-serif',
        size: contextGraph ? 14 : 15,
        multi: 'html',
        bold: {
          color: '#fbf7de',
          size: contextGraph ? 16 : 18,
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
      focus: {
        color: {
          border: '#ffff00',
          background: '#2a2711',
          highlight: { border: '#ffff00', background: '#2a2711' },
          hover: { border: '#ffff00', background: '#2a2711' },
        },
        font: { color: '#fff2a6', bold: true },
        borderWidth: 2,
        shapeProperties: { borderRadius: 8 },
      },
      person: {
        color: {
          border: '#ef859d',
          background: '#2a1820',
          highlight: { border: '#ffff00', background: '#2a1820' },
          hover: { border: '#ffff00', background: '#2a1820' },
        },
        font: { color: '#f5d8df', bold: true },
      },
      group: {
        color: {
          border: '#d8d85a',
          background: '#1f2118',
          highlight: { border: '#ffff00', background: '#1f2118' },
          hover: { border: '#ffff00', background: '#1f2118' },
        },
        font: { color: '#f4f0cf', bold: true },
        shapeProperties: { borderRadius: 8 },
      },
      groupType: {
        color: {
          border: '#00b74f',
          background: '#12231a',
          highlight: { border: '#ffff00', background: '#12231a' },
          hover: { border: '#ffff00', background: '#12231a' },
        },
        font: { color: '#d7f4e4', bold: true },
        shapeProperties: { borderRadius: 8 },
      },
      role: {
        color: {
          border: '#8e7fae',
          background: '#201a2b',
          highlight: { border: '#ffff00', background: '#201a2b' },
          hover: { border: '#ffff00', background: '#201a2b' },
        },
        font: { color: '#e9e1ff', bold: true },
      },
      timepoint: {
        color: {
          border: '#ef7d00',
          background: '#2a1c10',
          highlight: { border: '#ffff00', background: '#2a1c10' },
          hover: { border: '#ffff00', background: '#2a1c10' },
        },
        font: { color: '#ffe2bf', bold: true },
      },
    },
    edges: {
      color: { color: 'rgba(195,201,197,0.62)', highlight: '#d8d85a', hover: '#d8d85a' },
      width: 1.6,
      ...graphEdgeBehaviorOptions(),
      font: {
        color: '#cfd6d2',
        strokeColor: '#0b0f12',
        strokeWidth: 4,
        size: 11,
        face: 'Aptos, Segoe UI, Inter, sans-serif',
        align: 'horizontal',
        vadjust: 0,
      },
    },
  };
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

function publicGraphEdgeLabel(lines) {
  return lines.map((line) => publicGraphShortLabel(line, 30)).filter(Boolean).join('\n');
}

function publicGraphTitle(lines) {
  const content = (lines || []).map((line) => String(line || '').trim()).filter(Boolean);
  return content.length ? content.map(escapeHtml).join('<br>') : undefined;
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

function publicGroupName(group, index) {
  return String(group.name || group.label || group.description || `Gruppe ${index + 1}`).trim();
}

function relationshipPeriodLabel(period) {
  return periodYearLabel(period) || 'gesamte Gruppenlaufzeit';
}

function referenceYear(collection, id) {
  if (!id) {
    return '';
  }

  const object = (state.objects[collection] || []).find((candidate) => objectId(candidate) === id);
  return object ? dateYear(object.date) : '';
}

function renderSectionCounts() {
  renderNavigationCounts();
  updateExampleDataVisibility();
}

function renderNavigationCounts() {
  const collections = state.status?.storage?.collections || {};
  const counts = Object.fromEntries(objectCollections.map((type) => [
    type,
    Number(Array.isArray(state.objects[type])
      ? state.objects[type].filter((object) => objectRelevantToTimeframe(type, object)).length
      : collections[type] || 0),
  ]));
  counts.users = state.users.length;
  counts.audit = state.auditLog.length;
  counts.log = state.changeLog.length;

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
          <button class="period-toggle" type="button" data-collection-sort-direction="${escapeAttribute(type)}" aria-label="${escapeAttribute(sortDirectionLabel(ui.sortDirection))}" title="${escapeAttribute(sortDirectionLabel(ui.sortDirection))}">(↓↑)</button>
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

  if (type === 'timepoints') {
    return [
      collectionStaticSelectControl(type, 'timepointNames', 'Zeitpunkt', collectionTextFilterOptions('timepoints', 'name'), filters.timepointNames, true),
      collectionStaticSelectControl(type, 'locations', 'Ort', collectionTextFilterOptions('timepoints', 'location'), filters.locations, true),
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

function collectionTextFilterOptions(collection, field) {
  const byKey = new Map();
  (state.objects[collection] || []).forEach((object) => {
    if (!objectRelevantToTimeframe(collection, object)) {
      return;
    }
    const text = String(object?.[field] || '').trim();
    const key = foldSearchText(text);
    if (!text || byKey.has(key)) {
      return;
    }
    byKey.set(key, text);
  });

  return [...byKey.values()]
    .sort(sortCollator.compare)
    .map((value) => [value, value]);
}

function collectionMultiSelectControl(type, name, label, collection, selectedValues = []) {
  const selected = new Set(Array.isArray(selectedValues) ? selectedValues : []);
  const objects = (state.objects[collection] || [])
    .filter((object) => objectRelevantToTimeframe(collection, object) || selected.has(objectId(object)))
    .slice()
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
  const view = currentViewName();
  if (objectCollections.includes(view)) {
    renderObjectCollection(view);
  }
}

function renderObjectCollection(type) {
  const config = objectConfigs[type];
  const list = document.querySelector(config.list);
  if (!list) {
    return;
  }

  renderCreatePanel(type);
  if (!canAccessObjects()) {
    list.innerHTML = '<div class="empty-state">Kein Zugriff auf Einträge.</div>';
    return;
  }

  const sourceObjects = state.objects[type] || [];
  const objects = collectionObjects(type);
  const visibleCount = collectionVisibleCountForObjects(type, objects);
  const visibleObjects = objects.slice(0, visibleCount);
  const more = objects.length > visibleObjects.length
    ? renderCollectionMoreButton(type, objects.length - visibleObjects.length)
    : '';
  const unknownNotice = state.timeframe.start && sourceObjects.some((object) => !objectHasTimeData(type, object))
    ? '<p class="timeframe-notice">Einträge ohne ausreichende Zeitangabe sind ausgeblendet.</p>'
    : '';
  list.innerHTML = renderObjectListItems(type, visibleObjects) + more + unknownNotice
    || `<div class="empty-state">${sourceObjects.length ? 'Keine Treffer.' : `Noch keine ${escapeHtml(emptyCollectionLabels[type] || labels[type] || type)}.`}</div>`;
  applyContextSplitRatio();
  scheduleContextGraphRender();
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
  if (!objectRelevantToTimeframe(type, object)) {
    return false;
  }

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

  if (type === 'timepoints') {
    return objectTextMatchesAny(object.name, filters.timepointNames)
      && objectTextMatchesAny(object.location, filters.locations);
  }

  return true;
}

function objectRelevantToTimeframe(type, object) {
  const scope = timeframeBounds(state.timeframe);
  if (!scope) {
    return true;
  }

  if (type === 'groups') {
    return groupPhaseEntries(object).some(({ phase }) => boundsOverlap(effectivePhaseBounds(phase), scope));
  }
  if (type === 'people') {
    return (Array.isArray(object.memberships) ? object.memberships : [])
      .some((membership) => boundsOverlap(effectiveMembershipBounds(membership), scope))
      || (Array.isArray(object.activities) ? object.activities : [])
        .some((activity) => boundsOverlap(effectiveActivityBounds(activity), scope));
  }
  if (type === 'timepoints') {
    return boundsOverlap(dateValueBounds(object.date), scope);
  }
  if (type === 'roles') {
    const roleId = objectId(object);
    return (state.objects.people || []).some((person) => (
      (Array.isArray(person.activities) ? person.activities : [])
        .some((activity) => activityRoleId(activity) === roleId && boundsOverlap(effectiveActivityBounds(activity), scope))
    ));
  }
  if (type === 'group-types') {
    const typeId = objectId(object);
    return (state.objects.groups || []).some((group) => (
      groupPhaseEntries(group).some(({ phase }) => (
        groupPhaseTypeId(phase) === typeId && boundsOverlap(effectivePhaseBounds(phase), scope)
      ))
    ));
  }
  return true;
}

function objectHasTimeData(type, object) {
  if (type === 'groups') {
    return groupPhaseEntries(object).some(({ phase }) => Boolean(effectivePhaseBounds(phase)));
  }
  if (type === 'people') {
    return (Array.isArray(object.memberships) ? object.memberships : []).some((entry) => Boolean(effectiveMembershipBounds(entry)))
      || (Array.isArray(object.activities) ? object.activities : []).some((entry) => Boolean(effectiveActivityBounds(entry)));
  }
  if (type === 'timepoints') {
    return Boolean(dateValueBounds(object.date));
  }
  if (type === 'roles') {
    return (state.objects.people || []).some((person) => (
      (Array.isArray(person.activities) ? person.activities : [])
        .some((entry) => activityRoleId(entry) === objectId(object) && Boolean(effectiveActivityBounds(entry)))
    ));
  }
  if (type === 'group-types') {
    return (state.objects.groups || []).some((group) => (
      groupPhaseEntries(group)
        .some(({ phase }) => groupPhaseTypeId(phase) === objectId(object) && Boolean(effectivePhaseBounds(phase)))
    ));
  }
  return true;
}

function effectivePhaseBounds(phase) {
  return periodBounds(phase?.period, resolveTimepointDate);
}

function effectiveGroupBounds(groupOrId) {
  const group = typeof groupOrId === 'string' ? findReferenceObject('groups', groupOrId) : groupOrId;
  return combineBounds(groupPhaseEntries(group || {}).map(({ phase }) => effectivePhaseBounds(phase)));
}

function effectiveMembershipBounds(membership) {
  return periodBounds(membership?.period, resolveTimepointDate)
    || effectiveGroupBounds(periodEntryGroupId(membership));
}

function effectiveActivityBounds(activity) {
  const explicit = periodBounds(activity?.period, resolveTimepointDate);
  if (explicit) {
    return explicit;
  }

  const group = findReferenceObject('groups', periodEntryGroupId(activity));
  const role = findReferenceObject('roles', activityRoleId(activity));
  const allowedTypes = new Set(roleGroupTypeIds(role || {}));
  const phases = groupPhaseEntries(group || {})
    .filter(({ phase }) => !allowedTypes.size || allowedTypes.has(groupPhaseTypeId(phase)))
    .map(({ phase }) => effectivePhaseBounds(phase));
  return combineBounds(phases);
}

function resolveTimepointDate(id) {
  return id ? findReferenceObject('timepoints', id)?.date : null;
}

function relationshipRelevantToTimeframe(kind, value) {
  const scope = timeframeBounds(state.timeframe);
  if (!scope) {
    return true;
  }
  if (kind === 'membership') {
    return boundsOverlap(effectiveMembershipBounds(value), scope);
  }
  if (kind === 'activity') {
    return boundsOverlap(effectiveActivityBounds(value), scope);
  }
  return boundsOverlap(effectivePhaseBounds(value), scope);
}

function relationshipRowRelevantToTimeframe(type, object, rowKey) {
  if (!rowKey || !state.timeframe.start) {
    return true;
  }
  if (rowKey === 'mainPhase') {
    return relationshipRelevantToTimeframe('phase', object.mainPhase);
  }
  const match = /^(additionalPhases|memberships|activities):(\d+)$/.exec(rowKey);
  if (!match) {
    return true;
  }
  const value = object[match[1]]?.[Number(match[2])];
  const kind = match[1] === 'memberships' ? 'membership' : (match[1] === 'activities' ? 'activity' : 'phase');
  return relationshipRelevantToTimeframe(kind, value);
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
    object.location,
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

function objectTextMatchesAny(value, selectedValues = []) {
  if (!Array.isArray(selectedValues) || !selectedValues.length) {
    return true;
  }

  const foldedValue = foldSearchText(value);
  return selectedValues.some((selected) => foldSearchText(selected) === foldedValue);
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
  const titleAttrs = `type="button" data-object-action="toggle-editor" aria-expanded="${isEditing ? 'true' : 'false'}"`;
  const warnings = objectValidationWarnings(type, object);
  const hasStatusMeta = Boolean(modified || warnings.length);
  const outsideTimeframe = !objectRelevantToTimeframe(type, object);

  return `
    <article class="list-item object-item is-clickable ${canWrite ? '' : 'is-readonly'} ${isEditing ? 'is-editing' : ''} ${outsideTimeframe ? 'is-outside-timeframe' : ''}" data-object-type="${escapeAttribute(type)}" data-object-id="${escapeAttribute(objectId(object))}" data-revision="${Number(object._revision || 0)}" data-initial-object="${state.initialObjects.has(key) ? '1' : '0'}">
      <div class="object-main">
        <button class="object-title-row" ${titleAttrs}>
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
        </button>
        ${outsideTimeframe && isEditing ? '<p class="timeframe-notice">Außerhalb des gewählten Zeitraums</p>' : ''}
        ${summary ? `<p class="object-summary">${escapeHtml(summary)}</p>` : ''}
        ${isEditing ? renderObjectEditor(type, object) : ''}
        ${type === 'groups' ? renderGroupReverseView(object, { editable: isEditing && canWrite }) : ''}
        ${type === 'timepoints' ? renderTimepointReverseView(object) : ''}
        <p class="object-save-state" data-save-state hidden></p>
      </div>
    </article>
  `;
}

function renderGroupReverseView(group, options = {}) {
  const groupId = objectId(group);
  const memberships = [];
  const activities = [];

  (state.objects.people || []).forEach((person) => {
    (Array.isArray(person.memberships) ? person.memberships : []).forEach((membership, index) => {
      if (periodEntryGroupId(membership) === groupId && relationshipRelevantToTimeframe('membership', membership)) {
        memberships.push({ person, value: membership, period: membership.period, rowKey: `memberships:${index}`, index });
      }
    });

    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, index) => {
      if (periodEntryGroupId(activity) === groupId && relationshipRelevantToTimeframe('activity', activity)) {
        activities.push({ person, value: activity, role: findReferenceObject('roles', activityRoleId(activity)), period: activity.period, rowKey: `activities:${index}`, index });
      }
    });
  });

  if (options.editable) {
    return renderEditableGroupReverseView(group, memberships, activities);
  }

  if (!memberships.length && !activities.length) {
    return '';
  }

  return `
    <div class="reverse-view" aria-label="Abgeleitete Gruppendaten">
      ${renderReverseColumn('Mitglieder', memberships.map((entry) => reversePersonLine(entry.person, entry.period, entry.rowKey)))}
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
      ${visible.map((line) => reverseLineHtml(line)).join('')}
      ${more ? `<small>${escapeHtml(more)}</small>` : ''}
    </section>
  `;
}

function reverseLineHtml(line) {
  const text = typeof line === 'string' ? line : line?.text || '';
  if (!text) {
    return '';
  }

  if (!line || typeof line === 'string' || !line.type || !line.id || !line.edit) {
    return `<small>${escapeHtml(text)}</small>`;
  }

  return `
    <small data-graph-edge-type="${escapeAttribute(line.type)}" data-graph-edge-id="${escapeAttribute(line.id)}" data-graph-edge-edit="${escapeAttribute(line.edit)}">
      <a class="reverse-link" href="${escapeAttribute(nestedEditUrl(line.type, line.id, line.edit))}" data-nested-edit-link data-link-view="${escapeAttribute(line.type)}" data-link-id="${escapeAttribute(line.id)}" data-link-edit="${escapeAttribute(line.edit)}">${escapeHtml(text)}</a>
    </small>
  `;
}

function linkedReverseLine(text, type, id, edit) {
  return validNestedEditKey(edit) && objectCollections.includes(type) && id
    ? { text, type, id, edit }
    : text;
}

function reverseEntry(label, type, id, edit) {
  return linkedReverseLine(label, type, id, edit);
}

function reverseEntryText(entry) {
  return typeof entry === 'string' ? entry : entry?.text || '';
}

function reverseEntryLine(text, entry) {
  return linkedReverseLine(text, entry?.type || '', entry?.id || '', entry?.edit || '');
}

function nestedEditUrl(type, id, edit) {
  const params = new URLSearchParams();
  params.set('view', type);
  params.set('id', id);
  params.set('edit', edit);
  writeTimeframeSearchParams(params, state.timeframe);
  return `${window.location.pathname}?${params.toString()}`;
}

function reversePersonLine(person, period, rowKey = '') {
  return linkedReverseLine(
    [objectListTitle('people', person), relationshipPeriodLabel(period)].filter(Boolean).join(' · '),
    'people',
    objectId(person),
    rowKey,
  );
}

function reverseActivityLine(entry) {
  return linkedReverseLine([
    objectLabel(entry.role, 'roles'),
    objectListTitle('people', entry.person),
    relationshipPeriodLabel(entry.period),
  ].filter(Boolean).join(' · '), 'people', objectId(entry.person), entry.rowKey || '');
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
    const groupId = objectId(group);
    const starts = [];
    const ends = [];
    groupPhaseEntries(group).forEach(({ phase, rowKey }) => {
      const label = objectLabel(findReferenceObject('group-types', groupPhaseTypeId(phase)), 'group-types') || 'Phase';
      const entry = reverseEntry(label, 'groups', groupId, rowKey);
      if (periodBoundaryMatchesTimepoint(timepoint, phase.period, 'start')) {
        starts.push(entry);
      }
      if (periodBoundaryMatchesTimepoint(timepoint, phase.period, 'end')) {
        ends.push(entry);
      }
    });

    pairTransitions(ends, starts).forEach(([from, to]) => {
      lines.push(reverseEntryLine(`${objectListTitle('groups', group)}: ${reverseEntryText(from)} -> ${reverseEntryText(to)}`, to));
    });
    ends.slice(starts.length).forEach((entry) => lines.push(reverseEntryLine(`${objectListTitle('groups', group)}: ${reverseEntryText(entry)} endet`, entry)));
    starts.slice(ends.length).forEach((entry) => lines.push(reverseEntryLine(`${objectListTitle('groups', group)}: ${reverseEntryText(entry)} startet`, entry)));
  });
  return lines;
}

function timepointMembershipLines(timepoint) {
  const lines = [];
  (state.objects.people || []).forEach((person) => {
    const personId = objectId(person);
    const starts = [];
    const ends = [];
    (Array.isArray(person.memberships) ? person.memberships : []).forEach((membership, index) => {
      const group = objectLabel(findReferenceObject('groups', periodEntryGroupId(membership)), 'groups') || 'Gruppe';
      const entry = reverseEntry(group, 'people', personId, `memberships:${index}`);
      if (periodBoundaryMatchesTimepoint(timepoint, membership.period, 'start')) {
        starts.push(entry);
      }
      if (periodBoundaryMatchesTimepoint(timepoint, membership.period, 'end')) {
        ends.push(entry);
      }
    });

    pairTransitions(ends, starts).forEach(([from, to]) => {
      lines.push(reverseEntryLine(`${objectListTitle('people', person)}: ${reverseEntryText(from)} -> ${reverseEntryText(to)}`, to));
    });
    ends.slice(starts.length).forEach((entry) => lines.push(reverseEntryLine(`${objectListTitle('people', person)}: verlässt ${reverseEntryText(entry)}`, entry)));
    starts.slice(ends.length).forEach((entry) => lines.push(reverseEntryLine(`${objectListTitle('people', person)}: tritt ${reverseEntryText(entry)} bei`, entry)));
  });
  return lines;
}

function timepointActivityLines(timepoint) {
  const lines = [];
  (state.objects.people || []).forEach((person) => {
    const personId = objectId(person);
    const starts = [];
    const ends = [];
    (Array.isArray(person.activities) ? person.activities : []).forEach((activity, index) => {
      const label = activityLabel(activity);
      const entry = reverseEntry(label, 'people', personId, `activities:${index}`);
      if (periodBoundaryMatchesTimepoint(timepoint, activity.period, 'start')) {
        starts.push(entry);
      }
      if (periodBoundaryMatchesTimepoint(timepoint, activity.period, 'end')) {
        ends.push(entry);
      }
    });

    pairTransitions(ends, starts).forEach(([from, to]) => {
      lines.push(reverseEntryLine(`${objectListTitle('people', person)}: ${reverseEntryText(from)} -> ${reverseEntryText(to)}`, to));
    });
    ends.slice(starts.length).forEach((entry) => lines.push(reverseEntryLine(`${objectListTitle('people', person)}: ${reverseEntryText(entry)} endet`, entry)));
    starts.slice(ends.length).forEach((entry) => lines.push(reverseEntryLine(`${objectListTitle('people', person)}: ${reverseEntryText(entry)} startet`, entry)));
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

function groupPhaseParentGroupId(phase) {
  return phase?.parentGroup || phase?.parentGroupId || phase?.parent_group_id || '';
}

function groupTypeParentGroupTypeId(groupType) {
  return groupType?.parentGroupType || groupType?.parentGroupTypeId || groupType?.parent_group_type_id || '';
}

function defaultParentGroupForPhase(groupTypeId, ownerGroupId = '') {
  const parentGroupTypeId = groupTypeParentGroupTypeId(findReferenceObject('group-types', groupTypeId));
  if (!parentGroupTypeId) {
    return '';
  }

  const matches = (state.objects.groups || [])
    .filter((group) => group && !group._deleted)
    .filter((group) => objectId(group) !== ownerGroupId)
    .filter((group) => groupTypeIds(group).includes(parentGroupTypeId));

  return matches.length === 1 ? objectId(matches[0]) : '';
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
  const deleteAction = hasPermission('write')
    ? `<div class="object-editor-actions">
        <button class="button button-danger" type="button" data-object-action="delete">${escapeHtml(deleteLabel)}</button>
      </div>`
    : '';
  return `
    <form class="object-editor object-editor-layout ${hasSide ? 'has-side' : 'no-side'}" data-object-editor>
      ${renderEditorFields(type, fields, object, false)}
      ${deleteAction}
    </form>
  `;
}

function renderEditorFields(type, fields, object, isCreate) {
  const sections = editorFieldSections(fields);
  const context = { ownerType: type, ownerObject: object, isCreate };
  const renderFields = (sectionFields) => sectionFields.map((field) => (
    renderFieldInput(field, isCreate ? defaultFieldValue(field) : object[field.name], isCreate, context)
  )).join('');

  return [
    sections.main.length ? `<div class="object-editor-main">${renderFields(sections.main)}</div>` : '',
    sections.internal.length ? `<aside class="object-editor-side">${renderFields(sections.internal)}</aside>` : '',
    sections.relations.length ? `<div class="object-editor-relations">${renderFields(sections.relations)}</div>` : '',
  ].join('');
}

function renderEditableGroupReverseView(group, memberships, activities) {
  return `
    <div class="reverse-view group-reverse-edit" aria-label="Abgeleitete Gruppendaten bearbeiten">
      ${renderEditableGroupRelationColumn('membership', 'Mitglieder', group, memberships)}
      ${renderEditableGroupRelationColumn('activity', 'Aktivitäten', group, activities)}
    </div>
  `;
}

function renderEditableGroupRelationColumn(kind, title, group, entries) {
  return `
    <section class="reverse-column composite-field group-reverse-field" data-group-reverse-field="${escapeAttribute(kind)}" data-group-id="${escapeAttribute(objectId(group))}">
      <div class="composite-header">
        <span>${escapeHtml(title)} <strong>${entries.length}</strong></span>
        <button class="icon-button add-list-button" type="button" data-group-relation-add-toggle="${escapeAttribute(kind)}" aria-label="${escapeAttribute(title)} hinzufügen">+</button>
      </div>
      <div class="composite-list" data-group-reverse-list>
        ${entries.map((entry) => renderGroupReverseRelationRow(kind, group, entry)).join('') || `<small class="group-reverse-empty">Keine ${escapeHtml(title.toLocaleLowerCase('de-DE'))}</small>`}
      </div>
      <div class="group-relation-add-slot" data-group-relation-add-slot="${escapeAttribute(kind)}" hidden>
        ${renderGroupRelationAddSection(kind, group)}
      </div>
    </section>
  `;
}

function renderGroupReverseRelationRow(kind, group, entry) {
  const personId = objectId(entry.person);
  const groupId = objectId(group);
  const field = kind === 'activity' ? 'activities' : 'memberships';
  const edit = `${field}:${entry.index}`;
  const localKey = groupReverseRelationKey(kind, personId, entry.index);
  const groupKey = objectKey('groups', groupId);
  const isOpen = state.groupRelationEditing[groupKey] === localKey;
  const summary = kind === 'activity'
    ? reverseActivityLineText(entry)
    : reversePersonLineText(entry.person, entry.period);
  const warnings = kind === 'activity'
    ? complexItemValidationWarnings('activity-list', entry.value, { ownerType: 'people', ownerObject: entry.person, listField: 'activities', listIndex: entry.index })
    : complexItemValidationWarnings('membership-list', entry.value, { ownerType: 'people', ownerObject: entry.person, listField: 'memberships', listIndex: entry.index });
  return `
    <div class="composite-item group-reverse-row has-summary ${isOpen ? '' : 'is-collapsed'}" data-group-reverse-row data-group-reverse-kind="${escapeAttribute(kind)}" data-group-id="${escapeAttribute(groupId)}" data-person-id="${escapeAttribute(personId)}" data-relation-field="${escapeAttribute(field)}" data-relation-index="${entry.index}" data-group-reverse-key="${escapeAttribute(localKey)}" data-graph-edge-type="people" data-graph-edge-id="${escapeAttribute(personId)}" data-graph-edge-edit="${escapeAttribute(edit)}">
      <div class="group-reverse-summary-row">
        <button class="composite-summary" type="button" data-group-reverse-action="toggle" aria-expanded="${isOpen ? 'true' : 'false'}">
          ${compositeSummaryHtml(summary, warnings)}
        </button>
        ${groupReversePersonLink(personId, edit)}
      </div>
      <div class="composite-editor" data-composite-editor>
        ${renderGroupReverseRelationEditor(kind, group, entry)}
        <div class="composite-editor-actions">
          <p class="object-save-state" data-group-reverse-state hidden></p>
        </div>
      </div>
    </div>
  `;
}

function renderGroupReverseRelationEditor(kind, group, entry) {
  const idBase = `group-reverse-${kind}-${Math.random().toString(36).slice(2)}`;
  const value = entry.value || {};
  const roleControl = kind === 'activity'
    ? renderReferenceControl({
      id: `${idBase}-role`,
      label: 'Rolle',
      value: activityRoleId(value),
      collection: 'roles',
      nestedField: 'role',
      objectFieldAttrs: `data-reference-fixed-group="${escapeAttribute(objectId(group))}"`,
      pickerContext: { ownerType: 'groups', ownerObject: group, picker: 'activity-role', activity: { ...value, group: objectId(group) } },
    })
    : '';
  return `
    <div class="nested-editor">
      <div class="object-field source-display-field">
        <span>Person</span>
        <div class="source-display-text">${escapeHtml(objectListTitle('people', entry.person))}</div>
      </div>
      ${roleControl}
      ${renderPeriodEditor(value.period || {}, `${idBase}-period`, false, { ownerType: 'people', ownerObject: entry.person })}
      ${renderNestedCertaintyField(`${idBase}-certainty`, value._certainty || 'none')}
      ${renderNestedSourceDisplayField(`${idBase}-sources`, value._sources || '')}
    </div>
  `;
}

function groupReversePersonLink(personId, edit) {
  return `
    <a class="reference-link group-reverse-person-link" href="${escapeAttribute(nestedEditUrl('people', personId, edit))}" data-nested-edit-link data-link-view="people" data-link-id="${escapeAttribute(personId)}" data-link-edit="${escapeAttribute(edit)}" aria-label="Person öffnen" title="Person öffnen">⇒</a>
  `;
}

function groupReverseRelationKey(kind, personId, index) {
  return `${kind}:${personId}:${index}`;
}

function reversePersonLineText(person, period) {
  return [objectListTitle('people', person), relationshipPeriodLabel(period)].filter(Boolean).join(' · ');
}

function reverseActivityLineText(entry) {
  return [
    objectLabel(entry.role, 'roles'),
    objectListTitle('people', entry.person),
    relationshipPeriodLabel(entry.period),
  ].filter(Boolean).join(' · ');
}

function renderGroupRelationAddSection(kind, group) {
  const groupId = objectId(group);
  const idBase = `group-relation-${kind}-${Math.random().toString(36).slice(2)}`;
  const isActivity = kind === 'activity';
  const title = isActivity ? 'Aktivität hinzufügen' : 'Mitglied hinzufügen';
  const roleControl = isActivity
    ? renderReferenceControl({
      id: `${idBase}-role`,
      label: 'Rolle',
      value: '',
      collection: 'roles',
      nestedField: 'role',
      objectFieldAttrs: `data-reference-fixed-group="${escapeAttribute(groupId)}"`,
      pickerContext: { ownerType: 'groups', ownerObject: group, picker: 'activity-role', activity: { group: groupId } },
    })
    : '';

  return `
    <section class="object-field object-field-wide composite-field group-relation-add" data-group-relation-add="${escapeAttribute(kind)}" data-group-id="${escapeAttribute(groupId)}">
      <div class="composite-header">
        <span>${escapeHtml(title)}</span>
      </div>
      <div class="nested-editor">
        ${renderReferenceControl({ id: `${idBase}-person`, label: 'Person', value: '', collection: 'people', nestedField: 'person', pickerContext: { ownerType: 'groups', ownerObject: group } })}
        ${roleControl}
        ${renderPeriodEditor(emptyPeriod(), `${idBase}-period`, false, { ownerType: 'groups', ownerObject: group })}
        ${renderNestedCertaintyField(`${idBase}-certainty`, 'none')}
      </div>
      <p class="object-save-state" data-group-relation-state hidden></p>
    </section>
  `;
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
    pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: field.picker || '' },
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
  const referenceLink = referenceLinkHtml(collection, storedValue);
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
      ${showFilter ? `
        <div class="reference-filter-wrap">
          <input class="reference-filter" type="search" data-reference-filter placeholder="Auswahl filtern" aria-label="${escapeAttribute(label ? `${label} filtern` : 'Auswahl filtern')}" autocomplete="off">
          <div class="reference-filter-results" data-reference-filter-results hidden></div>
        </div>
      ` : ''}
      <div class="reference-select-row">
        <select id="${escapeAttribute(id)}" ${attrs} ${labelAttr}>
          ${referenceOptions(collection, showIds, { ...optionConfig, currentValue: storedValue })}
        </select>
        ${referenceLink}
      </div>
    </div>
  `;
}

function referenceLinkHtml(collection, value) {
  const canLink = objectCollections.includes(collection) && value;
  return `<a class="reference-link" href="${escapeAttribute(canLink ? objectUrl(collection, value) : '#')}" data-reference-link data-link-view="${escapeAttribute(collection)}" data-link-id="${escapeAttribute(value || '')}" aria-label="Eintrag öffnen" title="Eintrag öffnen" ${canLink ? '' : 'hidden'}>⇒</a>`;
}

function objectUrl(type, id) {
  const params = new URLSearchParams();
  params.set('view', type);
  params.set('id', id);
  writeTimeframeSearchParams(params, state.timeframe);
  return `${window.location.pathname}?${params.toString()}`;
}

function referenceFilterVisible(collection) {
  return objectCollections.includes(collection);
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

  const optionHtml = (object) => {
    const id = objectId(object);
    return `<option value="${escapeAttribute(id)}" ${id === current ? 'selected' : ''}>${escapeHtml(referenceOptionLabel(object, collection, objects, showIds))}</option>`;
  };
  if (state.timeframe.start && objectCollections.includes(collection)) {
    const inScope = objects.filter((object) => objectRelevantToTimeframe(collection, object));
    const outOfScope = objects.filter((object) => !objectRelevantToTimeframe(collection, object));
    if (inScope.length) {
      options.push(`<optgroup label="Im Zeitraum">${inScope.map(optionHtml).join('')}</optgroup>`);
    }
    if (outOfScope.length) {
      options.push(`<optgroup label="Außerhalb des Zeitraums">${outOfScope.map(optionHtml).join('')}</optgroup>`);
    }
  } else {
    objects.forEach((object) => options.push(optionHtml(object)));
  }

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

  if (context.picker === 'group-phase-parent') {
    const groupTypeId = groupPhaseTypeId(context.phase || {});
    const groupType = findReferenceObject('group-types', groupTypeId);
    config.excludeGroupId = objectId(context.ownerObject || {});
    config.parentGroupTypeId = groupTypeParentGroupTypeId(groupType);
    config.requireParentGroupType = true;
    config.strictReferenceScope = true;
    if (context.useDefaultParentGroup) {
      config.defaultValue = defaultParentGroupForPhase(groupTypeId, config.excludeGroupId);
    }
  }

  if (context.picker === 'parent-group-type') {
    config.excludeGroupTypeId = objectId(context.ownerObject || {});
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
    if (config.excludeGroupId) {
      objects = objects.filter((group) => objectId(group) !== config.excludeGroupId);
    }

    if (config.requireParentGroupType && !config.parentGroupTypeId) {
      objects = [];
    }

    if (config.parentGroupTypeId) {
      objects = objects.filter((group) => groupTypeIds(group).includes(config.parentGroupTypeId));
    }

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

  if (collection === 'group-types' && config.excludeGroupTypeId) {
    objects = objects.filter((groupType) => objectId(groupType) !== config.excludeGroupTypeId);
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
  const currentId = currentObject ? objectId(currentObject) : '';
  const currentExcluded = (collection === 'groups' && config.excludeGroupId && currentId === config.excludeGroupId)
    || (collection === 'group-types' && config.excludeGroupTypeId && currentId === config.excludeGroupTypeId);
  if (!config.strictReferenceScope && currentObject && !currentObject._deleted && !currentExcluded && !objects.some((object) => objectId(object) === currentId)) {
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
    return [compactDateDisplayValue(object.date), object.location].filter(Boolean).join(' · ');
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
      ${referenceLinkHtml('group-types', value)}
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
  const hidden = value && !relationshipRelevantToTimeframe('phase', value);
  return `
    <section class="object-field object-field-wide composite-field" data-object-field="${escapeAttribute(field.name)}" data-field-kind="${escapeAttribute(field.kind)}" ${hidden ? 'hidden' : ''}>
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

function complexItemRelevantToTimeframe(kind, value) {
  if (kind === 'membership-list') {
    return relationshipRelevantToTimeframe('membership', value);
  }
  if (kind === 'activity-list') {
    return relationshipRelevantToTimeframe('activity', value);
  }
  if (kind === 'group-phase-list' || kind === 'group-phase') {
    return relationshipRelevantToTimeframe('phase', value);
  }
  return true;
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
  const referenceLink = relationshipReferenceLinkHtml(kind, value);
  const hidden = hasValue && !complexItemRelevantToTimeframe(kind, value);
  return `
    <div class="composite-item ${summary ? 'has-summary' : ''} ${referenceLink ? 'has-navigation' : ''} ${isCollapsed ? 'is-collapsed' : ''}" data-list-item data-list-collapsible="${(hasValue || rowKey) ? '1' : '0'}" data-relationship-row-key="${escapeAttribute(rowKey)}" ${hidden ? 'hidden' : ''}>
      ${summary ? `
        <button class="composite-summary" type="button" data-list-action="toggle" aria-expanded="${isCollapsed ? 'false' : 'true'}">
          ${compositeSummaryHtml(summary, warnings)}
        </button>
      ` : ''}
      ${referenceLink}
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

function relationshipReferenceLinkHtml(kind, value) {
  const target = ['membership-list', 'activity-list'].includes(kind)
    ? { type: 'groups', id: periodEntryGroupId(value), label: 'Gruppe' }
    : ['group-phase-list', 'group-phase'].includes(kind)
      ? { type: 'group-types', id: groupPhaseTypeId(value), label: 'Gruppenart' }
      : null;
  if (!target?.id) {
    return '';
  }

  return `<a class="reference-link relationship-group-link" href="${escapeAttribute(objectUrl(target.type, target.id))}" data-reference-link data-link-view="${escapeAttribute(target.type)}" data-link-id="${escapeAttribute(target.id)}" aria-label="${escapeAttribute(target.label)} öffnen" title="${escapeAttribute(target.label)} öffnen">⇒</a>`;
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
      relationshipPeriodLabel(value.period),
    ].filter(Boolean).join(' · ');
  }

  if (kind === 'activity-list') {
    return [
      objectLabel(findReferenceObject('roles', value.role), 'roles') || 'Keine Rolle',
      objectLabel(findReferenceObject('groups', value.group), 'groups') || 'Keine Gruppe',
      relationshipPeriodLabel(value.period),
    ].filter(Boolean).join(' · ');
  }

  if (kind === 'group-phase-list' || kind === 'group-phase') {
    return [
      objectLabel(findReferenceObject('group-types', groupPhaseTypeId(value)), 'group-types') || 'Keine Gruppenart',
      groupPhaseParentGroupId(value) ? `unter ${objectLabel(findReferenceObject('groups', groupPhaseParentGroupId(value)), 'groups') || 'unbekannter Gruppe'}` : '',
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
    collectGroupPhaseWarnings(warnings, value, '', true, { ownerGroupId: objectId(context.ownerObject || {}) });
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
  const groupTypeId = groupPhaseTypeId(value);
  const ownerGroupId = objectId(context.ownerObject || {});
  const useDefaultParentGroup = Boolean(context.isCreate || context.isNewComplexItem);
  const parentGroupId = groupPhaseParentGroupId(value) || (useDefaultParentGroup ? defaultParentGroupForPhase(groupTypeId, ownerGroupId) : '');
  return `
    <div class="nested-editor ${compact ? 'is-compact' : ''}" data-group-phase-editor data-new-group-phase="${useDefaultParentGroup ? '1' : '0'}">
      ${renderReferenceControl({ id: `${idBase}-type`, label: 'Gruppenart', value: groupTypeId, collection: 'group-types', nestedField: 'groupType', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: 'group-phase-type' } })}
      ${renderReferenceControl({ id: `${idBase}-parent-group`, label: 'Übergeordnete Gruppe', value: parentGroupId, collection: 'groups', nestedField: 'parentGroup', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: 'group-phase-parent', phase: { ...value, groupType: groupTypeId, parentGroup: parentGroupId }, useDefaultParentGroup } })}
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
      ${renderReferenceControl({ id: `${idBase}-role`, label: 'Rolle', value: value.role || '', collection: 'roles', nestedField: 'role', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: 'activity-role', activity: value } })}
      ${renderReferenceControl({ id: `${idBase}-group`, label: 'Gruppe', value: value.group || '', collection: 'groups', nestedField: 'group', pickerContext: { ownerType: context.ownerType, ownerObject: context.ownerObject, picker: 'activity-group', activity: value } })}
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
  const groupReverseRow = input.closest('[data-group-reverse-row]');
  if (groupReverseRow) {
    refreshPeriodDependentPickers(input.closest('[data-period-editor]'), input);
    markGroupReverseRowChanged(groupReverseRow, 1800);
    return;
  }

  if (input.closest('[data-group-relation-add]')) {
    refreshPeriodDependentPickers(input.closest('[data-period-editor]'), input);
    markGroupRelationDraftChanged(input.closest('[data-group-relation-add]'), 1800);
    return;
  }

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

  const groupReverseButton = event.target.closest('[data-group-reverse-action]');
  if (groupReverseButton) {
    handleGroupReverseAction(groupReverseButton);
    return;
  }

  const groupRelationToggle = event.target.closest('[data-group-relation-add-toggle]');
  if (groupRelationToggle) {
    toggleGroupRelationAddPanel(groupRelationToggle);
    return;
  }

  const listButton = event.target.closest('[data-list-action]');
  if (listButton) {
    handleListAction(listButton);
    return;
  }

  const createButton = event.target.closest('[data-create-type]');
  if (createButton) {
    if (focusExistingInitialObject(createButton)) {
      return;
    }

    if (focusExistingCreateForm(createButton)) {
      return;
    }

    const createType = createButton.dataset.createType;
    if (createType !== 'users') {
      await createObjectImmediately(createType, createButton);
      return;
    }

    if (!(await closeOpenEditorsBeforeSwitch())) {
      return;
    }
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
  if (type === 'groups') {
    const drafts = Array.from(item.querySelectorAll('[data-group-relation-add][data-dirty="1"]'));
    for (const draft of drafts) {
      window.clearTimeout(state.editTimers[groupRelationDraftTimerKey(draft)]);
      if (!(await flushGroupRelationDraft(draft))) {
        return;
      }
    }
    const reverseRows = Array.from(item.querySelectorAll('[data-group-reverse-row][data-dirty="1"]'));
    for (const row of reverseRows) {
      window.clearTimeout(state.editTimers[groupReverseTimerKey(row)]);
      if (!(await flushGroupReverseRow(row))) {
        return;
      }
    }
  }
  await flushObjectEdit(item, true);
  if (item.dataset.dirty === '1' || item.dataset.saving === '1') {
    return;
  }
  state.editing[key] = false;
  delete state.relationshipEditing[key];
  delete state.groupRelationEditing[key];
  writeUrlState({ view: type, id: '' });
  renderObjectCollection(type);
  scheduleContextGraphRender();
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
      if (openItem.dataset.objectType === 'groups') {
        const drafts = Array.from(openItem.querySelectorAll('[data-group-relation-add][data-dirty="1"]'));
        for (const draft of drafts) {
          window.clearTimeout(state.editTimers[groupRelationDraftTimerKey(draft)]);
          if (!(await flushGroupRelationDraft(draft))) {
            return;
          }
        }
        const reverseRows = Array.from(openItem.querySelectorAll('[data-group-reverse-row][data-dirty="1"]'));
        for (const row of reverseRows) {
          window.clearTimeout(state.editTimers[groupReverseTimerKey(row)]);
          if (!(await flushGroupReverseRow(row))) {
            return;
          }
        }
      }
      await flushObjectEdit(openItem, true);
      if (openItem.dataset.dirty === '1' || openItem.dataset.saving === '1') {
        return;
      }
      delete state.relationshipEditing[key];
      delete state.groupRelationEditing[key];
    }
  }

  state.editing = {};
  state.editing[targetKey] = true;
  writeUrlState({ view: targetType, id: targetId });
  renderObjectCollections();
  scrollObjectEditorIntoView(targetType, targetId, targetListId);
  scheduleContextGraphRender();
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
  if (workspace && !workspace.hidden && contentArea && !usesDocumentScrollRoot()) {
    return contentArea;
  }

  return document.scrollingElement || document.documentElement;
}

function usesDocumentScrollRoot() {
  return window.matchMedia?.('(max-width: 780px)')?.matches === true;
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
  const groupReverseRow = boundary?.closest('[data-group-reverse-row]');
  if (groupReverseRow) {
    markGroupReverseRowChanged(groupReverseRow, 1800);
    return;
  }

  if (boundary?.closest('[data-group-relation-add]')) {
    markGroupRelationDraftChanged(boundary.closest('[data-group-relation-add]'), 1800);
    return;
  }

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

function handleGroupReverseAction(button) {
  const row = button.closest('[data-group-reverse-row]');
  if (!row || button.dataset.groupReverseAction !== 'toggle') {
    return;
  }

  const willOpen = row.classList.contains('is-collapsed');
  const groupItem = row.closest('[data-object-type="groups"][data-object-id]');
  if (willOpen) {
    collapseGroupEditRows(groupItem, row);
    state.groupRelationEditing[objectKey('groups', groupItem?.dataset.objectId || '')] = row.dataset.groupReverseKey || '';
  } else {
    delete state.groupRelationEditing[objectKey('groups', groupItem?.dataset.objectId || '')];
  }
  row.classList.toggle('is-collapsed', !willOpen);
  button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  applyContextGraphHighlight();
}

function toggleGroupRelationAddPanel(button) {
  const field = button.closest('[data-group-reverse-field]');
  const kind = button.dataset.groupRelationAddToggle || '';
  const slot = field?.querySelector(`[data-group-relation-add-slot="${cssEscape(kind)}"]`);
  if (!slot) {
    return;
  }

  const willOpen = slot.hidden;
  if (willOpen) {
    collapseGroupEditRows(field.closest('[data-object-type="groups"][data-object-id]'));
  }
  slot.hidden = !willOpen;
  button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  if (willOpen) {
    slot.querySelector('[data-reference-filter], [data-reference-input], input, select')?.focus();
  }
}

function collapseGroupEditRows(groupItem, exceptRow = null) {
  if (!groupItem) {
    return;
  }

  groupItem.querySelectorAll('[data-object-field] [data-list-item][data-list-collapsible="1"]').forEach((item) => {
    item.classList.add('is-collapsed');
    item.querySelector('[data-list-action="toggle"]')?.setAttribute('aria-expanded', 'false');
  });
  groupItem.querySelectorAll('[data-group-reverse-row]').forEach((row) => {
    if (row === exceptRow) {
      return;
    }
    row.classList.add('is-collapsed');
    row.querySelector('[data-group-reverse-action="toggle"]')?.setAttribute('aria-expanded', 'false');
  });
  groupItem.querySelectorAll('[data-group-relation-add-slot]').forEach((slot) => {
    slot.hidden = true;
  });
  delete state.relationshipEditing[objectKey('groups', groupItem.dataset.objectId || '')];
  if (!exceptRow) {
    delete state.groupRelationEditing[objectKey('groups', groupItem.dataset.objectId || '')];
  }
  writeUrlState({ view: 'groups', id: groupItem.dataset.objectId || '', edit: '' });
  applyContextGraphHighlight();
}

function markGroupRelationDraftChanged(root, delay = 700) {
  if (!root) {
    return;
  }

  root.dataset.dirty = '1';
  setGroupRelationState(root, 'Ungespeichert', false);
  const key = groupRelationDraftTimerKey(root);
  window.clearTimeout(state.editTimers[key]);
  state.editTimers[key] = window.setTimeout(() => {
    flushGroupRelationDraft(root);
  }, delay);
}

async function flushGroupRelationDraft(root) {
  const groupItem = root?.closest('[data-object-type="groups"][data-object-id]');
  const groupId = root?.dataset.groupId || groupItem?.dataset.objectId || '';
  const kind = root?.dataset.groupRelationAdd || '';
  if (!root || !groupItem || !groupId || !['membership', 'activity'].includes(kind)) {
    return false;
  }

  if (root.dataset.saving === '1') {
    await waitForElementSave(root);
  }
  if (!root.isConnected) {
    return true;
  }
  if (root.dataset.dirty !== '1') {
    return true;
  }
  if (!groupRelationDraftHasValue(root, kind, groupId)) {
    root.dataset.dirty = '';
    setGroupRelationState(root, '', false);
    return true;
  }

  const personId = nestedValue(root, 'person');
  const person = findReferenceObject('people', personId);
  if (!person) {
    setGroupRelationState(root, 'Person fehlt.', true);
    return false;
  }

  const entry = readGroupRelationEntry(root, kind, groupId);
  const field = kind === 'activity' ? 'activities' : 'memberships';
  root.dataset.saving = '1';
  setGroupRelationState(root, 'Wird gespeichert', false);

  try {
    const response = await postJson('object-update', {
      type: 'people',
      id: personId,
      base_revision: Number(person._revision || 0),
      object: {
        [field]: [...(Array.isArray(person[field]) ? person[field] : []), entry],
      },
    });
    updateObjectInState('people', response.object);
    const createdIndex = Math.max(0, (Array.isArray(response.object[field]) ? response.object[field].length : 1) - 1);
    state.groupRelationEditing[objectKey('groups', groupId)] = groupReverseRelationKey(kind, personId, createdIndex);
    refreshGroupReverseView(groupItem);
    renderNavigationCounts();
    return true;
  } catch (error) {
    if (error.status === 409 && error.payload?.current) {
      updateObjectInState('people', error.payload.current);
    }
    setGroupRelationState(root, localizeErrorMessage(error.message || 'Konnte nicht gespeichert werden.'), true);
    return false;
  } finally {
    if (root.isConnected) {
      root.dataset.saving = '';
    }
  }
}

function groupRelationDraftHasValue(root, kind, groupId) {
  const entry = readGroupRelationEntry(root, kind, groupId);
  return Boolean(
    nestedValue(root, 'person')
    || entry.role
    || periodHasValue(entry.period)
    || (entry._certainty && entry._certainty !== 'none')
  );
}

function groupRelationDraftTimerKey(root) {
  return ['group-relation-draft', root?.dataset.groupId || '', root?.dataset.groupRelationAdd || ''].join(':');
}

function readGroupRelationEntry(root, kind, groupId) {
  const entry = {
    group: groupId,
    period: readPeriod(root.querySelector('[data-period-editor]')),
    _certainty: nestedValue(root, '_certainty') || 'none',
    _sources: '',
  };
  if (kind === 'activity') {
    entry.role = nestedValue(root, 'role');
  }
  return entry;
}

function refreshGroupReverseView(groupItem) {
  const group = findReferenceObject('groups', groupItem?.dataset.objectId || '');
  if (!groupItem || !group) {
    return;
  }

  const main = groupItem.querySelector(':scope > .object-main');
  const existing = main?.querySelector(':scope > .reverse-view[aria-label="Abgeleitete Gruppendaten"], :scope > .reverse-view[aria-label="Abgeleitete Gruppendaten bearbeiten"]');
  const editable = Boolean(groupItem.querySelector(':scope [data-object-editor]')) && hasPermission('write');
  const html = renderGroupReverseView(group, { editable });
  if (existing) {
    if (html) {
      existing.outerHTML = html;
    } else {
      existing.remove();
    }
    return;
  }

  if (html) {
    main?.querySelector(':scope > [data-save-state]')?.insertAdjacentHTML('beforebegin', html);
  }
}

function setGroupRelationState(root, text, isError, autoHide = false) {
  setSaveStateElement(root?.querySelector('[data-group-relation-state]'), text, isError, {
    autoHideMs: autoHide ? 1600 : 0,
    hideWhenEmpty: true,
  });
}

function markGroupReverseRowChanged(row, delay = 900) {
  if (!row) {
    return;
  }

  row.dataset.dirty = '1';
  setGroupReverseRowState(row, 'Ungespeichert', false);
  const key = groupReverseTimerKey(row);
  window.clearTimeout(state.editTimers[key]);
  state.editTimers[key] = window.setTimeout(() => {
    flushGroupReverseRow(row);
  }, delay);
}

async function flushGroupReverseRow(row) {
  if (!row?.isConnected) {
    return true;
  }
  if (row.dataset.saving === '1') {
    await waitForElementSave(row);
  }
  if (!row.isConnected) {
    return true;
  }
  if (row.dataset.dirty !== '1') {
    return true;
  }

  const personId = row.dataset.personId || '';
  const field = row.dataset.relationField || '';
  const index = Number(row.dataset.relationIndex || -1);
  const person = findReferenceObject('people', personId);
  if (!person || !['memberships', 'activities'].includes(field) || !Number.isInteger(index) || index < 0) {
    setGroupReverseRowState(row, 'Bezug nicht gefunden.', true);
    return false;
  }

  const list = Array.isArray(person[field]) ? person[field].slice() : [];
  if (!list[index]) {
    setGroupReverseRowState(row, 'Eintrag nicht gefunden.', true);
    return false;
  }

  list[index] = readGroupReverseRowEntry(row);
  row.dataset.saving = '1';
  setGroupReverseRowState(row, 'Wird gespeichert', false);
  try {
    const response = await postJson('object-update', {
      type: 'people',
      id: personId,
      base_revision: Number(person._revision || 0),
      object: { [field]: list },
    });
    updateObjectInState('people', response.object);
    row.dataset.dirty = '';
    updateGroupReverseRowSummary(row);
    setGroupReverseRowState(row, 'Gespeichert', false, true);
    return true;
  } catch (error) {
    if (error.status === 409 && error.payload?.current) {
      updateObjectInState('people', error.payload.current);
    }
    setGroupReverseRowState(row, localizeErrorMessage(error.message || 'Konnte nicht gespeichert werden.'), true);
    return false;
  } finally {
    row.dataset.saving = '';
  }
}

async function waitForElementSave(element, timeoutMs = 5000) {
  const started = Date.now();
  while (element?.isConnected && element.dataset.saving === '1' && Date.now() - started < timeoutMs) {
    await new Promise((resolve) => window.setTimeout(resolve, 40));
  }
  return !element?.isConnected || element.dataset.saving !== '1';
}

function readGroupReverseRowEntry(row) {
  const entry = {
    group: row.dataset.groupId || '',
    period: readPeriod(row.querySelector('[data-period-editor]')),
    _certainty: nestedValue(row, '_certainty') || 'none',
    _sources: nestedValue(row, '_sources'),
  };
  if (row.dataset.relationField === 'activities') {
    entry.role = nestedValue(row, 'role');
  }
  return entry;
}

function updateGroupReverseRowSummary(row) {
  const person = findReferenceObject('people', row.dataset.personId || '');
  const entry = readGroupReverseRowEntry(row);
  const summary = row.dataset.relationField === 'activities'
    ? reverseActivityLineText({ person, value: entry, role: findReferenceObject('roles', activityRoleId(entry)), period: entry.period })
    : reversePersonLineText(person, entry.period);
  const warnings = row.dataset.relationField === 'activities'
    ? complexItemValidationWarnings('activity-list', entry, { ownerType: 'people', ownerObject: person, listField: 'activities', listIndex: Number(row.dataset.relationIndex || 0) })
    : complexItemValidationWarnings('membership-list', entry, { ownerType: 'people', ownerObject: person, listField: 'memberships', listIndex: Number(row.dataset.relationIndex || 0) });
  const button = row.querySelector(':scope .composite-summary');
  if (button) {
    button.innerHTML = compositeSummaryHtml(summary, warnings);
  }
}

function setGroupReverseRowState(row, text, isError, autoHide = false) {
  setSaveStateElement(row?.querySelector('[data-group-reverse-state]'), text, isError, {
    autoHideMs: autoHide ? 1400 : 0,
  });
}

function groupReverseTimerKey(row) {
  return ['group-reverse', row.dataset.personId || '', row.dataset.relationField || '', row.dataset.relationIndex || ''].join(':');
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
          if (fieldRoot.closest('[data-object-type="groups"][data-object-id]')) {
            collapseGroupEditRows(fieldRoot.closest('[data-object-type="groups"][data-object-id]'), null);
          }
        }
      }
      item.classList.toggle('is-collapsed', !willOpen);
      button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      syncNestedEditUrl(fieldRoot, item, willOpen);
    }
    return;
  }

  if (button.dataset.listAction === 'remove') {
    if (!confirmDangerButton(button)) {
      return;
    }

    const item = button.closest('[data-list-item]');
    const personKey = relationshipPersonKeyFromFieldRoot(fieldRoot);
    const ownerItem = fieldRoot.closest('[data-object-type][data-object-id]');
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
      refreshRelationshipRowKeys(fieldRoot);
    }
    if (ownerItem) {
      writeUrlState({ view: ownerItem.dataset.objectType || '', id: ownerItem.dataset.objectId || '', edit: '' });
    }
    applyContextGraphHighlight();
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
    const list = fieldRoot.querySelector('[data-list-items]');
    const item = list?.lastElementChild;
    if (item?.dataset.relationshipRowKey) {
      syncNestedEditUrl(fieldRoot, item, true);
    }
    refreshRelationshipRowKeys(fieldRoot);
  }

  markCompositeChanged(fieldRoot);
}

function refreshRelationshipRowKeys(fieldRoot) {
  if (!isRelationshipListField(fieldRoot)) {
    return;
  }

  const field = fieldRoot.dataset.objectField || '';
  const list = fieldRoot.querySelector(':scope > [data-list-items], :scope > .composite-list');
  const rows = Array.from(list?.children || []).filter((row) => row.matches('[data-list-item]'));
  if (field === 'mainPhase') {
    rows.forEach((row) => {
      row.dataset.relationshipRowKey = 'mainPhase';
    });
    return;
  }

  if (!['additionalPhases', 'memberships', 'activities'].includes(field)) {
    return;
  }

  rows.forEach((row, index) => {
    row.dataset.relationshipRowKey = `${field}:${index}`;
  });
}

function syncNestedEditUrl(fieldRoot, item, isOpen) {
  const ownerItem = fieldRoot.closest('[data-object-type][data-object-id]');
  const rowKey = item?.dataset.relationshipRowKey || '';
  if (!ownerItem || !validNestedEditKey(rowKey)) {
    return;
  }

  const type = ownerItem.dataset.objectType || '';
  const id = ownerItem.dataset.objectId || '';
  const key = objectKey(type, id);
  if (isOpen) {
    state.relationshipEditing[key] = rowKey;
    writeUrlState({ view: type, id, edit: rowKey });
  } else if (state.relationshipEditing[key] === rowKey) {
    delete state.relationshipEditing[key];
    writeUrlState({ view: type, id, edit: '' });
  }
  applyContextGraphHighlight();
}

function focusExistingInitialObject(triggerButton) {
  const item = document.querySelector('[data-object-type][data-object-id][data-initial-object="1"]');
  if (!item) {
    return false;
  }

  showInlineActionFeedback(triggerButton, 'Neuer Eintrag ist bereits geöffnet.');
  scrollElementIntoView(item);
  item.querySelector('[data-object-field] input, [data-object-field] textarea, [data-object-field] select, input, textarea, select')?.focus();
  return true;
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

  showInlineActionFeedback(triggerButton, 'Neuer Eintrag ist bereits geöffnet.');
  scrollElementIntoView(form);
  form.querySelector('[data-object-field] input, [data-object-field] textarea, [data-object-field] select, input, textarea, select')?.focus();
  return true;
}

async function createObjectImmediately(type, triggerButton = null) {
  if (!objectCollections.includes(type) || !hasPermission('write')) {
    return false;
  }

  if (triggerButton) {
    triggerButton.disabled = true;
    triggerButton.dataset.previousText = triggerButton.textContent || '';
    triggerButton.textContent = 'Erstellt ...';
  }

  try {
    if (!(await closeOpenEditorsBeforeSwitch())) {
      return false;
    }
    collectionTypes.forEach((collectionType) => {
      state.createOpen[collectionType] = false;
    });

    const response = await postJson('object-create', {
      type,
      object: {},
    });
    const object = response.object;
    const id = objectId(object);
    const key = objectKey(type, id);
    updateObjectInState(type, object);
    state.initialObjects.add(key);
    state.editing = { [key]: true };
    clearCollectionNarrowingForDeepLink(type);
    writeUrlState({ view: type, id, edit: '' });
    renderObjectCollections();
    scrollObjectEditorIntoView(type, id);
    return true;
  } catch (error) {
    if (triggerButton) {
      showInlineActionFeedback(triggerButton, localizeErrorMessage(error.message || 'Eintrag konnte nicht erstellt werden.'));
    }
    return false;
  } finally {
    if (triggerButton) {
      triggerButton.disabled = false;
      triggerButton.textContent = triggerButton.dataset.previousText || triggerButton.textContent;
      delete triggerButton.dataset.previousText;
    }
  }
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
  syncNestedEditUrl(fieldRoot, row, true);
  showInlineActionFeedback(triggerButton, 'Neuer Eintrag ist bereits geöffnet.');
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
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    isNewComplexItem: true,
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

  updateReferenceControlLink(select);

  const periodEditor = select.closest('[data-period-editor]');
  if (periodEditor) {
    refreshPeriodDependentPickers(periodEditor, select);
    return;
  }

  const action = select.value;
  const groupPhaseEditor = select.closest('[data-group-phase-editor]');
  if (groupPhaseEditor && select.dataset.referencePicker === 'group-phase-type') {
    const parentSelect = groupPhaseEditor.querySelector('[data-reference-picker="group-phase-parent"]');
    if (parentSelect) {
      updateReferenceSelectOptions(parentSelect);
    }
    return;
  }

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
  renderReferenceFilterResults(input);
}

function updateReferenceSelectOptions(select) {
  const current = referenceSelectValue(select);
  const collection = select.dataset.referenceCollection || '';
  const showIds = select.dataset.referenceShowIds === '1';
  const config = referenceOptionConfigForSelect(select, current);
  const currentInScope = config.allowOutOfScopeCurrent || referenceValueInScope(collection, current, config);
  const defaultInScope = config.defaultValue && referenceValueInScope(collection, config.defaultValue, config);
  const nextValue = current && currentInScope ? current : (defaultInScope ? config.defaultValue : '');
  select.innerHTML = referenceOptions(collection, showIds, { ...config, currentValue: nextValue });
  select.value = Array.from(select.options).some((option) => option.value === nextValue) ? nextValue : '';
  filterReferenceOptions(select, select.closest('[data-reference-field]')?.querySelector('[data-reference-filter]')?.value || '');
  updateReferenceControlLink(select);
}

function updateReferenceControlLink(select) {
  const link = select?.closest('.reference-select-row')?.querySelector('[data-reference-link]');
  if (!link) {
    return;
  }

  const collection = select.dataset.referenceCollection || '';
  const value = referenceSelectValue(select);
  const canLink = objectCollections.includes(collection) && value;
  link.href = canLink ? objectUrl(collection, value) : '#';
  link.dataset.linkView = collection;
  link.dataset.linkId = value;
  link.hidden = !canLink;
}

function renderReferenceFilterResults(input) {
  const field = input.closest('[data-reference-field]');
  const results = field?.querySelector('[data-reference-filter-results]');
  const select = field?.querySelector('[data-reference-input]');
  if (!results || !select) {
    return;
  }

  const query = String(input.value || '').trim();
  if (query.length < 2) {
    hideReferenceFilterResults(field);
    return;
  }

  const collection = select.dataset.referenceCollection || '';
  const showIds = select.dataset.referenceShowIds === '1';
  const config = referenceOptionConfigForSelect(select, referenceSelectValue(select));
  const objects = referencePickerObjects(collection, config);
  const createCheckObjects = (state.objects[collection] || []).filter((object) => !object._deleted);
  const matches = objects
    .filter((object) => referenceObjectMatchesQuery(collection, object, query, objects, showIds))
    .slice(0, 8);
  const create = smartReferenceCreateCandidate(collection, query, config, createCheckObjects, showIds);
  const resultHtml = matches.map((object) => referenceResultHtml(collection, object)).join('');
  const createHtml = create ? smartReferenceCreateHtml(create) : '';

  results.innerHTML = resultHtml + createHtml || '<div class="reference-filter-empty">Keine Treffer</div>';
  results.hidden = false;
}

function referenceObjectMatchesQuery(collection, object, query, objects = [], showIds = false) {
  const needle = foldSearchText(query);
  const text = [
    referenceOptionLabel(object, collection, objects, showIds),
    collectionSearchText(collection, object),
  ].filter(Boolean).join(' ');
  return foldSearchText(text).includes(needle);
}

function referenceResultHtml(collection, object) {
  const id = objectId(object);
  return `
    <button class="reference-filter-result" type="button" data-reference-result-value="${escapeAttribute(id)}">
      <strong>${escapeHtml(referenceOptionMainLabel(object, collection, id))}</strong>
      <span>${escapeHtml([objectTypeLabels[collection] || collection, referenceOptionDetail(object, collection)].filter(Boolean).join(' · '))}</span>
    </button>
  `;
}

function smartReferenceCreateHtml(candidate) {
  return `
    <button class="reference-filter-result reference-filter-create" type="button" data-reference-create-type="${escapeAttribute(candidate.type)}" data-reference-create-payload="${escapeAttribute(JSON.stringify(candidate.payload))}">
      <strong>${escapeHtml(candidate.title)}</strong>
      <span>${escapeHtml(candidate.detail)}</span>
    </button>
  `;
}

function hideReferenceFilterResults(root = document) {
  root.querySelectorAll('[data-reference-filter-results]').forEach((results) => {
    results.hidden = true;
    results.innerHTML = '';
  });
}

function smartReferenceCreateCandidate(collection, query, config = {}, objects = [], showIds = false) {
  if (!hasPermission('write') || !objectCollections.includes(collection)) {
    return null;
  }

  const text = String(query || '').trim().replace(/\s+/g, ' ');
  if (text.length < 2) {
    return null;
  }

  if (collection === 'groups') {
    return smartGroupCreateCandidate(text, config, objects, showIds);
  }

  if (collection === 'timepoints') {
    return smartTimepointCreateCandidate(text, objects, showIds, config);
  }

  if (referenceHasExactQueryMatch(collection, text, objects, showIds)) {
    return null;
  }

  if (collection === 'people') {
    return {
      type: 'people',
      payload: { scoutname: text },
      title: `Person "${text}" erstellen`,
      detail: 'Neuer Eintrag wird angelegt und ausgewählt',
    };
  }

  const field = collection === 'roles' || collection === 'group-types' ? 'label' : 'name';
  const payload = { [field]: text };
  if (collection === 'roles') {
    const group = findReferenceObject('groups', config.groupId || '');
    const groupTypes = groupTypeIds(group);
    if (groupTypes.length) {
      payload.groupTypes = groupTypes;
    }
  }

  return {
    type: collection,
    payload,
    title: `${objectTypeLabels[collection] || 'Eintrag'} "${text}" erstellen`,
    detail: 'Neuer Eintrag wird angelegt und ausgewählt',
  };
}

function smartGroupCreateCandidate(query, config = {}, objects = [], showIds = false) {
  if (config.requireParentGroupType && !config.parentGroupTypeId) {
    return null;
  }

  const parsed = parseGroupCreateQuery(query, config);
  const name = parsed.name || (parsed.groupTypeId ? '' : query);
  const displayName = [parsed.groupTypeLabel, name].filter(Boolean).join(' ') || query;
  const payload = { name };
  if (parsed.groupTypeId) {
    payload.mainPhase = {
      groupType: parsed.groupTypeId,
      parentGroup: defaultParentGroupForPhase(parsed.groupTypeId, config.excludeGroupId || ''),
      period: emptyPeriod(),
    };
  }

  if (smartGroupDuplicateExists(name, parsed.groupTypeId, objects, showIds, query)) {
    return null;
  }

  return {
    type: 'groups',
    payload,
    title: `Gruppe "${displayName}" erstellen`,
    detail: parsed.groupTypeLabel ? `Gruppenart: ${parsed.groupTypeLabel}` : 'Neue Gruppe ohne Gruppenart',
  };
}

function parseGroupCreateQuery(query, config = {}) {
  const text = String(query || '').trim().replace(/\s+/g, ' ');
  const contextTypeId = config.parentGroupTypeId || uniqueRoleGroupTypeId(config.roleId || '');
  if (contextTypeId) {
    const label = objectLabel(findReferenceObject('group-types', contextTypeId), 'group-types');
    return {
      groupTypeId: contextTypeId,
      groupTypeLabel: label,
      name: removeGroupTypePrefix(text, contextTypeId),
    };
  }

  const match = matchingGroupTypePrefix(text);
  if (match) {
    return match;
  }

  return { groupTypeId: '', groupTypeLabel: '', name: text };
}

function matchingGroupTypePrefix(query) {
  const foldedQuery = foldSearchText(query);
  const groupTypes = (state.objects['group-types'] || [])
    .filter((type) => !type._deleted)
    .map((type) => ({ id: objectId(type), label: objectLabel(type, 'group-types') }))
    .filter((type) => type.id && type.label)
    .sort((left, right) => right.label.length - left.label.length);

  for (const type of groupTypes) {
    const foldedLabel = foldSearchText(type.label);
    if (foldedQuery === foldedLabel || foldedQuery.startsWith(`${foldedLabel} `)) {
      return {
        groupTypeId: type.id,
        groupTypeLabel: type.label,
        name: query.slice(type.label.length).trim(),
      };
    }
  }

  return null;
}

function removeGroupTypePrefix(query, groupTypeId) {
  const label = objectLabel(findReferenceObject('group-types', groupTypeId), 'group-types');
  if (!label) {
    return query;
  }

  const foldedQuery = foldSearchText(query);
  const foldedLabel = foldSearchText(label);
  if (foldedQuery === foldedLabel) {
    return '';
  }
  return foldedQuery.startsWith(`${foldedLabel} `) ? query.slice(label.length).trim() : query;
}

function uniqueRoleGroupTypeId(roleId) {
  const ids = roleGroupTypeIds(findReferenceObject('roles', roleId));
  return ids.length === 1 ? ids[0] : '';
}

function smartGroupDuplicateExists(name, groupTypeId, objects, showIds, query) {
  const foldedName = foldSearchText(name);
  return objects.some((group) => {
    const sameLabel = referenceObjectExactQueryMatch('groups', group, query, objects, showIds);
    const sameName = foldSearchText(group.name || objectLabel(group, 'groups')) === foldedName;
    const sameType = !groupTypeId || groupTypeIds(group).includes(groupTypeId);
    return sameLabel || (sameName && sameType);
  });
}

function smartTimepointCreateCandidate(query, objects, showIds, config = {}) {
  const parsed = parseTimepointCreateQuery(query);
  if (!parsed.name && !parsed.rawDate) {
    return null;
  }

  const year = parsed.rawDate ? Number(dateYear(readDateValue(parsed.rawDate)) || 0) : 0;
  if ((config.minYear && year && year < config.minYear) || (config.maxYear && year && year > config.maxYear)) {
    return null;
  }

  if (smartTimepointDuplicateExists(parsed, objects, showIds, query)) {
    return null;
  }

  const payload = {
    name: parsed.name,
    date: parsed.rawDate ? readDateValue(parsed.rawDate) : null,
  };
  const title = parsed.name || parsed.rawDate;
  const detail = parsed.rawDate
    ? `Neuer Zeitpunkt mit Datum ${compactDateDisplayValue(payload.date)}`
    : 'Neuer Zeitpunkt ohne Datum';

  return {
    type: 'timepoints',
    payload,
    title: `Zeitpunkt "${title}" erstellen`,
    detail,
  };
}

function parseTimepointCreateQuery(query) {
  const text = String(query || '').trim().replace(/\s+/g, ' ');
  const match = text.match(/^(.*?)(?:\s+)?(\d{1,2}\.\d{1,2}\.\d{1,4}|\d{1,2}\.\d{1,4}|\d{1,4}(?:-\d{1,2}(?:-\d{1,2})?)?)$/);
  if (!match) {
    return { name: text, rawDate: '' };
  }

  const rawDate = normalizeDateRaw(match[2]);
  if (!rawDate || !datePartsFromRaw(rawDate)) {
    return { name: text, rawDate: '' };
  }

  return {
    name: match[1].trim(),
    rawDate,
  };
}

function smartTimepointDuplicateExists(parsed, objects, showIds, query) {
  const foldedName = foldSearchText(parsed.name);
  const raw = normalizeDateRaw(parsed.rawDate);
  const year = dateYear(readDateValue(raw));
  return objects.some((timepoint) => {
    if (referenceObjectExactQueryMatch('timepoints', timepoint, query, objects, showIds)) {
      return true;
    }

    const timepointRaw = dateRawString(timepoint.date);
    const sameDate = raw && (timepointRaw === raw || (year && dateYear(timepoint.date) === year));
    const sameName = foldedName && foldSearchText(timepoint.name || objectLabel(timepoint, 'timepoints')) === foldedName;
    const unnamedSameDate = !foldedName && sameDate && !foldSearchText(timepoint.name || '');
    return Boolean((sameName && sameDate) || unnamedSameDate);
  });
}

function referenceHasExactQueryMatch(collection, query, objects = [], showIds = false) {
  return objects.some((object) => referenceObjectExactQueryMatch(collection, object, query, objects, showIds));
}

function referenceObjectExactQueryMatch(collection, object, query, objects = [], showIds = false) {
  const needle = foldSearchText(query);
  return [
    objectLabel(object, collection),
    referenceOptionLabel(object, collection, objects, showIds),
    referenceOptionText(referenceOptionMainLabel(object, collection, objectId(object)), referenceOptionDetail(object, collection), collection),
  ].filter(Boolean).some((value) => foldSearchText(value) === needle);
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
    const fixedGroupId = select.dataset.referenceFixedGroup || '';
    const groupId = fixedGroupId || referenceSelectValue(activityEditor?.querySelector('[data-reference-picker="activity-group"]'));
    config.groupId = groupId;
    if (!fixedGroupId && groupTypeIds(findReferenceObject('groups', groupId)).length) {
      config.actionValue = pickerActionShowAllRoles;
      config.actionLabel = 'Alle Rollen anzeigen (Gruppe leeren)';
    }
  }

  const groupPhaseEditor = select.closest('[data-group-phase-editor]');
  if (picker === 'group-phase-parent') {
    const groupTypeId = referenceSelectValue(groupPhaseEditor?.querySelector('[data-reference-picker="group-phase-type"]'));
    const ownerObject = ownerRootForElement(select)?.closest('[data-object-type][data-object-id]');
    config.excludeGroupId = ownerObject?.dataset.objectType === 'groups' ? ownerObject.dataset.objectId : '';
    config.parentGroupTypeId = groupTypeParentGroupTypeId(findReferenceObject('group-types', groupTypeId));
    config.requireParentGroupType = true;
    config.strictReferenceScope = true;
    if (groupPhaseEditor?.dataset.newGroupPhase === '1' || !currentValue) {
      config.defaultValue = defaultParentGroupForPhase(groupTypeId, config.excludeGroupId);
    }
  }

  if (picker === 'parent-group-type') {
    const ownerObject = ownerRootForElement(select)?.closest('[data-object-type][data-object-id]');
    config.excludeGroupTypeId = ownerObject?.dataset.objectType === 'group-types' ? ownerObject.dataset.objectId : '';
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
  const explicit = Number(select?.dataset.ownerBirthYear || 0);
  if (explicit) {
    return explicit;
  }
  if (ownerType !== 'people') {
    return 0;
  }

  const birthdateInput = root.querySelector('[data-object-field="birthdate"]');
  return birthYearFromDateValue(birthdateInput?.value);
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

function handleAuditControlChange(event) {
  const control = event.target.closest('[data-audit-control]');
  if (!control) {
    return;
  }

  const name = control.dataset.auditControl || '';
  if (name === 'event' || name === 'username') {
    state.auditFilters[name] = control.value || '';
    renderAuditLog();
  }
}

function handleChangeLogControlChange(event) {
  const control = event.target.closest('[data-change-log-control]');
  if (!control) {
    return;
  }

  const name = control.dataset.changeLogControl || '';
  if (name === 'fields') {
    state.changeLogFilters.fields = Array.from(control.selectedOptions || []).map((option) => option.value).filter(Boolean);
    renderChangeLog();
    return;
  }

  if (name === 'type' || name === 'username' || name === 'action') {
    state.changeLogFilters[name] = control.value || '';
    renderChangeLog();
  }
}

function handleAuditControlClick(event) {
  const button = event.target.closest('[data-audit-clear-filter]');
  if (!button) {
    return;
  }

  const name = button.dataset.auditClearFilter || '';
  if (name === 'event' || name === 'username') {
    state.auditFilters[name] = '';
    renderAuditLog();
  }
}

function handleChangeLogControlClick(event) {
  const button = event.target.closest('[data-change-log-clear-filter]');
  if (!button) {
    return;
  }

  const name = button.dataset.changeLogClearFilter || '';
  if (name === 'fields') {
    state.changeLogFilters.fields = [];
    renderChangeLog();
    return;
  }

  if (name === 'type' || name === 'username' || name === 'action') {
    state.changeLogFilters[name] = '';
    renderChangeLog();
  }
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
  if (event.target.closest('[data-reference-filter]')) {
    return;
  }

  const groupRelationDraft = event.target.closest('[data-group-relation-add]');
  if (groupRelationDraft) {
    const dateInput = event.target.closest('[data-date-control]');
    if (dateInput) {
      syncDateControlRaw(dateInput);
      refreshPeriodDependentPickers(dateInput.closest('[data-period-editor]'), dateInput);
    }
    markGroupRelationDraftChanged(groupRelationDraft, 1400);
    return;
  }

  const groupReverseRow = event.target.closest('[data-group-reverse-row]');
  if (groupReverseRow) {
    const dateInput = event.target.closest('[data-date-control]');
    if (dateInput) {
      syncDateControlRaw(dateInput);
      refreshPeriodDependentPickers(dateInput.closest('[data-period-editor]'), dateInput);
    }
    markGroupReverseRowChanged(groupReverseRow, 1400);
    return;
  }

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
  if (event.target.closest('[data-reference-filter]')) {
    return;
  }

  const groupRelationDraft = event.target.closest('[data-group-relation-add]');
  if (groupRelationDraft) {
    const dateInput = event.target.closest('[data-date-control]');
    if (dateInput) {
      syncDateControlRaw(dateInput);
      refreshPeriodDependentPickers(dateInput.closest('[data-period-editor]'), dateInput);
    }
    markGroupRelationDraftChanged(groupRelationDraft, 500);
    return;
  }

  const groupReverseRow = event.target.closest('[data-group-reverse-row]');
  if (groupReverseRow) {
    const dateInput = event.target.closest('[data-date-control]');
    if (dateInput) {
      syncDateControlRaw(dateInput);
      refreshPeriodDependentPickers(dateInput.closest('[data-period-editor]'), dateInput);
    }
    markGroupReverseRowChanged(groupReverseRow, 600);
    return;
  }

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
    if (force) {
      finishInitialObjectEditing(item);
    }
    return;
  }

  const type = item.dataset.objectType;
  const id = item.dataset.objectId;
  const revision = Number(item.dataset.revision || 0);
  const isInitialObject = item.dataset.initialObject === '1';
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
      initial_revision: isInitialObject,
    });

    updateObjectInState(type, response.object);
    item.dataset.revision = Number(response.object._revision || revision);
    item.dataset.initialObject = isInitialObject && !force ? '1' : '0';
    if (force) {
      finishInitialObjectEditing(item);
    }
    updateObjectChrome(item, type, response.object);

    const currentPayloadKey = JSON.stringify(collectObjectFields(item));
    if (currentPayloadKey === payloadKey) {
      item.dataset.dirty = '';
      item.dataset.lastSavedPayload = payloadKey;
      clearNewGroupPhaseMarkers(item);
      setObjectSaveState(item, 'Gespeichert', false, true);
      if (state.timeframe.start) {
        applyTimeframeToOpenEditors();
        if (!objectRelevantToTimeframe(type, response.object)) {
          setObjectSaveState(item, 'Gespeichert · außerhalb des gewählten Zeitraums', false, true);
        }
      }
    } else {
      item.dataset.dirty = '1';
      scheduleObjectSave(item, 900);
    }
  } catch (error) {
    await handleObjectSaveError(item, error);
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
    if (isPermissionDeniedError(error)) {
      showPermissionDeniedToast(error);
      await reloadObjectData();
      return false;
    }
    setCreateState(form, localizeErrorMessage(error.message || 'Eintrag konnte nicht erstellt werden.'), true);
    return false;
  }
}

function finishInitialObjectEditing(item) {
  if (!item) {
    return;
  }

  state.initialObjects.delete(objectKey(item.dataset.objectType, item.dataset.objectId));
  item.dataset.initialObject = '0';
}

function clearNewGroupPhaseMarkers(root) {
  root.querySelectorAll('[data-group-phase-editor][data-new-group-phase="1"]').forEach((editor) => {
    editor.dataset.newGroupPhase = '0';
  });
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
    await handleObjectSaveError(item, error);
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
    parentGroup: nestedValue(root, 'parentGroup'),
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
  return Boolean(groupPhaseTypeId(value) || groupPhaseParentGroupId(value) || periodHasValue(value?.period));
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
    return `Datumsgenauigkeit ${targetLabel} bestätigen`;
  }

  return `Datumsgenauigkeit ${targetLabel} auswählen`;
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
  scheduleContextGraphRender();
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

async function handleObjectSaveError(item, error) {
  if (isPermissionDeniedError(error)) {
    showPermissionDeniedToast(error);
    await reloadObjectData();
    return;
  }

  if (error.status === 409 && error.payload?.current) {
    updateObjectInState(item.dataset.objectType, error.payload.current);
    setObjectSaveState(item, 'Konflikt: Bitte vor der nächsten Bearbeitung neu laden.', true);
    return;
  }

  setObjectSaveState(item, localizeErrorMessage(error.message || 'Eintrag konnte nicht aktualisiert werden.'), true);
}

function isPermissionDeniedError(error) {
  return error?.status === 403 || String(error?.message || '') === localizeErrorMessage('Permission denied');
}

function showPermissionDeniedToast(error) {
  showAuthMessage(localizeErrorMessage(error?.message || 'Permission denied'), true, 4500);
}

function setObjectSaveState(item, text, isError, autoHide = false) {
  setSaveStateElement(item.querySelector('[data-save-state]'), text, isError, {
    autoHideMs: autoHide ? 1400 : 0,
  });
}

function setUserSaveState(item, text, isError, autoHide = false) {
  setSaveStateElement(item.querySelector('[data-user-save-state]'), text, isError, {
    autoHideMs: autoHide ? 1400 : 0,
    localize: true,
  });
}

function setCreateState(form, text, isError) {
  setSaveStateElement(form.querySelector('[data-create-state]'), text, isError);
}

function setExampleDataState(text, isError, autoHide = false) {
  setSaveStateElement(exampleDataState, text, isError, {
    autoHideMs: autoHide ? 2200 : 0,
  });
}

function setSaveStateElement(element, text, isError, options = {}) {
  if (!element) {
    return;
  }

  const message = options.localize ? localizeErrorMessage(text) : text;
  element.hidden = options.hideWhenEmpty ? !message : false;
  element.textContent = message;
  element.className = `object-save-state ${isError ? 'is-error' : ''}`;
  if (options.autoHideMs > 0) {
    window.setTimeout(() => {
      if (element.textContent === message) {
        element.hidden = true;
      }
    }, options.autoHideMs);
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
    const groupType = timeframeGroupTypeLabel(object) || 'Gruppe';
    const name = object.name || object.label || object.description;
    return name ? [groupType, name].filter(Boolean).join(' ') : fallbackObjectTitle(type, id);
  }

  return objectLabel(object, type);
}

function timeframeGroupTypeLabel(group) {
  const phase = groupPhaseEntries(group)
    .find((entry) => relationshipRelevantToTimeframe('phase', entry.phase))?.phase;
  return objectLabel(findReferenceObject('group-types', groupPhaseTypeId(phase)), 'group-types')
    || groupTypeLabel(group, state.groupTypes || []);
}

function objectPropertyTags(type, object) {
  if (type === 'people') {
    const roleIds = uniqueStrings((Array.isArray(object.activities) ? object.activities : [])
      .filter((activity) => relationshipRelevantToTimeframe('activity', activity))
      .map((activity) => activityRoleId(activity))
      .filter(Boolean));
    return roleIds
      .map((id) => referenceLabelForSubtitle('roles', id, 'Rolle'))
      .filter(Boolean);
  }

  if (type === 'groups') {
    return uniqueStrings(groupPhaseEntries(object)
      .filter(({ phase }) => relationshipRelevantToTimeframe('phase', phase))
      .map(({ phase }) => groupPhaseTypeId(phase)))
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

function objectListMeta(type, object) {
  if (type === 'groups') {
    if (!state.timeframe.start) {
      const period = object.mainPhase && typeof object.mainPhase === 'object' ? object.mainPhase.period : null;
      return periodYearLabel(period) || 'offener Zeitraum';
    }
    const periods = groupPhaseEntries(object)
      .filter(({ phase }) => relationshipRelevantToTimeframe('phase', phase))
      .map(({ phase }) => phase.period);
    return publicPeriodSpan(periods) || 'offener Zeitraum';
  }

  if (type === 'timepoints') {
    return [timepointValue(object), object.location].filter(Boolean).join(' · ');
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
    ...(Array.isArray(person.memberships) ? person.memberships : [])
      .filter((entry) => relationshipRelevantToTimeframe('membership', entry))
      .flatMap((entry) => effectiveRelationshipPeriods(entry, 'membership')),
    ...(Array.isArray(person.activities) ? person.activities : [])
      .filter((entry) => relationshipRelevantToTimeframe('activity', entry))
      .flatMap((entry) => effectiveRelationshipPeriods(entry, 'activity')),
  ]
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
    collectGroupPhaseWarnings(warnings, group.mainPhase, 'Hauptphase', true, { ownerGroupId: objectId(group) });
  }

  (Array.isArray(group?.additionalPhases) ? group.additionalPhases : []).forEach((phase) => {
    collectGroupPhaseWarnings(warnings, phase, groupPhaseValidationLabel(phase), true, { ownerGroupId: objectId(group) });
  });
}

function collectGroupTypeWarnings(warnings, groupType) {
  if (!hasTrimmedText(groupType?.label)) {
    warnings.push('Name fehlt.');
  }
  collectDuplicateLabelWarning(warnings, 'group-types', groupType, groupType?.label);
  const parentTypeId = groupTypeParentGroupTypeId(groupType);
  if (parentTypeId) {
    collectReferenceWarning(warnings, 'group-types', parentTypeId, '', 'Übergeordnete Gruppenart nicht gefunden.');
    if (parentTypeId === objectId(groupType)) {
      warnings.push('Übergeordnete Gruppenart darf nicht dieselbe Gruppenart sein.');
    }
  }
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

  collectPeriodWarnings(warnings, membership?.period, label);
  effectiveRelationshipPeriods(membership, 'membership')
    .forEach((period) => collectBirthPeriodWarning(warnings, birthYear, period, label));
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

  collectPeriodWarnings(warnings, activity?.period, label);
  effectiveRelationshipPeriods(activity, 'activity')
    .forEach((period) => collectBirthPeriodWarning(warnings, birthYear, period, label));
  collectGroupPeriodWarning(warnings, groupId, activity?.period, label);
  collectActivityRoleWarning(warnings, activity, label);
}

function collectGroupPhaseWarnings(warnings, phase, label, requirePeriod = false, options = {}) {
  const groupTypeId = groupPhaseTypeId(phase);
  if (!groupTypeId) {
    warnings.push(labeledWarning(label, 'Gruppenart fehlt.'));
  } else {
    collectReferenceWarning(warnings, 'group-types', groupTypeId, label, 'Gruppenart nicht gefunden.');
  }

  const parentGroupId = groupPhaseParentGroupId(phase);
  if (parentGroupId) {
    collectReferenceWarning(warnings, 'groups', parentGroupId, label, 'Übergeordnete Gruppe nicht gefunden.');
    if (parentGroupId === options.ownerGroupId) {
      warnings.push(labeledWarning(label, 'Übergeordnete Gruppe darf nicht dieselbe Gruppe sein.'));
    }
    const parentGroupTypeId = groupTypeParentGroupTypeId(findReferenceObject('group-types', groupTypeId));
    if (parentGroupTypeId && !groupTypeIds(findReferenceObject('groups', parentGroupId)).includes(parentGroupTypeId)) {
      warnings.push(labeledWarning(label, 'Übergeordnete Gruppe passt nicht zur übergeordneten Gruppenart.'));
    }
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

function groupPhaseEntries(group) {
  if (!group || typeof group !== 'object') {
    return [];
  }

  return [
    group.mainPhase && typeof group.mainPhase === 'object' ? { phase: group.mainPhase, rowKey: 'mainPhase' } : null,
    ...(Array.isArray(group.additionalPhases)
      ? group.additionalPhases.map((phase, index) => (phase && typeof phase === 'object' ? { phase, rowKey: `additionalPhases:${index}` } : null))
      : []),
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

function effectiveRelationshipPeriods(entry, kind) {
  if (periodHasValue(entry?.period)) {
    return [entry.period];
  }

  const group = findReferenceObject('groups', periodEntryGroupId(entry));
  let phases = groupPhases(group);
  if (kind === 'activity') {
    const allowedGroupTypes = roleGroupTypeIds(findReferenceObject('roles', activityRoleId(entry)));
    if (allowedGroupTypes.length) {
      phases = phases.filter((phase) => allowedGroupTypes.includes(groupPhaseTypeId(phase)));
    }
  }

  return phases.map((phase) => phase?.period).filter(periodHasValue);
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

function timepointValue(timepoint) {
  return dateDisplayValue(timepoint.date);
}

function hasPendingObjectEdits() {
  return Boolean(document.querySelector('[data-create-form], [data-user-create-form], [data-user-editor], [data-object-editor], [data-period-action="undo-custom-date"], [data-object-type][data-dirty="1"], [data-object-type][data-saving="1"], [data-group-reverse-row][data-dirty="1"], [data-group-reverse-row][data-saving="1"], [data-group-relation-add][data-dirty="1"], [data-group-relation-add][data-saving="1"]'));
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

function renderAccountPage() {
  if (!accountPage || !accountForm || !accountPasskeys) {
    return;
  }

  const account = state.account || { user: state.status?.auth?.user || {}, passkeys: [] };
  const user = account.user || {};
  if (accountUsername) {
    accountUsername.textContent = user.username || '';
  }
  accountForm.querySelector('input[name="display_name"]').value = user.display_name || '';
  accountForm.querySelector('input[name="email"]').value = user.email || '';
  accountForm.dataset.dirty = '';
  accountForm.dataset.saving = '';
  accountForm.dataset.lastSavedPayload = JSON.stringify(accountPayload());

  const passkeys = Array.isArray(account.passkeys) ? account.passkeys : [];
  accountPasskeys.innerHTML = passkeys.length
    ? passkeys.map((passkey, index) => renderAccountPasskey(passkey, index)).join('')
    : '<div class="empty-state">Keine Passkeys registriert.</div>';
}

function renderAccountPasskey(passkey, index) {
  const title = `Passkey ${index + 1}`;
  const meta = [
    passkey.created_at ? `erstellt ${formatDateTime(passkey.created_at)}` : '',
    passkey.last_used_at ? `zuletzt ${formatDateTime(passkey.last_used_at)}` : 'noch nicht verwendet',
    Array.isArray(passkey.transports) && passkey.transports.length ? passkey.transports.join(', ') : '',
    passkey.client_origin || '',
  ].filter(Boolean).join(' / ');

  return `
    <article class="account-passkey">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(meta)}</small>
      </div>
      <button class="button button-danger" type="button" data-account-passkey-delete="${escapeAttribute(passkey.id || '')}" data-danger-confirm>Löschen</button>
    </article>
  `;
}

function renderUsersManagement() {
  if (!hasPermission('manage_users')) {
    return;
  }

  renderCreatePanel('users');
  renderCollectionControls();
  renderNavigationCounts();
  renderUserList();
}

function renderAuditLog() {
  if (!auditList || !hasPermission('manage_users')) {
    return;
  }

  renderAuditControls();
  const entries = filteredAuditLog();
  auditList.innerHTML = `
    <div class="audit-row audit-header">
      <span>Zeit</span>
      <span>Typ</span>
      <span>Benutzer</span>
      <span>Details</span>
    </div>
    ${entries.length
      ? entries.map((entry) => renderAuditEntry(entry)).join('')
      : '<div class="empty-state">Keine Audit-Einträge.</div>'}
  `;
}

function renderChangeLog() {
  if (!changeLogList || !hasPermission('manage_users')) {
    return;
  }

  renderChangeLogControls();
  const entries = filteredChangeLog();
  changeLogList.innerHTML = `
    <div class="change-log-row change-log-header">
      <span>Zeit</span>
      <span>Eintrag</span>
      <span>Benutzer</span>
      <span>Änderung</span>
    </div>
    ${entries.length
      ? entries.map((entry) => renderChangeLogEntry(entry)).join('')
      : '<div class="empty-state">Keine Änderungen.</div>'}
  `;
}

function renderChangeLogEntry(entry) {
  const type = String(entry.type || '');
  const id = String(entry.id || '');
  const edit = String(entry.part?.edit || '');
  const object = findReferenceObject(type, id);
  const title = object ? objectListTitle(type, object) : fallbackObjectTitle(type, id);
  const partLabel = String(entry.part?.label || 'Eintrag');
  const action = changeActionLabel(String(entry.action || 'updated'));
  const actionClass = changeActionClass(String(entry.action || 'updated'));
  const details = [
    objectTypeLabels[type] || type,
    partLabel,
    action,
  ].filter(Boolean).join(' · ');
  const changedFields = changeFieldLabels(type, entry.fields || []);
  const at = entry.at ? modifiedDateLine(entry.at) : '-';
  const user = entry.user || '-';

  return `
    <button class="list-item change-log-row change-log-item" type="button" data-change-log data-link-view="${escapeAttribute(type)}" data-link-id="${escapeAttribute(id)}" data-link-edit="${escapeAttribute(edit)}">
      <span class="change-log-time">${escapeHtml(at)}</span>
      <span class="change-log-object ${escapeAttribute(actionClass)}">${escapeHtml(title)}</span>
      <span class="change-log-user">${escapeHtml(user)}</span>
      <span class="change-log-details">
        <span>${escapeHtml(details || '-')}</span>
        ${changedFields ? `<small>${escapeHtml(changedFields)}</small>` : ''}
      </span>
    </button>
  `;
}

function changeActionLabel(action) {
  const labels = {
    created: 'erstellt',
    updated: 'geändert',
    deleted: 'gelöscht',
  };

  return labels[action] || action;
}

function changeActionClass(action) {
  if (action === 'created') {
    return 'is-created';
  }
  if (action === 'deleted') {
    return 'is-deleted';
  }
  return 'is-updated';
}

function changeFieldLabels(type, fields) {
  if (!Array.isArray(fields) || fields.length === 0) {
    return '';
  }

  const configFields = objectConfigs[type]?.fields || [];
  const labelsByName = Object.fromEntries(configFields.map((field) => [field.name, field.label || field.name]));
  const labels = fields
    .map((field) => labelsByName[String(field || '')] || String(field || ''))
    .filter(Boolean);
  return labels.join(', ');
}

function renderChangeLogControls() {
  if (!changeLogControls) {
    return;
  }

  const types = [...new Set(state.changeLog.map((entry) => String(entry.type || '')).filter(Boolean))].sort(sortCollator.compare);
  const users = [...new Set(state.changeLog.map((entry) => String(entry.user || '').trim()).filter(Boolean))].sort(sortCollator.compare);
  const actions = [...new Set(state.changeLog.map((entry) => String(entry.action || '').trim()).filter(Boolean))].sort(sortCollator.compare);
  const fieldOptions = changeLogFieldOptions();
  const selectedFields = new Set(Array.isArray(state.changeLogFilters.fields) ? state.changeLogFilters.fields : []);
  changeLogControls.innerHTML = `
    <section class="collection-filter-section">
      <div class="collection-filter-controls">
        <label class="collection-control">
          <span class="collection-filter-label">
            <span>Eintrag</span>
            <button class="period-toggle" type="button" data-change-log-clear-filter="type">(reset)</button>
          </span>
          <select data-change-log-control="type">
            <option value="">Alle</option>
            ${types.map((type) => `<option value="${escapeAttribute(type)}" ${state.changeLogFilters.type === type ? 'selected' : ''}>${escapeHtml(labels[type] || type)}</option>`).join('')}
          </select>
        </label>
        <label class="collection-control">
          <span class="collection-filter-label">
            <span>Benutzer</span>
            <button class="period-toggle" type="button" data-change-log-clear-filter="username">(reset)</button>
          </span>
          <select data-change-log-control="username">
            <option value="">Alle</option>
            ${users.map((username) => `<option value="${escapeAttribute(username)}" ${state.changeLogFilters.username === username ? 'selected' : ''}>${escapeHtml(username)}</option>`).join('')}
          </select>
        </label>
        <label class="collection-control">
          <span class="collection-filter-label">
            <span>Änderung</span>
            <button class="period-toggle" type="button" data-change-log-clear-filter="action">(reset)</button>
          </span>
          <select data-change-log-control="action">
            <option value="">Alle</option>
            ${actions.map((action) => `<option value="${escapeAttribute(action)}" ${state.changeLogFilters.action === action ? 'selected' : ''}>${escapeHtml(changeActionLabel(action))}</option>`).join('')}
          </select>
        </label>
        <label class="collection-control">
          <span class="collection-filter-label">
            <span>Eigenschaft</span>
            <button class="period-toggle" type="button" data-change-log-clear-filter="fields">(reset)</button>
          </span>
          <select multiple size="3" data-change-log-control="fields">
            ${fieldOptions.map(([field, label]) => `<option value="${escapeAttribute(field)}" ${selectedFields.has(field) ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select>
        </label>
      </div>
    </section>
  `;
}

function changeLogFieldOptions() {
  const labelsByName = {};
  Object.entries(objectConfigs).forEach(([_type, config]) => {
    (config.fields || []).forEach((field) => {
      labelsByName[field.name] = labelsByName[field.name] || field.label || field.name;
    });
  });

  const fields = [...new Set(state.changeLog
    .flatMap((entry) => (Array.isArray(entry.fields) ? entry.fields : []))
    .map((field) => String(field || ''))
    .filter(Boolean))];

  return fields
    .map((field) => [field, labelsByName[field] || field])
    .sort((left, right) => sortCollator.compare(left[1], right[1]));
}

function filteredChangeLog() {
  return state.changeLog.filter((entry) => {
    const type = String(entry.type || '');
    const username = String(entry.user || '').trim();
    const action = String(entry.action || '').trim();
    const fields = Array.isArray(entry.fields) ? entry.fields.map((field) => String(field || '')) : [];
    const selectedFields = Array.isArray(state.changeLogFilters.fields) ? state.changeLogFilters.fields : [];
    return (!state.changeLogFilters.type || type === state.changeLogFilters.type)
      && (!state.changeLogFilters.username || username === state.changeLogFilters.username)
      && (!state.changeLogFilters.action || action === state.changeLogFilters.action)
      && (!selectedFields.length || selectedFields.some((field) => fields.includes(field)));
  });
}

function renderAuditControls() {
  if (!auditControls) {
    return;
  }

  const eventOptions = auditTypeOptions();
  const users = [...new Set(state.auditLog.map(auditAffectedUsername).filter(Boolean))].sort(sortCollator.compare);
  auditControls.innerHTML = `
    <section class="collection-filter-section">
      <div class="collection-filter-controls">
        <label class="collection-control">
          <span class="collection-filter-label">
            <span>Typ</span>
            <button class="period-toggle" type="button" data-audit-clear-filter="event">(reset)</button>
          </span>
          <select data-audit-control="event">
            <option value="">Alle</option>
            ${eventOptions.map((option) => `<option value="${escapeAttribute(option.value)}" ${state.auditFilters.event === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
          </select>
        </label>
        <label class="collection-control">
          <span class="collection-filter-label">
            <span>Benutzer</span>
            <button class="period-toggle" type="button" data-audit-clear-filter="username">(reset)</button>
          </span>
          <select data-audit-control="username">
            <option value="">Alle</option>
            ${users.map((username) => `<option value="${escapeAttribute(username)}" ${state.auditFilters.username === username ? 'selected' : ''}>${escapeHtml(username)}</option>`).join('')}
          </select>
        </label>
      </div>
    </section>
  `;
}

function auditTypeOptions() {
  const events = [...new Set(state.auditLog.map((entry) => String(entry.event || '')).filter(Boolean))].sort(sortCollator.compare);
  const groups = new Map();
  events.forEach((event) => {
    const category = auditEventCategory(event);
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category).push(event);
  });

  const categoryOrder = ['setup', 'login', 'passkey', 'user', 'other'];
  return categoryOrder.flatMap((category) => {
    const groupEvents = groups.get(category) || [];
    if (!groupEvents.length) {
      return [];
    }

    return [{
      value: `category:${category}`,
      label: auditCategoryLabel(category),
    }, ...groupEvents.map((event) => ({
      value: `event:${event}`,
      label: `- ${auditEventLabel(event)}`,
    }))];
  });
}

function filteredAuditLog() {
  return state.auditLog.filter((entry) => {
    const username = auditAffectedUsername(entry);
    return auditEntryMatchesTypeFilter(entry, state.auditFilters.event)
      && (!state.auditFilters.username || username === state.auditFilters.username);
  });
}

function auditEntryMatchesTypeFilter(entry, filter) {
  if (!filter) {
    return true;
  }

  const event = String(entry.event || '');
  if (filter.startsWith('category:')) {
    return auditEventCategory(event) === filter.slice('category:'.length);
  }

  if (filter.startsWith('event:')) {
    return event === filter.slice('event:'.length);
  }

  return event === filter;
}

function renderAuditEntry(entry) {
  const event = String(entry.event || 'event');
  const at = modifiedDateLine(entry.at || '');
  const username = auditAffectedUsername(entry) || '-';
  const categoryClass = auditEventClass(event);
  const details = Object.entries(entry)
    .filter(([key]) => !['at', 'event', 'username'].includes(key))
    .map(([key, value]) => `${key}: ${auditValue(value)}`)
    .join(' / ');

  return `
    <article class="list-item audit-row audit-item">
      <span class="audit-time">${escapeHtml(at)}</span>
      <span class="audit-event ${escapeAttribute(categoryClass)}">${escapeHtml(auditEventLabel(event))}</span>
      <span class="audit-user">${escapeHtml(username)}</span>
      <span class="audit-details">${escapeHtml(details || '-')}</span>
    </article>
  `;
}

function auditAffectedUsername(entry) {
  return String(entry.username || entry.user?.username || '').trim();
}

function auditEventLabel(event) {
  const labels = {
    login: 'Login',
    email_login: 'Login-Link verwendet',
    email_login_link_created: 'Login-Link erstellt',
    setup_token_created: 'Setup-Link erstellt',
    setup_token_deleted: 'Setup-Link gelöscht',
    auth_verification_failed: 'Login-Prüfung fehlgeschlagen',
    setup_verification_failed: 'Setup-Prüfung fehlgeschlagen',
    rate_limit_exceeded: 'Anfragelimit erreicht',
    access_control_check_failed: 'Web-Zugriffsschutz fehlgeschlagen',
    sessions_revoked: 'Sitzungen abgemeldet',
    passkey_deleted: 'Passkey gelöscht',
    user_deleted: 'Benutzer gelöscht',
  };

  return labels[event] || event;
}

function auditEventCategory(event) {
  if (event.includes('setup_token')) {
    return 'setup';
  }
  if (event.includes('login')) {
    return 'login';
  }
  if (event.includes('passkey')) {
    return 'passkey';
  }
  if (event.startsWith('user_')) {
    return 'user';
  }

  return 'other';
}

function auditCategoryLabel(category) {
  const labels = {
    login: 'Login',
    setup: 'Setup',
    passkey: 'Passkey',
    user: 'Benutzer',
  };

  return labels[category] || category;
}

function auditCategoryClass(category) {
  return `is-${category || 'other'}`;
}

function auditEventClass(event) {
  if (String(event || '').includes('deleted')) {
    return 'is-deleted';
  }

  return auditCategoryClass(auditEventCategory(event));
}

function auditValue(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (Array.isArray(value)) {
    return value.map((item) => auditValue(item)).join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
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
  const payload = {
    username,
    display_name: user.display_name || '',
    email: user.email || '',
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
  };

  return `
    <article class="list-item user-item is-clickable ${isEditing ? 'is-editing' : ''}" data-username="${escapeAttribute(username)}" data-last-saved-payload="${escapeAttribute(JSON.stringify(payload))}">
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
      <label class="object-field">
        <span>E-Mail-Adresse</span>
        <input data-email type="email" value="${escapeAttribute(user.email || '')}" autocomplete="off">
      </label>
      <fieldset class="object-field users-permissions-field">
        <legend>Berechtigungen</legend>
        ${renderPermissionCheckboxes(user.permissions)}
      </fieldset>
      <div class="user-editor-side">
        ${renderUserSetupResult(user)}
        ${renderUserSetupTokens(user)}
      </div>
      <div class="object-editor-actions user-actions">
        <button class="button button-secondary" type="button" data-action="setup" ${user.enabled ? '' : 'disabled'}>Setup-Link</button>
        <button class="button button-secondary" type="button" data-action="toggle">${user.enabled ? 'Deaktivieren' : 'Aktivieren'}</button>
        ${state.status?.auth?.user?.username === user.username ? '' : '<button class="button button-danger" type="button" data-action="delete-user" data-danger-confirm>Löschen</button>'}
      </div>
      <p class="object-save-state" data-user-save-state hidden></p>
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

function renderUserSetupResult(user) {
  if (!state.setupResult
    || String(state.setupResult.username || '') !== String(user.username || '')
    || !state.setupResult.setup_url
  ) {
    return '';
  }

  const setupUrl = state.setupResult.setup_url || '';
  return `
    <div class="setup-result user-setup-result">
    <h3>Neuer Setup-Link</h3>
    <div class="qr-code">${qrSvg(setupUrl)}</div>
    <label class="setup-url-field">
      <span>URL</span>
      <span class="setup-url-control">
        <input id="setupUrlResult" readonly value="${escapeAttribute(setupUrl)}">
        <button class="icon-button setup-copy-button" type="button" data-copy="#setupUrlResult"
          aria-label="Setup-Link kopieren" title="Setup-Link kopieren">${setupCopyIcon('copy')}</button>
      </span>
      <span class="visually-hidden" aria-live="polite" data-copy-status></span>
    </label>
    <small>Läuft ab ${escapeHtml(formatDateTime(state.setupResult.expires_at))}</small>
    </div>
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

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#000">${cells.join('')}</g></svg>`;
    const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return `<img src="${escapeAttribute(source)}" alt="Setup-URL als QR-Code">`;
  } catch (error) {
    console.error(error);
    return '<span>QR-Code nicht verfügbar</span>';
  }
}

function normalizeSetupInput(value) {
  const trimmed = String(value || '').trim();
  try {
    const url = new URL(trimmed, window.location.href);
    return new URLSearchParams(url.hash.slice(1)).get('setup') || trimmed;
  } catch (_error) {
    return trimmed;
  }
}

function normalizeLoginTokenInput(value) {
  const trimmed = String(value || '').trim();
  try {
    const url = new URL(trimmed, window.location.href);
    return new URLSearchParams(url.hash.slice(1)).get('login') || trimmed;
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

function showAuthMessage(text, isError, autoHideMs = 0) {
  if (authMessageTimer) {
    window.clearTimeout(authMessageTimer);
    authMessageTimer = 0;
  }

  authMessage.hidden = false;
  authMessage.textContent = localizeErrorMessage(text);
  authMessage.className = `message global-message ${isError ? 'is-error' : 'is-good'}`;
  if (autoHideMs > 0 || !isError) {
    authMessageTimer = window.setTimeout(clearAuthMessage, autoHideMs > 0 ? autoHideMs : 14000);
  }
}

function clearAuthMessage() {
  if (authMessageTimer) {
    window.clearTimeout(authMessageTimer);
    authMessageTimer = 0;
  }

  authMessage.hidden = true;
  authMessage.textContent = '';
  authMessage.className = 'message global-message';
}

function showLoginEmailState(text, isError) {
  if (!loginEmailState) {
    return;
  }

  loginEmailState.hidden = false;
  loginEmailState.textContent = localizeErrorMessage(text);
  loginEmailState.className = `object-save-state ${isError ? 'is-error' : 'is-good'}`;
}

function clearLoginEmailState() {
  if (!loginEmailState) {
    return;
  }

  loginEmailState.hidden = true;
  loginEmailState.textContent = '';
  loginEmailState.className = 'object-save-state';
}

function showAccountMessage(text, isError, autoHide = false) {
  if (!accountState) {
    return;
  }

  accountState.hidden = false;
  accountState.textContent = localizeErrorMessage(text);
  accountState.className = `object-save-state account-state ${isError ? 'is-error' : 'is-good'}`;
  if (autoHide) {
    window.setTimeout(() => {
      if (accountState.textContent === localizeErrorMessage(text)) {
        accountState.hidden = true;
      }
    }, 1400);
  }
}

function clearAccountMessage() {
  if (!accountState) {
    return;
  }

  accountState.hidden = true;
  accountState.textContent = '';
  accountState.className = 'object-save-state account-state';
}

function formatCount(value = 0, noun) {
  const count = Number(value || 0);
  const forms = countNouns[noun] || [noun, noun];
  return `${count} ${count === 1 ? forms[0] : forms[1]}`;
}

function localizeErrorMessage(text) {
  const message = String(text || '');
  const exact = {
    'Request failed': 'Anfrage fehlgeschlagen',
    'Permission denied': 'Keine Berechtigung zum Bearbeiten.',
    'Login failed.': 'Login fehlgeschlagen.',
    'Authentication required.': 'Login erforderlich.',
    'Invalid CSRF token.': 'Ungültiges CSRF-Token.',
    'Unknown user.': 'Unbekannter Benutzer.',
    'Email address is required.': 'E-Mail-Adresse ist erforderlich.',
    'Invalid email address.': 'Ungültige E-Mail-Adresse.',
    'Email login is not configured.': 'E-Mail-Login ist nicht konfiguriert.',
    'Login email could not be sent.': 'Login-Mail konnte nicht gesendet werden.',
    'Login link is required.': 'Login-Link ist erforderlich.',
    'Login link is not valid.': 'Login-Link ist ungültig oder abgelaufen.',
    'Passkey ID is required.': 'Passkey-ID ist erforderlich.',
    'At least one login method must remain.': 'Mindestens eine Login-Methode muss erhalten bleiben.',
    'Registration challenge did not match user': 'Passkey-Anfrage passt nicht zum Benutzer.',
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
    'Unknown object.': 'Unbekannter Eintrag.',
    'Object has been deleted.': 'Eintrag wurde gelöscht.',
    'Object has already been deleted.': 'Eintrag wurde bereits gelöscht.',
    'Sensitive permission is required for this field.': 'Für dieses Feld ist die Berechtigung für sensible Daten erforderlich.',
    'Unknown collection.': 'Unbekannte Sammlung.',
    'Invalid object ID.': 'Ungültige Eintrags-ID.',
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

function cssEscape(value) {
  if (window.CSS?.escape) {
    return window.CSS.escape(String(value));
  }

  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function waitAtLeast(startedAt, minimumMs) {
  const remaining = minimumMs - (performance.now() - startedAt);
  return remaining > 0
    ? new Promise((resolve) => window.setTimeout(resolve, remaining))
    : Promise.resolve();
}
