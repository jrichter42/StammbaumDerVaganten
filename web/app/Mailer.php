<?php
declare(strict_types=1);

namespace Stammbaum;

final class Mailer
{
    private bool $enabled;
    private string $fromAddress;
    private string $fromName;
    private string $replyTo;
    private string $loginSubject;

    /**
     * @param array<string, mixed> $config
     */
    public function __construct(array $config)
    {
        $mail = is_array($config['mail'] ?? null) ? $config['mail'] : [];
        $this->fromAddress = $this->cleanHeader((string) ($mail['from_address'] ?? ''));
        $this->fromName = $this->cleanHeader((string) ($mail['from_name'] ?? ($config['name'] ?? 'Stammbaum der Vaganten')));
        $this->replyTo = $this->cleanHeader((string) ($mail['reply_to'] ?? ''));
        $this->loginSubject = $this->cleanHeader((string) ($mail['login_subject'] ?? 'Login-Link für Stammbaum der Vaganten'));
        $this->enabled = (bool) ($mail['enabled'] ?? false)
            && filter_var($this->fromAddress, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function isLoginEnabled(): bool
    {
        return $this->enabled;
    }

    public function sendLoginLink(string $to, string $displayName, string $loginUrl, string $expiresAt): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $to = $this->cleanHeader($to);
        if (filter_var($to, FILTER_VALIDATE_EMAIL) === false) {
            return false;
        }

        $name = trim($displayName) !== '' ? trim($displayName) : 'Benutzer';
        $body = implode("\n", [
            'Hallo ' . $name . ',',
            '',
            'hier ist dein Login-Link:',
            $loginUrl,
            '',
            'Der Link ist einmalig nutzbar und läuft ab:',
            $expiresAt,
            '',
            'Falls du keinen Login-Link angefordert hast, kannst du diese Mail ignorieren.',
        ]);

        $headers = [
            'From: ' . $this->mailbox($this->fromAddress, $this->fromName),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'X-Mailer: Stammbaum der Vaganten',
        ];
        if ($this->replyTo !== '' && filter_var($this->replyTo, FILTER_VALIDATE_EMAIL) !== false) {
            $headers[] = 'Reply-To: ' . $this->replyTo;
        }

        return mail(
            $to,
            $this->encodeHeader($this->loginSubject),
            $body,
            implode("\r\n", $headers)
        );
    }

    private function mailbox(string $address, string $name): string
    {
        if ($name === '') {
            return $address;
        }

        return $this->encodeHeader($name) . ' <' . $address . '>';
    }

    private function encodeHeader(string $value): string
    {
        if ($value === '') {
            return '';
        }

        if (preg_match('/^[\x20-\x7E]+$/', $value) === 1) {
            return $value;
        }

        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }

    private function cleanHeader(string $value): string
    {
        return trim(str_replace(["\r", "\n"], '', $value));
    }
}
