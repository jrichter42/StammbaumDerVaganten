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
          <button class="button button-secondary" type="button" id="refreshButton">Refresh</button>
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

      <main class="workspace">
        <nav class="sidebar" aria-label="Sections">
          <button class="nav-item is-active" type="button" data-view="overview">Overview</button>
          <button class="nav-item" type="button" data-view="people">People</button>
          <button class="nav-item" type="button" data-view="groups">Groups</button>
          <button class="nav-item" type="button" data-view="role-types">Role Types</button>
          <button class="nav-item" type="button" data-view="timepoints">Timepoints</button>
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
                    <p>Group types and role types</p>
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
                <button class="button" type="button" disabled>Add person</button>
              </div>
              <div class="empty-state" id="peopleList">No people yet.</div>
            </section>
          </div>

          <div class="view" id="view-groups">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Groups</h2>
                  <p id="groupsCount">0 records</p>
                </div>
                <button class="button" type="button" disabled>Add group</button>
              </div>
              <div class="empty-state" id="groupsList">No groups yet.</div>
            </section>
          </div>

          <div class="view" id="view-role-types">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Role Types</h2>
                  <p id="roleTypesCount">0 records</p>
                </div>
              </div>
              <div class="list" id="roleTypesList"></div>
            </section>
          </div>

          <div class="view" id="view-timepoints">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2>Timepoints</h2>
                  <p id="timepointsCount">0 records</p>
                </div>
                <button class="button" type="button" disabled>Add timepoint</button>
              </div>
              <div class="empty-state" id="timepointsList">No timepoints yet.</div>
            </section>
          </div>
        </section>
      </main>
    </div>
    <script type="module" src="assets/app.js"></script>
  </body>
</html>
