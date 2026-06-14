export function decodeCreationOptions(publicKey) {
  return {
    ...publicKey,
    challenge: base64urlToBuffer(publicKey.challenge),
    user: {
      ...publicKey.user,
      id: base64urlToBuffer(publicKey.user.id),
    },
    excludeCredentials: (publicKey.excludeCredentials || []).map((credential) => ({
      ...credential,
      id: base64urlToBuffer(credential.id),
    })),
  };
}

export function decodeRequestOptions(publicKey) {
  const decoded = {
    ...publicKey,
    challenge: base64urlToBuffer(publicKey.challenge),
  };

  if (Array.isArray(publicKey.allowCredentials)) {
    decoded.allowCredentials = publicKey.allowCredentials.map((credential) => ({
      ...credential,
      id: base64urlToBuffer(credential.id),
    }));
  }

  return decoded;
}

export function credentialToJson(credential) {
  const response = credential.response;
  const result = {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
    },
  };

  if (response.attestationObject) {
    result.response.attestationObject = bufferToBase64url(response.attestationObject);
  }

  if (response.authenticatorData) {
    result.response.authenticatorData = bufferToBase64url(response.authenticatorData);
  }

  if (response.signature) {
    result.response.signature = bufferToBase64url(response.signature);
  }

  if (response.userHandle) {
    result.response.userHandle = bufferToBase64url(response.userHandle);
  }

  if (typeof response.getTransports === 'function') {
    result.response.transports = response.getTransports();
  }

  return result;
}

export function base64urlToBuffer(value) {
  const base64 = String(value).replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = globalThis.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

export function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return globalThis.btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
