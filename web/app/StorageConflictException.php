<?php
declare(strict_types=1);

namespace Stammbaum;

use RuntimeException;

final class StorageConflictException extends RuntimeException
{
    /** @var array<string, mixed> */
    private array $currentObject;

    /**
     * @param array<string, mixed> $currentObject
     */
    public function __construct(string $message, array $currentObject)
    {
        parent::__construct($message);
        $this->currentObject = $currentObject;
    }

    /**
     * @return array<string, mixed>
     */
    public function currentObject(): array
    {
        return $this->currentObject;
    }
}
