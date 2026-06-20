<?php
declare(strict_types=1);

namespace Stammbaum;

use InvalidArgumentException;
use RuntimeException;

final class Storage
{
    private const COLLECTIONS = [
        'people' => 'people',
        'groups' => 'groups',
        'group-types' => 'group-types',
        'roles' => 'roles',
        'timepoints' => 'timepoints',
    ];

    private const FIELD_SCHEMAS = [
        'people' => [
            'description' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'notes' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            '_certainty' => ['type' => 'string', 'default' => 'none', 'visibility' => 'public'],
            '_sources' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'forename' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'lastname' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'scoutname' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'birthdate' => ['type' => 'json', 'default' => null, 'visibility' => 'protected'],
            'contactInfo' => ['type' => 'string', 'default' => '', 'visibility' => 'protected'],
            'memberships' => ['type' => 'array', 'default' => [], 'visibility' => 'public'],
            'activities' => ['type' => 'array', 'default' => [], 'visibility' => 'public'],
        ],
        'groups' => [
            'description' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'notes' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            '_certainty' => ['type' => 'string', 'default' => 'none', 'visibility' => 'public'],
            '_sources' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'name' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'mainPhase' => ['type' => 'json', 'default' => null, 'visibility' => 'public'],
            'additionalPhases' => ['type' => 'array', 'default' => [], 'visibility' => 'public'],
        ],
        'group-types' => [
            'description' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'notes' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'label' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'parentGroupType' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'assumedLifetime' => ['type' => 'number', 'default' => 0, 'visibility' => 'public'],
        ],
        'roles' => [
            'description' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'notes' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            '_certainty' => ['type' => 'string', 'default' => 'none', 'visibility' => 'public'],
            '_sources' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'label' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'groupTypes' => ['type' => 'array', 'default' => [], 'visibility' => 'public'],
        ],
        'timepoints' => [
            'description' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'notes' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            '_certainty' => ['type' => 'string', 'default' => 'none', 'visibility' => 'public'],
            '_dateCertainty' => ['type' => 'string', 'default' => 'none', 'visibility' => 'public'],
            '_sources' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'name' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'date' => ['type' => 'json', 'default' => null, 'visibility' => 'public'],
            'location' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
        ],
    ];

    private const META_FIELDS = [
        '_id',
        '_revision',
        '_created',
        '_modified',
        '_modifiedBy',
        '_deleted',
    ];

    private const PRIVATE_META_FIELDS = [
        '_revision',
        '_created',
        '_modified',
        '_modifiedBy',
        '_deleted',
    ];

    private string $basePath;

    public function __construct(string $basePath)
    {
        $this->basePath = rtrim($basePath, '/\\');
    }

    public function ensureStructure(): void
    {
        foreach ($this->requiredDirectories() as $directory) {
            if (is_dir($directory)) {
                continue;
            }

            if (!mkdir($directory, 0700, true) && !is_dir($directory)) {
                throw new RuntimeException('Could not create storage directory.');
            }
            @chmod($directory, 0700);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function status(string $access = 'public', bool $includeCounts = true): array
    {
        $this->assertAccess($access);

        return [
            'data_path' => $this->relativeDataPath(),
            'var_path' => $this->relativeVarPath(),
            'exists' => is_dir($this->dataPath()),
            'writable' => is_writable($this->dataPath()),
            'runtime_writable' => is_writable($this->varPath()),
            'collections' => $includeCounts ? $this->counts() : [],
            'schemas' => $this->schemas($access),
        ];
    }

    /**
     * @return array<string, int>
     */
    public function counts(): array
    {
        $counts = [];
        foreach (array_keys(self::COLLECTIONS) as $type) {
            $counts[$type] = count(array_filter($this->objectFiles($type), function (string $file): bool {
                return !$this->isDeletedObject($this->readJson($file));
            }));
        }

        return $counts;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listObjects(string $type, string $access = 'public', bool $includeDeleted = false): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        $objects = [];
        foreach ($this->objectFiles($type) as $file) {
            $object = $this->readJson($file);
            if ($this->isDeletedObject($object) && (!$includeDeleted || !$this->canReadPrivate($access))) {
                continue;
            }

            $objects[] = $this->objectForRead($type, $object, $access);
        }

        usort($objects, static function (array $left, array $right): int {
            $leftLabel = (string) ($left['label'] ?? $left['name'] ?? $left['scoutname'] ?? $left['forename'] ?? $left['_id'] ?? $left['id'] ?? '');
            $rightLabel = (string) ($right['label'] ?? $right['name'] ?? $right['scoutname'] ?? $right['forename'] ?? $right['_id'] ?? $right['id'] ?? '');
            return strcasecmp($leftLabel, $rightLabel);
        });

        return $objects;
    }

    /**
     * @return array<string, mixed>
     */
    public function readObject(string $type, string $id, string $access = 'public'): array
    {
        $this->assertAccess($access);
        $object = $this->readCurrentObject($type, $id);
        if ($this->isDeletedObject($object) && !$this->canReadPrivate($access)) {
            throw new InvalidArgumentException('Unknown object.');
        }

        return $this->objectForRead($type, $object, $access);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentChanges(string $access = 'public', int $limit = 200): array
    {
        $this->assertAccess($access);

        $changes = [];
        foreach (array_keys(self::COLLECTIONS) as $type) {
            foreach ($this->objectFiles($type) as $file) {
                $currentRaw = $this->readJson($file);
                if ($this->isDeletedObject($currentRaw) && !$this->canReadPrivate($access)) {
                    continue;
                }

                $revision = (int) ($currentRaw['_revision'] ?? 0);
                $id = (string) ($currentRaw['_id'] ?? '');
                if ($revision < 1 || $id === '') {
                    continue;
                }

                $previousRaw = $this->readArchivedRevision($type, $id, $revision - 1);
                $current = $this->objectForRead($type, $currentRaw, $access);
                $previous = $previousRaw !== null ? $this->objectForRead($type, $previousRaw, $access) : null;
                if ($previous !== null
                    && ($current['_deleted'] ?? false) !== true
                    && $this->visibleChangePayload($previous) === $this->visibleChangePayload($current)) {
                    continue;
                }

                $part = $this->changePart($type, $previous, $current);
                $changes[] = [
                    'type' => $type,
                    'id' => $id,
                    'revision' => $revision,
                    'at' => (string) ($currentRaw['_modified'] ?? $currentRaw['_created'] ?? ''),
                    'user' => (string) ($currentRaw['_modifiedBy'] ?? ''),
                    'action' => $this->changeAction($previous, $current),
                    'part' => $part,
                    'fields' => $this->changedFields($previous, $current),
                ];
            }
        }

        usort($changes, static function (array $left, array $right): int {
            return strcmp((string) ($right['at'] ?? ''), (string) ($left['at'] ?? ''));
        });

        return array_slice($changes, 0, max(1, min($limit, 1000)));
    }

    /**
     * @param array<string, mixed> $object
     * @return array<string, mixed>
     */
    private function visibleChangePayload(array $object): array
    {
        foreach (self::META_FIELDS as $field) {
            unset($object[$field]);
        }

        return $object;
    }

    /**
     * @param array<string, mixed>|null $previous
     * @param array<string, mixed> $current
     * @return array<int, string>
     */
    private function changedFields(?array $previous, array $current): array
    {
        if (($current['_deleted'] ?? false) === true) {
            return [];
        }

        $currentPayload = $this->visibleChangePayload($current);
        if ($previous === null) {
            return array_values(array_filter(array_keys($currentPayload), static function (string $field) use ($currentPayload): bool {
                return $currentPayload[$field] !== null && $currentPayload[$field] !== '' && $currentPayload[$field] !== [];
            }));
        }

        $previousPayload = $this->visibleChangePayload($previous);
        $fields = array_unique(array_merge(array_keys($previousPayload), array_keys($currentPayload)));
        $changed = [];
        foreach ($fields as $field) {
            if (($previousPayload[$field] ?? null) !== ($currentPayload[$field] ?? null)) {
                $changed[] = $field;
            }
        }

        return $changed;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function createObject(string $type, array $payload, string $modifiedBy, string $access, string $source = ''): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        return $this->withLock($type . '-collection', function () use ($type, $payload, $modifiedBy, $access, $source): array {
            $id = $this->uuid();
            $path = $this->objectPath($type, $id);
            while (is_file($path)) {
                $id = $this->uuid();
                $path = $this->objectPath($type, $id);
            }

            $now = $this->now();
            $object = [
                '_id' => $id,
                '_revision' => 1,
                '_created' => $now,
                '_modified' => $now,
                '_modifiedBy' => $modifiedBy,
            ] + $this->defaultObjectFields($type);

            foreach ($this->normalizePayload($type, $payload, $access) as $field => $value) {
                $object[$field] = $value;
            }
            [$object] = $this->appendSourcesForWrite($type, $object, $source, $modifiedBy);

            $this->writeJson($path, $object);
            return $this->objectForRead($type, $object, $access);
        });
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function updateObject(string $type, string $id, int $baseRevision, array $payload, string $modifiedBy, string $access, string $source = '', bool $initialWrite = false): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        return $this->withLock($type . '-' . $id, function () use ($type, $id, $baseRevision, $payload, $modifiedBy, $access, $source, $initialWrite): array {
            $path = $this->objectPath($type, $id);
            $current = $this->readCurrentObject($type, $id);
            if ($this->isDeletedObject($current)) {
                throw new InvalidArgumentException('Object has been deleted.');
            }

            $this->assertBaseRevision($type, $current, $baseRevision, $access);
            $patch = $this->normalizePayload($type, $payload, $access);
            $updated = $current;
            $changed = false;
            foreach ($patch as $field => $value) {
                if (!array_key_exists($field, $updated) || $updated[$field] !== $value) {
                    $updated[$field] = $value;
                    $changed = true;
                }
            }

            [$updated, $sourceChanged] = $this->appendSourcesForWrite($type, $updated, $source, $modifiedBy, $current);
            $changed = $changed || $sourceChanged;

            if (!$changed) {
                return $this->objectForRead($type, $current, $access);
            }

            if ($initialWrite && ((int) ($current['_revision'] ?? 0)) === 1) {
                $updated['_revision'] = 1;
            } else {
                $this->archiveRevision($type, $current);
                $updated['_revision'] = ((int) ($current['_revision'] ?? 0)) + 1;
            }
            $updated['_modified'] = $this->now();
            $updated['_modifiedBy'] = $modifiedBy;
            $this->writeJson($path, $updated);

            return $this->objectForRead($type, $updated, $access);
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function deleteObject(string $type, string $id, int $baseRevision, string $modifiedBy, string $access, string $source = ''): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        return $this->withLock($type . '-' . $id, function () use ($type, $id, $baseRevision, $modifiedBy, $access, $source): array {
            $path = $this->objectPath($type, $id);
            $current = $this->readCurrentObject($type, $id);
            if ($this->isDeletedObject($current)) {
                throw new InvalidArgumentException('Object has already been deleted.');
            }

            $this->assertBaseRevision($type, $current, $baseRevision, $access);
            $this->archiveRevision($type, $current);
            $deleted = $current;
            [$deleted] = $this->appendSourcesForWrite($type, $deleted, $source, $modifiedBy);
            $deleted['_revision'] = ((int) ($current['_revision'] ?? 0)) + 1;
            $deleted['_modified'] = $this->now();
            $deleted['_modifiedBy'] = $modifiedBy;
            $deleted['_deleted'] = true;
            $this->writeJson($path, $deleted);

            return $this->objectForRead($type, $deleted, $access);
        });
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function schemas(string $access): array
    {
        $this->assertAccess($access);

        $schemas = [];
        foreach (self::FIELD_SCHEMAS as $type => $fields) {
            $visibleFields = [];
            foreach ($fields as $field => $definition) {
                $visibility = (string) ($definition['visibility'] ?? 'public');
                if (!$this->canReadVisibility($visibility, $access)) {
                    continue;
                }

                $visibleFields[$field] = [
                    'type' => $definition['type'],
                    'visibility' => $visibility,
                ];
            }

            $schemas[$type] = ['fields' => $visibleFields];
        }

        return $schemas;
    }

    /**
     * @return array<int, string>
     */
    private function requiredDirectories(): array
    {
        $data = $this->dataPath();
        $directories = [
            $data,
            $this->varPath(),
            $this->varPath() . '/auth',
            $this->varPath() . '/cache',
            $this->varPath() . '/changes',
            $this->varPath() . '/locks',
        ];

        foreach (self::COLLECTIONS as $directory) {
            $directories[] = $data . '/' . $directory;
        }

        return $directories;
    }

    /**
     * @return array<int, string>
     */
    private function objectFiles(string $type): array
    {
        $this->assertCollection($type);

        $files = glob($this->objectDirectory($type) . '/*.json');
        if ($files === false) {
            return [];
        }

        return array_values(array_filter($files, static function (string $file): bool {
            return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.json$/i', basename($file)) === 1;
        }));
    }

    /**
     * @return array<string, mixed>
     */
    private function readCurrentObject(string $type, string $id): array
    {
        $this->assertId($id);
        $path = $this->objectPath($type, $id);
        if (!is_file($path)) {
            throw new InvalidArgumentException('Unknown object.');
        }

        $object = $this->readJson($path);
        if ((string) ($object['_id'] ?? '') !== $id) {
            throw new RuntimeException('Object ID does not match filename.');
        }

        return $object;
    }

    /**
     * @return array<string, mixed>
     */
    private function readJson(string $path): array
    {
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new RuntimeException('Could not read data file.');
        }

        if (strncmp($raw, "\xEF\xBB\xBF", 3) === 0) {
            $raw = substr($raw, 3);
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new RuntimeException('Invalid data JSON.', 0, $exception);
        }

        if (!is_array($decoded)) {
            throw new RuntimeException('Data file root must be an object.');
        }

        return $decoded;
    }

    private function objectDirectory(string $type): string
    {
        $this->assertCollection($type);

        return $this->dataPath() . '/' . self::COLLECTIONS[$type];
    }

    private function objectPath(string $type, string $id): string
    {
        $this->assertId($id);
        return $this->objectDirectory($type) . '/' . $id . '.json';
    }

    /**
     * @param array<string, mixed> $object
     * @return array<string, mixed>
     */
    private function objectForRead(string $type, array $object, string $access): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        $redacted = $object;
        if (!$this->canReadPrivate($access)) {
            foreach (self::PRIVATE_META_FIELDS as $field) {
                unset($redacted[$field]);
            }

            $redacted = $this->redactPrivateFieldsRecursive($redacted);
        }

        foreach (self::FIELD_SCHEMAS[$type] ?? [] as $field => $definition) {
            $visibility = (string) ($definition['visibility'] ?? 'public');
            if (!$this->canReadVisibility($visibility, $access)) {
                unset($redacted[$field]);
            }
        }

        return $redacted;
    }

    /**
     * @param mixed $value
     * @return mixed
     */
    private function redactPrivateFieldsRecursive($value)
    {
        if (!is_array($value)) {
            return $value;
        }

        foreach ($this->privateFieldNames() as $field) {
            unset($value[$field]);
        }

        foreach ($value as $key => $nested) {
            $value[$key] = $this->redactPrivateFieldsRecursive($nested);
        }

        return $value;
    }

    /**
     * @return array<int, string>
     */
    private function privateFieldNames(): array
    {
        $fields = [];
        foreach (self::FIELD_SCHEMAS as $schema) {
            foreach ($schema as $field => $definition) {
                if (($definition['visibility'] ?? 'public') === 'private') {
                    $fields[] = $field;
                }
            }
        }

        return array_values(array_unique($fields));
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultObjectFields(string $type): array
    {
        $this->assertCollection($type);

        $defaults = [];
        foreach (self::FIELD_SCHEMAS[$type] ?? [] as $field => $definition) {
            $defaults[$field] = $definition['default'] ?? null;
        }

        return $defaults;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    private function normalizePayload(string $type, array $payload, string $access): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        $normalized = [];
        foreach ($payload as $field => $value) {
            if (!is_string($field) || in_array($field, self::META_FIELDS, true)) {
                continue;
            }

            if (!array_key_exists($field, self::FIELD_SCHEMAS[$type])) {
                continue;
            }

            $definition = self::FIELD_SCHEMAS[$type][$field];
            $visibility = (string) ($definition['visibility'] ?? 'public');
            if ($visibility === 'protected' && !$this->canReadProtected($access)) {
                throw new InvalidArgumentException('Sensitive permission is required for this field.');
            }

            $normalized[$field] = $this->normalizeValue($field, $value, (string) $definition['type']);
        }

        return $normalized;
    }

    /**
     * @param mixed $value
     * @return mixed
     */
    private function normalizeValue(string $field, $value, string $type)
    {
        switch ($type) {
            case 'string':
                return trim((string) $value);

            case 'array':
                if (!is_array($value)) {
                    throw new InvalidArgumentException($field . ' must be an array.');
                }

                if ($field === 'memberships') {
                    return $this->normalizeNestedDatapoints($value, ['group']);
                }

                if ($field === 'activities') {
                    return $this->normalizeNestedDatapoints($value, ['role', 'group']);
                }

                return $value;

            case 'json':
                return $value;

            case 'number':
                return is_numeric($value) ? (float) $value : 0.0;

            default:
                throw new RuntimeException('Unknown field type.');
        }
    }

    /**
     * @param array<int, mixed> $items
     * @param array<int, string> $referenceFields
     * @return array<int, array<string, mixed>>
     */
    private function normalizeNestedDatapoints(array $items, array $referenceFields): array
    {
        $normalized = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                throw new InvalidArgumentException('Nested datapoints must be objects.');
            }

            foreach ($referenceFields as $field) {
                $item[$field] = trim((string) ($item[$field] ?? ''));
            }

            $item['_certainty'] = trim((string) ($item['_certainty'] ?? 'none'));
            $item['_sources'] = trim((string) ($item['_sources'] ?? ''));
            $normalized[] = $item;
        }

        return $normalized;
    }

    /**
     * @param array<string, mixed> $object
     * @return array{0: array<string, mixed>, 1: bool}
     */
    private function appendSourcesForWrite(string $type, array $object, string $source, string $fallbackSource, ?array $previous = null): array
    {
        $source = $this->normalizeSource($source, $fallbackSource);
        if ($source === '') {
            return [$object, false];
        }

        $changed = false;
        if (array_key_exists('_sources', self::FIELD_SCHEMAS[$type] ?? [])) {
            $updatedSources = $this->appendSource((string) ($object['_sources'] ?? ''), $source);
            if (($object['_sources'] ?? '') !== $updatedSources) {
                $object['_sources'] = $updatedSources;
                $changed = true;
            }
        }

        if ($type === 'people') {
            foreach (['memberships', 'activities'] as $field) {
                if (!isset($object[$field]) || !is_array($object[$field])) {
                    continue;
                }

                $previousItems = isset($previous[$field]) && is_array($previous[$field]) ? $previous[$field] : null;
                foreach ($object[$field] as $index => $item) {
                    if (!is_array($item)) {
                        continue;
                    }
                    if ($previousItems !== null && !$this->nestedDatapointTouched($item, $previousItems)) {
                        continue;
                    }

                    $updatedSources = $this->appendSource((string) ($item['_sources'] ?? ''), $source);
                    if (($item['_sources'] ?? '') !== $updatedSources) {
                        $object[$field][$index]['_sources'] = $updatedSources;
                        $changed = true;
                    }
                }
            }
        }

        return [$object, $changed];
    }

    /**
     * @param array<string, mixed> $item
     * @param array<int, mixed> $previousItems
     */
    private function nestedDatapointTouched(array $item, array &$previousItems): bool
    {
        $fingerprint = $this->nestedDatapointFingerprint($item);
        foreach ($previousItems as $index => $previousItem) {
            if (!is_array($previousItem)) {
                continue;
            }

            if ($this->nestedDatapointFingerprint($previousItem) === $fingerprint) {
                unset($previousItems[$index]);
                return false;
            }
        }

        return true;
    }

    /**
     * @param array<string, mixed> $item
     */
    private function nestedDatapointFingerprint(array $item): string
    {
        unset($item['_sources']);
        $item = $this->sortForFingerprint($item);

        return json_encode($item, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '';
    }

    /**
     * @param array<mixed> $value
     * @return array<mixed>
     */
    private function sortForFingerprint(array $value): array
    {
        foreach ($value as $key => $nested) {
            if (is_array($nested)) {
                $value[$key] = $this->sortForFingerprint($nested);
            }
        }

        ksort($value);
        return $value;
    }

    private function appendSource(string $sources, string $source): string
    {
        $items = $this->sourceList($sources);
        foreach ($items as $item) {
            if (strcasecmp($item, $source) === 0) {
                return implode(', ', $items);
            }
        }

        $items[] = $source;
        return implode(', ', $items);
    }

    /**
     * @return array<int, string>
     */
    private function sourceList(string $sources): array
    {
        $items = preg_split('/[\r\n,;]+/', trim($sources)) ?: [];
        return array_values(array_filter(array_map('trim', $items), static function (string $item): bool {
            return $item !== '';
        }));
    }

    private function normalizeSource(string $source, string $fallbackSource): string
    {
        $source = trim($source);
        if ($source === '') {
            $source = trim($fallbackSource);
        }

        $source = preg_replace('/\s+/u', ' ', $source) ?? $source;
        if (strpos($source, ',') !== false) {
            throw new InvalidArgumentException('Source must not contain commas.');
        }

        if (strlen($source) > 256) {
            $source = substr($source, 0, 256);
        }

        return $source;
    }

    /**
     * @param array<string, mixed> $current
     */
    private function assertBaseRevision(string $type, array $current, int $baseRevision, string $access): void
    {
        $currentRevision = (int) ($current['_revision'] ?? 0);
        if ($baseRevision < 1 || $currentRevision !== $baseRevision) {
            throw new StorageConflictException(
                'Object was changed by someone else.',
                $this->objectForRead($type, $current, $access)
            );
        }
    }

    /**
     * @param array<string, mixed> $object
     */
    private function archiveRevision(string $type, array $object): void
    {
        $id = (string) ($object['_id'] ?? '');
        $revision = (int) ($object['_revision'] ?? 0);
        $this->assertId($id);
        if ($revision < 1) {
            throw new RuntimeException('Object revision is invalid.');
        }

        $archive = $this->objectDirectory($type) . '/' . $id . '_' . $revision . '.json';
        if (!is_file($archive)) {
            $this->writeJson($archive, $object);
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    private function readArchivedRevision(string $type, string $id, int $revision): ?array
    {
        if ($revision < 1) {
            return null;
        }

        $this->assertId($id);
        $archive = $this->objectDirectory($type) . '/' . $id . '_' . $revision . '.json';
        return is_file($archive) ? $this->readJson($archive) : null;
    }

    /**
     * @param array<string, mixed>|null $previous
     * @param array<string, mixed> $current
     * @return array{field: string, edit: string, label: string}
     */
    private function changePart(string $type, ?array $previous, array $current): array
    {
        if ($previous === null || ($current['_deleted'] ?? false) === true) {
            return ['field' => '', 'edit' => '', 'label' => 'Eintrag'];
        }

        foreach ($this->nestedChangeFields($type) as $field => $label) {
            if (!array_key_exists($field, $current)) {
                continue;
            }

            if ($field === 'mainPhase') {
                if (($previous[$field] ?? null) !== ($current[$field] ?? null)) {
                    return ['field' => $field, 'edit' => 'mainPhase', 'label' => $label];
                }
                continue;
            }

            $previousItems = is_array($previous[$field] ?? null) ? $previous[$field] : [];
            $currentItems = is_array($current[$field] ?? null) ? $current[$field] : [];
            $count = max(count($previousItems), count($currentItems));
            for ($index = 0; $index < $count; $index++) {
                if (($previousItems[$index] ?? null) !== ($currentItems[$index] ?? null)) {
                    return ['field' => $field, 'edit' => $field . ':' . $index, 'label' => $label];
                }
            }
        }

        return ['field' => '', 'edit' => '', 'label' => 'Eintrag'];
    }

    /**
     * @return array<string, string>
     */
    private function nestedChangeFields(string $type): array
    {
        if ($type === 'people') {
            return [
                'memberships' => 'Mitgliedschaft',
                'activities' => 'Aktivität',
            ];
        }

        if ($type === 'groups') {
            return [
                'mainPhase' => 'Hauptphase',
                'additionalPhases' => 'Weitere Phase',
            ];
        }

        return [];
    }

    /**
     * @param array<string, mixed>|null $previous
     * @param array<string, mixed> $current
     */
    private function changeAction(?array $previous, array $current): string
    {
        if (($current['_deleted'] ?? false) === true) {
            return 'deleted';
        }

        return $previous === null ? 'created' : 'updated';
    }

    /**
     * @param array<string, mixed> $object
     */
    private function isDeletedObject(array $object): bool
    {
        return ($object['_deleted'] ?? false) === true;
    }

    /**
     * @return mixed
     */
    private function withLock(string $name, callable $callback)
    {
        $lockPath = $this->varPath() . '/locks/' . preg_replace('/[^A-Za-z0-9_.-]/', '_', $name) . '.lock';
        $lock = fopen($lockPath, 'c');
        if ($lock === false || !flock($lock, LOCK_EX)) {
            throw new RuntimeException('Could not lock object storage.');
        }
        @chmod($lockPath, 0600);

        try {
            return $callback();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function writeJson(string $path, array $data): void
    {
        $tmp = $path . '.tmp.' . bin2hex(random_bytes(6));
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false || file_put_contents($tmp, $json . PHP_EOL, LOCK_EX) === false) {
            throw new RuntimeException('Could not write data JSON.');
        }

        if (!rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException('Could not replace data JSON.');
        }
        @chmod($path, 0600);
    }

    private function assertCollection(string $type): void
    {
        if (!array_key_exists($type, self::COLLECTIONS)) {
            throw new InvalidArgumentException('Unknown collection.');
        }
    }

    private function assertAccess(string $access): void
    {
        if (!in_array($access, ['public', 'private', 'protected'], true)) {
            throw new InvalidArgumentException('Unknown access level.');
        }
    }

    private function canReadPrivate(string $access): bool
    {
        return $access === 'private' || $access === 'protected';
    }

    private function canReadProtected(string $access): bool
    {
        return $access === 'protected';
    }

    private function canReadVisibility(string $visibility, string $access): bool
    {
        if ($visibility === 'public') {
            return true;
        }

        if ($visibility === 'private') {
            return $this->canReadPrivate($access);
        }

        if ($visibility === 'protected') {
            return $this->canReadProtected($access);
        }

        throw new RuntimeException('Unknown field visibility.');
    }

    private function assertId(string $id): void
    {
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id) !== 1) {
            throw new InvalidArgumentException('Invalid object ID.');
        }
    }

    private function dataPath(): string
    {
        return $this->basePath . '/' . $this->relativeDataPath();
    }

    private function varPath(): string
    {
        return $this->basePath . '/' . $this->relativeVarPath();
    }

    private function relativeDataPath(): string
    {
        return 'data';
    }

    private function relativeVarPath(): string
    {
        return 'var';
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);

        return sprintf(
            '%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12)
        );
    }

    private function now(): string
    {
        return gmdate('Y-m-d\TH:i:s\Z');
    }
}
