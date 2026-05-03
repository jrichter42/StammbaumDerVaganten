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
        <div class="topbar-actions" aria-label="Application state">
          <span class="status-pill" id="connectionStatus">Loading</span>
          <span class="status-pill" id="currentUserLabel" hidden></span>
          <button class="button button-secondary" id="loginButton" type="button" hidden>Sign in</button>
          <button class="button button-secondary" id="logoutButton" type="button" hidden>Sign out</button>
        </div>
      </header>

      <?php if ($configWarnings !== []): ?>
        <aside class="app-warning" role="alert">
          <strong>Config warning</strong>
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
                <h2>Sign In</h2>
                <p>Passkey</p>
              </div>
              <button class="button" id="passkeyLoginButton" type="button">Use passkey</button>
            </div>
          </section>

          <section class="panel" id="setupPanel" hidden>
            <form class="panel-header" id="setupForm">
              <div>
                <h2>Passkey Setup</h2>
                <p>One-time setup link</p>
              </div>
              <input id="setupInput" name="setup" type="hidden" required>
              <button class="button" type="submit">Create passkey</button>
            </form>
          </section>
        </div>
      </section>

      <p class="message global-message" id="authMessage" role="alert" hidden></p>

      <main class="workspace" id="workspace" hidden>
        <nav class="sidebar" aria-label="Sections">
          <button class="nav-item is-active" type="button" data-view="overview">Overview</button>
          <button class="nav-item" type="button" data-view="people">People</button>
          <button class="nav-item" type="button" data-view="groups">Groups</button>
          <button class="nav-item" type="button" data-view="group-types">Group Types</button>
          <button class="nav-item" type="button" data-view="roles">Roles</button>
          <button class="nav-item" type="button" data-view="timepoints">Timepoints</button>
          <button class="nav-item" id="adminNav" type="button" data-view="admin" hidden>Users</button>
        </nav>

        <section class="content-area" aria-live="polite">
          <div class="view is-active" id="view-overview">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Overview</h2>
                  <p id="storageState">Checking storage</p>
                </div>
              </div>
              <div class="metric-grid" id="metricGrid"></div>
            </section>

            <section class="split-layout">
              <div class="panel">
                <div class="panel-header">
                  <div>
                    <h2>Reference Data</h2>
                    <p>Group types and roles</p>
                  </div>
                </div>
                <div class="list" id="referenceList"></div>
              </div>
              <div class="panel">
                <div class="panel-header">
                  <div>
                    <h2>System</h2>
                    <p id="systemVersion">Schema</p>
                  </div>
                </div>
                <dl class="status-list" id="systemList"></dl>
              </div>
            </section>
          </div>

          <div class="view" id="view-people">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>People</h2>
                  <p id="peopleCount">0 records</p>
                </div>
                <button class="button" type="button" data-create-type="people">Add person</button>
              </div>
              <div class="object-create" data-create-panel="people" hidden></div>
              <div class="list object-list" id="peopleList"></div>
            </section>
          </div>

          <div class="view" id="view-groups">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Groups</h2>
                  <p id="groupsCount">0 records</p>
                </div>
                <button class="button" type="button" data-create-type="groups">Add group</button>
              </div>
              <div class="object-create" data-create-panel="groups" hidden></div>
              <div class="list object-list" id="groupsList"></div>
            </section>
          </div>

          <div class="view" id="view-group-types">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Group Types</h2>
                  <p id="groupTypesCount">0 records</p>
                </div>
                <button class="button" type="button" data-create-type="group-types">Add group type</button>
              </div>
              <div class="object-create" data-create-panel="group-types" hidden></div>
              <div class="list object-list" id="groupTypesList"></div>
            </section>
          </div>

          <div class="view" id="view-roles">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Roles</h2>
                  <p id="rolesCount">0 records</p>
                </div>
                <button class="button" type="button" data-create-type="roles">Add role</button>
              </div>
              <div class="object-create" data-create-panel="roles" hidden></div>
              <div class="list object-list" id="rolesList"></div>
            </section>
          </div>

          <div class="view" id="view-timepoints">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Timepoints</h2>
                  <p id="timepointsCount">0 records</p>
                </div>
                <button class="button" type="button" data-create-type="timepoints">Add timepoint</button>
              </div>
              <div class="object-create" data-create-panel="timepoints" hidden></div>
              <div class="list object-list" id="timepointsList"></div>
            </section>
          </div>

          <div class="view" id="view-admin">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Users</h2>
                  <p id="userAdminCount">0 users</p>
                </div>
              </div>
              <form class="form-grid admin-create" id="createUserForm">
                <label>
                  <span>Username</span>
                  <input name="username" autocomplete="off" required>
                </label>
                <label>
                  <span>Display name</span>
                  <input name="display_name" autocomplete="off">
                </label>
                <fieldset>
                  <legend>Permissions</legend>
                  <label><input type="checkbox" name="permissions" value="read" checked> Read</label>
                  <label><input type="checkbox" name="permissions" value="write"> Write</label>
                  <label><input type="checkbox" name="permissions" value="sensitive"> Sensitive data</label>
                  <label><input type="checkbox" name="permissions" value="manage_users"> Manage users</label>
                </fieldset>
                <div class="form-actions">
                  <button class="button" type="submit">Create user</button>
                </div>
              </form>
              <div class="setup-result" id="setupResult" hidden></div>
              <div class="list user-list" id="userList"></div>
            </section>
          </div>
        </section>
      </main>
    </div>
    <script type="module" src="assets/app.js"></script>
  </body>
</html>
