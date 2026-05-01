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
        'role-types' => 'role-types',
        'roles' => 'roles',
        'timepoints' => 'timepoints',
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
    public function status(): array
    {
        return [
            'data_path' => $this->relativeDataPath(),
            'var_path' => $this->relativeVarPath(),
            'exists' => is_dir($this->dataPath()),
            'writable' => is_writable($this->dataPath()),
            'runtime_writable' => is_writable($this->varPath()),
            'collections' => $this->counts(),
        ];
    }

    /**
     * @return array<string, int>
     */
    public function counts(): array
    {
        $counts = [];
        foreach (array_keys(self::COLLECTIONS) as $type) {
            $counts[$type] = count($this->objectFiles($type));
        }

        return $counts;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listObjects(string $type): array
    {
        $this->assertCollection($type);

        $objects = [];
        foreach ($this->objectFiles($type) as $file) {
            $object = $this->readJson($file);
            $objects[] = $object;
        }

        usort($objects, static function (array $left, array $right): int {
            $leftLabel = (string) ($left['label'] ?? $left['name'] ?? $left['data']['label'] ?? $left['_id'] ?? $left['id'] ?? '');
            $rightLabel = (string) ($right['label'] ?? $right['name'] ?? $right['data']['label'] ?? $right['_id'] ?? $right['id'] ?? '');
            return strcasecmp($leftLabel, $rightLabel);
        });

        return $objects;
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
    private function readJson(string $path): array
    {
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new RuntimeException('Could not read data file.');
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

    private function assertCollection(string $type): void
    {
        if (!array_key_exists($type, self::COLLECTIONS)) {
            throw new InvalidArgumentException('Unknown collection.');
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
}
