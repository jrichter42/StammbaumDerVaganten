<?php
declare(strict_types=1);

$app = require __DIR__ . '/app/bootstrap.php';

\Stammbaum\Http::sendSecurityHeaders();

$config = $app['config'];
$version = htmlspecialchars((string) $app['version'], ENT_QUOTES, 'UTF-8');
$appName = htmlspecialchars((string) $config['name'], ENT_QUOTES, 'UTF-8');
$appTitle = preg_replace('/(der Vaganten)/u', '<span class="logo-word">$1</span>', $appName, 1);
$configWarnings = array_map(
    static fn (string $warning): string => htmlspecialchars($warning, ENT_QUOTES, 'UTF-8'),
    $config['show_warnings'] ? ($config['warnings'] ?? []) : []
);
?>
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <title><?= $appName ?></title>
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
              <input id="sourceInput" type="text" autocomplete="off" aria-label="Quelle für Änderungen">
              <button class="source-clear" id="sourceClearButton" type="button" aria-label="Quelle zurücksetzen" hidden>x</button>
            </div>
          </div>
        </div>
        <div class="topbar-actions" aria-label="App-Status">
          <span class="status-pill" id="connectionStatus">Lädt</span>
          <span class="status-pill" id="currentUserLabel" hidden></span>
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

      <section class="auth-screen" id="authScreen" hidden>
        <div class="auth-layout">
          <section class="panel" id="loginPanel">
            <div class="panel-header">
              <div>
                <h2>Login</h2>
                <p>Passkey</p>
              </div>
              <button class="button" id="passkeyLoginButton" type="button">Passkey verwenden</button>
            </div>
          </section>

          <section class="panel" id="setupPanel" hidden>
            <form class="panel-header" id="setupForm">
              <div>
                <h2>Passkey-Setup</h2>
                <p>Einmaliger Setup-Link</p>
              </div>
              <input id="setupInput" name="setup" type="hidden" required>
              <button class="button" type="submit">Passkey erstellen</button>
            </form>
          </section>
        </div>
      </section>

      <p class="message global-message" id="authMessage" role="alert" hidden></p>

      <main class="public-overview" id="publicOverview" hidden>
        <section class="public-hero" aria-label="Öffentliche Übersicht">
          <div>
            <p id="publicOverviewText">Öffentliche Daten werden geladen.</p>
          </div>
          <div class="public-stats" id="publicStats" aria-label="Öffentliche Daten"></div>
        </section>

        <section class="public-map" aria-labelledby="publicTreeTitle">
          <div class="public-section-heading">
            <h2 id="publicTreeTitle">Stammbaum</h2>
            <p id="publicTreeSubtitle"></p>
          </div>
          <div class="tree-board" id="publicTree"></div>
        </section>

        <section class="public-grid">
          <section class="public-panel" aria-labelledby="publicRolesTitle">
            <h2 id="publicRolesTitle">Rollen</h2>
            <div class="public-chip-list" id="publicRoleList"></div>
          </section>
          <section class="public-panel" aria-labelledby="publicTimelineTitle">
            <h2 id="publicTimelineTitle">Zeitpunkte</h2>
            <div class="public-timeline" id="publicTimeline"></div>
          </section>
        </section>
      </main>

      <main class="workspace" id="workspace" hidden>
        <nav class="sidebar editor-nav" aria-label="Editorbereiche">
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
            <button class="nav-item" id="usersNav" type="button" data-view="users"><span class="nav-count" data-nav-count="users">0</span><span>Benutzer</span></button>
          </div>
        </nav>

        <section class="content-area" aria-live="polite">
          <div class="view is-active" id="view-people">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <h2>Personen</h2>
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
                  <h2>Gruppen</h2>
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
                  <h2>Gruppenarten</h2>
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
                  <h2>Rollen</h2>
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
                  <h2>Zeitpunkte</h2>
                  <div class="collection-controls" data-collection-controls="timepoints"></div>
                </div>
                <button class="button" type="button" data-create-type="timepoints">Zeitpunkt hinzufügen</button>
              </div>
              <div class="object-create" data-create-panel="timepoints" hidden></div>
              <div class="list object-list" id="timepointsList"></div>
            </section>
          </div>

          <div class="view" id="view-users">
            <section class="panel">
              <div class="panel-header collection-header">
                <div class="collection-heading">
                  <h2>Benutzer</h2>
                  <div class="collection-controls" data-collection-controls="users"></div>
                </div>
              </div>
              <form class="form-grid users-create" id="createUserForm">
                <label>
                  <span>Benutzername</span>
                  <input name="username" autocomplete="off" required>
                </label>
                <label>
                  <span>Anzeigename</span>
                  <input name="display_name" autocomplete="off">
                </label>
                <fieldset>
                  <legend>Berechtigungen</legend>
                  <label><input type="checkbox" name="permissions" value="read" checked> Lesen</label>
                  <label><input type="checkbox" name="permissions" value="write"> Schreiben</label>
                  <label><input type="checkbox" name="permissions" value="sensitive"> Sensible Daten</label>
                  <label><input type="checkbox" name="permissions" value="manage_users"> Benutzer verwalten</label>
                </fieldset>
                <div class="form-actions">
                  <button class="button" type="submit">Setup-Link erstellen</button>
                </div>
              </form>
              <div class="setup-result" id="setupResult" hidden></div>
              <div class="list user-list" id="userList"></div>
            </section>
          </div>
        </section>
      </main>
      </div>
      <button class="button button-secondary back-to-top" id="backToTopButton" type="button" aria-label="Nach oben" hidden>∧</button>
    </div>
    <script type="module" src="assets/app.js"></script>
  </body>
</html>
