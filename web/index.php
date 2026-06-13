<?php
declare(strict_types=1);

$app = require __DIR__ . '/app/bootstrap.php';

\Stammbaum\Http::sendSecurityHeaders();

$config = $app['config'];
$currentUser = $app['auth']->currentUser();
$version = htmlspecialchars((string) $app['version'], ENT_QUOTES, 'UTF-8');
$appJsRevision = (string) (@filemtime(__DIR__ . '/assets/app.js') ?: 0);
$appName = htmlspecialchars((string) $config['name'], ENT_QUOTES, 'UTF-8');
$appTitle = preg_replace('/(der Vaganten)/u', '<span class="logo-word">$1</span>', $appName, 1);
$configWarnings = array_map(
    static fn (string $warning): string => htmlspecialchars($warning, ENT_QUOTES, 'UTF-8'),
    $currentUser !== null && $config['show_warnings'] ? ($config['warnings'] ?? []) : []
);
?>
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <title><?= $appName ?></title>
    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="assets/app.css">
  </head>
  <body>
    <div class="app-shell">
      <header class="topbar">
        <div class="brand-row">
          <h1><a class="site-title" href="./" aria-label="Zur Startseite"><?= $appTitle ?></a></h1>
          <a class="version-chip" href="https://github.stammbaumdervaganten.de" target="_blank" rel="noopener noreferrer">v<?= $version ?></a>
        </div>
        <div class="topbar-tools" aria-label="Datenwerkzeuge">
          <div class="global-search" id="globalSearch" hidden>
            <label class="tool-label" for="globalSearchInput">Suche</label>
            <input id="globalSearchInput" type="search" autocomplete="off" aria-label="Alle Daten durchsuchen">
            <div class="global-search-results" id="globalSearchResults" hidden></div>
          </div>
          <div class="source-control" id="sourceControl" hidden>
            <label class="tool-label" for="sourceInput">Quelle</label>
            <div class="source-input-wrap">
              <input id="sourceInput" type="search" autocomplete="off" aria-label="Quelle für Änderungen">
            </div>
          </div>
        </div>
        <div class="topbar-actions" aria-label="App-Status">
          <span class="status-pill" id="connectionStatus">Lädt</span>
          <span class="status-pill user-pill" id="currentUserLabel" hidden>
            <span id="currentUserName"></span>
            <button class="period-toggle account-pill-action" id="accountButton" type="button" hidden aria-label="Benutzerkonto öffnen" title="Benutzerkonto öffnen">(⚙︎)</button>
          </span>
          <button class="button button-secondary" id="loginButton" type="button" hidden>Login</button>
          <button class="button button-secondary" id="logoutButton" type="button" hidden>Logout</button>
        </div>
      </header>

      <div class="app-content">
      <?php if ($configWarnings !== []): ?>
        <aside class="app-warning" role="alert">
          <strong>Config-Warnung</strong>
          <?php foreach ($configWarnings as $warning): ?>
            <span><?= $warning ?></span>
          <?php endforeach; ?>
        </aside>
      <?php endif; ?>
        <aside class="app-warning" id="accessControlWarning" role="alert" hidden>
          <strong>Kritische Sicherheitswarnung</strong>
          <span>Web-Zugriffsschutz konnte nicht bestätigt werden. Prüfe /app, /config, /data, /var und /bootstrap_setup.txt.</span>
        </aside>

      <section class="auth-screen" id="authScreen" hidden>
        <div class="auth-layout">
          <section class="panel" id="loginPanel">
            <div class="panel-header login-header">
              <div>
                <h2>Login</h2>
                <p>Passkey oder Login-Link</p>
              </div>
              <button class="button" id="passkeyLoginButton" type="button">Passkey verwenden</button>
            </div>
            <form class="login-email-form" id="loginEmailForm">
              <label class="object-field" for="loginEmailInput">
                <span>E-Mail-Adresse</span>
                <input id="loginEmailInput" name="email" type="email" autocomplete="email" required>
              </label>
              <div class="form-actions">
                <button class="button button-secondary" type="submit">Login-Link senden</button>
              </div>
              <p class="object-save-state" id="loginEmailState" hidden></p>
            </form>
          </section>

          <section class="panel" id="setupPanel" hidden>
            <form class="panel-header" id="setupForm">
              <div>
                <h2>Passkey-Setup</h2>
                <p>Einmaliger Setup-Link</p>
              </div>
              <button class="button" type="submit">Passkey erstellen</button>
            </form>
          </section>
        </div>
      </section>

      <p class="message global-message" id="authMessage" role="alert" hidden></p>

      <main class="public-overview" id="publicOverview" data-tree-graph-root hidden>
        <section class="public-map" aria-labelledby="publicTreeTitle">
          <div class="public-section-heading">
            <h2 id="publicTreeTitle">Stammbaum</h2>
            <div class="public-graph-tools">
              <p id="publicGraphStatus" data-tree-graph-status>Öffentliche Struktur wird geladen.</p>
              <label class="public-graph-filter" for="publicGraphGroupTypeFilter">
                <span>Gruppenart</span>
                <select id="publicGraphGroupTypeFilter" data-tree-group-type-filter></select>
              </label>
            </div>
          </div>
          <div class="public-graph" id="publicGraph" data-tree-graph aria-label="Öffentlicher Stammbaum-Graph"></div>
        </section>
      </main>

      <main class="workspace" id="workspace" hidden>
        <nav class="sidebar editor-nav" aria-label="Editorbereiche">
          <div class="nav-group">
            <span class="nav-label">Visualisierung</span>
            <button class="nav-item" type="button" data-view="tree"><span class="nav-count"></span><span>Baum</span></button>
          </div>
          <div class="nav-group">
            <span class="nav-label">Daten</span>
            <button class="nav-item is-active" type="button" data-view="people"><span class="nav-count" data-nav-count="people">0</span><span>Personen</span></button>
            <button class="nav-item" type="button" data-view="groups"><span class="nav-count" data-nav-count="groups">0</span><span>Gruppen</span></button>
            <button class="nav-item" type="button" data-view="timepoints"><span class="nav-count" data-nav-count="timepoints">0</span><span>Zeitpunkte</span></button>
          </div>
          <div class="nav-group">
            <span class="nav-label">Struktur</span>
            <button class="nav-item" type="button" data-view="roles"><span class="nav-count" data-nav-count="roles">0</span><span>Rollen</span></button>
            <button class="nav-item" type="button" data-view="group-types"><span class="nav-count" data-nav-count="group-types">0</span><span>Gruppenarten</span></button>
          </div>
          <div class="nav-group" id="usersNavGroup" hidden>
            <span class="nav-label">Admin</span>
            <button class="nav-item" id="exampleDataButton" type="button" hidden><span class="nav-count"></span><span>Beispieldaten</span></button>
            <span class="nav-feedback object-save-state" id="exampleDataState" hidden></span>
            <button class="nav-item" id="logNav" type="button" data-view="log"><span class="nav-count" data-nav-count="log">0</span><span>Log</span></button>
            <button class="nav-item" id="auditNav" type="button" data-view="audit"><span class="nav-count" data-nav-count="audit">0</span><span>Audit</span></button>
            <button class="nav-item" id="usersNav" type="button" data-view="users"><span class="nav-count" data-nav-count="users">0</span><span>Benutzer</span></button>
          </div>
        </nav>

        <section class="content-area" aria-live="polite">
          <button class="button button-secondary back-to-top" id="backToTopButton" type="button" aria-label="Nach oben" hidden>∧</button>
          <div class="view is-active" id="view-people">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <div class="collection-controls" data-collection-controls="people"></div>
                </div>
                <button class="button" type="button" data-create-type="people">Person hinzufügen</button>
              </div>
              <div class="object-create" data-create-panel="people" hidden></div>
              <div class="list object-list" id="peopleList"></div>
            </section>
          </div>

          <div class="view" id="view-groups">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <div class="collection-controls" data-collection-controls="groups"></div>
                </div>
                <button class="button" type="button" data-create-type="groups">Gruppe hinzufügen</button>
              </div>
              <div class="object-create" data-create-panel="groups" hidden></div>
              <div class="list object-list" id="groupsList"></div>
            </section>
          </div>

          <div class="view" id="view-group-types">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <div class="collection-controls" data-collection-controls="group-types"></div>
                </div>
                <button class="button" type="button" data-create-type="group-types">Gruppenart hinzufügen</button>
              </div>
              <div class="object-create" data-create-panel="group-types" hidden></div>
              <div class="list object-list" id="groupTypesList"></div>
            </section>
          </div>

          <div class="view" id="view-roles">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <div class="collection-controls" data-collection-controls="roles"></div>
                </div>
                <button class="button" type="button" data-create-type="roles">Rolle hinzufügen</button>
              </div>
              <div class="object-create" data-create-panel="roles" hidden></div>
              <div class="list object-list" id="rolesList"></div>
            </section>
          </div>

          <div class="view" id="view-timepoints">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <div class="collection-controls" data-collection-controls="timepoints"></div>
                </div>
                <button class="button" type="button" data-create-type="timepoints">Zeitpunkt hinzufügen</button>
              </div>
              <div class="object-create" data-create-panel="timepoints" hidden></div>
              <div class="list object-list" id="timepointsList"></div>
            </section>
          </div>

          <div class="view" id="view-log">
            <section class="panel">
              <div class="panel-header collection-header change-log-filter-header">
                <div class="collection-heading">
                  <div class="collection-controls change-log-controls" id="changeLogControls"></div>
                </div>
              </div>
              <div class="list change-log-list" id="changeLogList"></div>
            </section>
          </div>

          <div class="view" id="view-tree" data-tree-graph-root>
            <section class="panel public-map" aria-label="Baum-Visualisierung">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <div class="collection-controls">
                    <section class="collection-filter-section">
                      <div class="collection-filter-controls">
                        <label class="collection-control" for="workspaceTreeGroupTypeFilter">
                          <span class="collection-filter-label">
                            <span>Gruppenart</span>
                            <button class="period-toggle" type="button" data-tree-group-type-clear>(reset)</button>
                          </span>
                          <select id="workspaceTreeGroupTypeFilter" data-tree-group-type-filter></select>
                        </label>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
              <p data-tree-graph-status hidden>Struktur wird geladen.</p>
              <div class="public-graph" data-tree-graph aria-label="Baum-Visualisierung"></div>
            </section>
          </div>

          <div class="view" id="view-users">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <div class="collection-controls" data-collection-controls="users"></div>
                </div>
                <button class="button" type="button" data-create-type="users">Benutzer hinzufügen</button>
              </div>
              <div class="object-create" data-create-panel="users" hidden></div>
              <div class="list user-list" id="userList"></div>
            </section>
          </div>

          <div class="view" id="view-audit">
            <section class="panel">
              <div class="panel-header collection-header audit-filter-header">
                <div class="collection-heading">
                  <div class="collection-controls audit-controls" id="auditControls"></div>
                </div>
              </div>
              <div class="list audit-list" id="auditList"></div>
            </section>
          </div>
        </section>

        <button class="context-resizer" id="contextResizer" type="button" aria-label="Visualisierungsbreite anpassen" aria-orientation="vertical"></button>
        <aside class="context-panel" id="contextPanel" aria-label="Kontext-Visualisierung">
          <div class="context-panel-header">
            <p id="contextGraphStatus" data-tree-graph-status hidden></p>
            <div class="context-type-toggles" aria-label="Kontext-Typen">
              <section class="context-type-group" aria-label="Daten">
                <label class="context-type-group-toggle"><input type="checkbox" data-context-graph-type-group-toggle value="data" checked><span>Daten</span></label>
                <div>
                  <label><input type="checkbox" data-context-graph-type-toggle value="people" checked><span>Personen</span></label>
                  <label><input type="checkbox" data-context-graph-type-toggle value="groups" checked><span>Gruppen</span></label>
                  <label><input type="checkbox" data-context-graph-type-toggle value="timepoints" checked><span>Zeitpunkte</span></label>
                </div>
              </section>
              <section class="context-type-group" aria-label="Struktur">
                <label class="context-type-group-toggle"><input type="checkbox" data-context-graph-type-group-toggle value="structure" checked><span>Struktur</span></label>
                <div>
                  <label><input type="checkbox" data-context-graph-type-toggle value="roles" checked><span>Rollen</span></label>
                  <label><input type="checkbox" data-context-graph-type-toggle value="group-types" checked><span>Gruppenarten</span></label>
                </div>
              </section>
            </div>
          </div>
          <div class="public-graph context-graph" id="contextGraph" data-context-graph aria-label="Kontext-Graph"></div>
        </aside>
      </main>

      <main class="account-page" id="accountPage" hidden>
        <div class="account-layout">
          <div class="account-toolbar">
            <a class="button button-secondary" href="./">Zurück</a>
          </div>
          <section class="panel account-panel">
            <form class="account-form" id="accountForm">
              <label class="object-field">
                <span>Benutzername</span>
                <output class="account-static-value" id="accountUsername"></output>
              </label>
              <label class="object-field">
                <span>Anzeigename</span>
                <input name="display_name" autocomplete="name">
              </label>
              <label class="object-field">
                <span>E-Mail-Adresse</span>
                <input name="email" type="email" autocomplete="email">
              </label>
              <p class="object-save-state account-state" id="accountState" hidden></p>
            </form>
            <section class="account-passkey-section" aria-labelledby="accountPasskeysTitle">
              <div class="account-section-header">
                <h3 id="accountPasskeysTitle">Passkeys</h3>
                <button class="button button-secondary" type="button" data-account-action="add-passkey">Passkey hinzufügen</button>
              </div>
              <div class="account-passkeys" id="accountPasskeys"></div>
            </section>
            <section class="account-passkey-section">
              <div class="account-section-header">
                <h3>Sitzungen</h3>
                <button class="button button-danger" type="button" data-account-action="logout-all" data-danger-confirm>Alle Sitzungen abmelden</button>
              </div>
            </section>
          </section>
        </div>
      </main>
      </div>
    </div>
    <script src="assets/vis-network.min.js"></script>
    <script type="module" src="assets/app.js?v=<?= rawurlencode($version . '-' . $appJsRevision) ?>"></script>
  </body>
</html>
