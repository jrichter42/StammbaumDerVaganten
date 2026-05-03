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
            '_sources' => ['type' => 'string', 'default' => '', 'visibility' => 'private'],
            'name' => ['type' => 'string', 'default' => '', 'visibility' => 'public'],
            'date' => ['type' => 'json', 'default' => null, 'visibility' => 'public'],
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

            if (!mkdir($directory, 0775, true) && !is_dir($directory)) {
                throw new RuntimeException('Could not create storage directory.');
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function status(string $access = 'public'): array
    {
        $this->assertAccess($access);

        return [
            'data_path' => $this->relativeDataPath(),
            'var_path' => $this->relativeVarPath(),
            'exists' => is_dir($this->dataPath()),
            'writable' => is_writable($this->dataPath()),
            'runtime_writable' => is_writable($this->varPath()),
            'collections' => $this->counts(),
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
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function createObject(string $type, array $payload, string $userId, string $access): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        return $this->withLock($type . '-collection', function () use ($type, $payload, $userId, $access): array {
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
                '_modifiedBy' => $userId,
            ] + $this->defaultObjectFields($type);

            foreach ($this->normalizePayload($type, $payload, $access) as $field => $value) {
                $object[$field] = $value;
            }

            $this->writeJson($path, $object);
            return $this->objectForRead($type, $object, $access);
        });
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function updateObject(string $type, string $id, int $baseRevision, array $payload, string $userId, string $access): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        return $this->withLock($type . '-' . $id, function () use ($type, $id, $baseRevision, $payload, $userId, $access): array {
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

            if (!$changed) {
                return $this->objectForRead($type, $current, $access);
            }

            $this->archiveRevision($type, $current);
            $updated['_revision'] = ((int) ($current['_revision'] ?? 0)) + 1;
            $updated['_modified'] = $this->now();
            $updated['_modifiedBy'] = $userId;
            $this->writeJson($path, $updated);

            return $this->objectForRead($type, $updated, $access);
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function deleteObject(string $type, string $id, int $baseRevision, string $userId, string $access): array
    {
        $this->assertCollection($type);
        $this->assertAccess($access);

        return $this->withLock($type . '-' . $id, function () use ($type, $id, $baseRevision, $userId, $access): array {
            $path = $this->objectPath($type, $id);
            $current = $this->readCurrentObject($type, $id);
            if ($this->isDeletedObject($current)) {
                throw new InvalidArgumentException('Object has already been deleted.');
            }

            $this->assertBaseRevision($type, $current, $baseRevision, $access);
            $this->archiveRevision($type, $current);
            $deleted = $current;
            $deleted['_revision'] = ((int) ($current['_revision'] ?? 0)) + 1;
            $deleted['_modified'] = $this->now();
            $deleted['_modifiedBy'] = $userId;
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

                return $value;

            case 'json':
                return $value;

            default:
                throw new RuntimeException('Unknown field type.');
        }
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
