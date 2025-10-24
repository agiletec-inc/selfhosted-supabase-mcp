import test from 'node:test';
import assert from 'node:assert/strict';

import {
    maskCredential,
    maskSensitiveFields,
    validateCredential,
    sanitizeCredentialForLogging,
    secureStringCompare,
} from '../src/auth/credentials.ts';

test('maskCredential masks middle portion of long credentials', () => {
    const credential = 'ABCDEFGHIJKL1234567890';
    const masked = maskCredential(credential);

    assert.equal(masked.startsWith('ABCD'), true);
    assert.equal(masked.endsWith('7890'), true);
    assert.equal(masked.length, credential.length);
    assert.notEqual(masked, credential);
});

test('maskCredential handles short credentials by keeping first character', () => {
    const credential = 'ABCD';
    const masked = maskCredential(credential);

    assert.equal(masked[0], 'A');
    assert.equal(masked.slice(1), '***');
});

test('maskSensitiveFields recursively masks nested objects and arrays', () => {
    const payload = {
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon',
        nested: {
            service_key: 'service-role-secret',
        },
        history: [
            { jwtSecret: 'supabase-jwt-secret' },
            { token: 'short' },
        ],
        safe: 'value',
    };

    const masked = maskSensitiveFields(payload as Record<string, unknown>);

    assert.notEqual(masked.anonKey, payload.anonKey);
    assert.notEqual((masked.nested as Record<string, unknown>).service_key, payload.nested.service_key);
    assert.equal((masked.history as unknown[])[1], 's***');
    assert.equal(masked.safe, 'value');
});

test('validateCredential enforces length and format requirements', () => {
    assert.equal(validateCredential('short', 'api_key').valid, false);
    assert.equal(
        validateCredential('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-key-with-length', 'api_key').valid,
        true,
    );
    assert.equal(
        validateCredential(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.jwt-header.payload.signature',
            'jwt',
        ).valid,
        true,
    );
});

test('sanitizeCredentialForLogging exposes only prefix and length metadata', () => {
    const value = sanitizeCredentialForLogging('super-secret-value');
    assert.match(value, /\[CREDENTIAL:\d+chars:supe\.\.\]/);
});

test('secureStringCompare performs constant-time equality check', () => {
    assert.equal(secureStringCompare('abcd', 'abcd'), true);
    assert.equal(secureStringCompare('abcd', 'abce'), false);
    assert.equal(secureStringCompare('abcd', 'abc'), false);
});
