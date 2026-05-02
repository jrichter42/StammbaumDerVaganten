<?php
declare(strict_types=1);

namespace Stammbaum;

use RuntimeException;

final class Cbor
{
    private string $data;
    private int $offset = 0;

    private function __construct(string $data)
    {
        $this->data = $data;
    }

    /**
     * @return mixed
     */
    public static function decode(string $data)
    {
        $decoder = new self($data);
        $value = $decoder->readValue();
        if ($decoder->offset !== strlen($data)) {
            throw new RuntimeException('Trailing CBOR data.');
        }

        return $value;
    }

    /**
     * @return mixed
     */
    public static function decodeFirst(string $data)
    {
        $decoder = new self($data);
        return $decoder->readValue();
    }

    /**
     * @return mixed
     */
    private function readValue()
    {
        $initial = $this->readByte();
        $major = $initial >> 5;
        $additional = $initial & 0x1f;

        switch ($major) {
            case 0:
                return $this->readLength($additional);
            case 1:
                return -1 - $this->readLength($additional);
            case 2:
                return $this->readBytes($this->readLength($additional));
            case 3:
                return $this->readText($this->readLength($additional));
            case 4:
                return $this->readArray($this->readLength($additional));
            case 5:
                return $this->readMap($this->readLength($additional));
            case 6:
                $this->readLength($additional);
                return $this->readValue();
            case 7:
                return $this->readSimple($additional);
            default:
                throw new RuntimeException('Unsupported CBOR major type.');
        }
    }

    private function readLength(int $additional): int
    {
        if ($additional < 24) {
            return $additional;
        }

        if ($additional === 24) {
            return $this->readByte();
        }

        if ($additional === 25) {
            $bytes = $this->readBytes(2);
            return unpack('n', $bytes)[1];
        }

        if ($additional === 26) {
            $bytes = $this->readBytes(4);
            return unpack('N', $bytes)[1];
        }

        if ($additional === 27) {
            $bytes = $this->readBytes(8);
            $parts = unpack('Nhigh/Nlow', $bytes);
            $value = ($parts['high'] * 4294967296) + $parts['low'];
            if ($value > PHP_INT_MAX) {
                throw new RuntimeException('CBOR integer is too large.');
            }

            return (int) $value;
        }

        throw new RuntimeException('Indefinite-length CBOR is not supported.');
    }

    private function readByte(): int
    {
        if ($this->offset >= strlen($this->data)) {
            throw new RuntimeException('Unexpected end of CBOR data.');
        }

        return ord($this->data[$this->offset++]);
    }

    private function readBytes(int $length): string
    {
        if ($length < 0 || $this->offset + $length > strlen($this->data)) {
            throw new RuntimeException('Unexpected end of CBOR data.');
        }

        $bytes = substr($this->data, $this->offset, $length);
        $this->offset += $length;
        return $bytes;
    }

    private function readText(int $length): string
    {
        return $this->readBytes($length);
    }

    /**
     * @return array<int, mixed>
     */
    private function readArray(int $length): array
    {
        $items = [];
        for ($i = 0; $i < $length; $i++) {
            $items[] = $this->readValue();
        }

        return $items;
    }

    /**
     * @return array<int|string, mixed>
     */
    private function readMap(int $length): array
    {
        $map = [];
        for ($i = 0; $i < $length; $i++) {
            $key = $this->readValue();
            if (!is_int($key) && !is_string($key)) {
                throw new RuntimeException('Unsupported CBOR map key.');
            }

            $map[$key] = $this->readValue();
        }

        return $map;
    }

    /**
     * @return mixed
     */
    private function readSimple(int $additional)
    {
        if ($additional === 20) {
            return false;
        }

        if ($additional === 21) {
            return true;
        }

        if ($additional === 22 || $additional === 23) {
            return null;
        }

        if ($additional === 24) {
            $this->readByte();
            return null;
        }

        throw new RuntimeException('Unsupported CBOR simple value.');
    }
}
