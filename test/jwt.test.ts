import test from 'node:test';
import assert from 'node:assert/strict';

import { JWTValidator } from '../src/auth/jwt.ts';
import { AuthenticationError } from '../src/auth/types.ts';

const config = {
    jwtSecret: 'unit-test-secret',
    sessionTimeout: 1000,
    maxConcurrentSessions: 5,
    enableAuditLogging: false,
    allowedAudiences: ['mcp-server'],
    allowedIssuers: ['supabase'],
    requireHumanApproval: [],
};

const createToken = (payload: Record<string, unknown>): string => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${header}.${body}.signature`;
};

test('JWTValidator validates payload and extracts roles/permissions', async () => {
    const validator = new JWTValidator(config);
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: 'user-123',
        aud: 'mcp-server',
        iss: 'supabase',
        exp: now + 3600,
        iat: now,
        role: 'operator',
        roles: ['authenticated', 'operator'],
        permissions: ['read:tables', 'execute:sql'],
    };

    const token = createToken(payload);
    const validated = await validator.validateToken(token);

    assert.equal(validated.sub, 'user-123');
    assert.deepEqual(validator.extractRoles(validated), ['operator', 'authenticated']);
    assert.deepEqual(validator.extractPermissions(validated), ['read:tables', 'execute:sql']);
    assert.equal(validator.validateTokenAudience(validated, 'mcp-server'), true);
});

test('JWTValidator rejects invalid tokens and audiences', async () => {
    const validator = new JWTValidator(config);
    const now = Math.floor(Date.now() / 1000);

    const invalidFormat = 'invalid.token';
    await assert.rejects(async () => {
        await validator.validateToken(invalidFormat);
    }, AuthenticationError);

    const invalidAudienceToken = createToken({
        sub: 'user-1',
        aud: 'another-service',
        iss: 'supabase',
        exp: now + 3600,
        iat: now,
    });

    await assert.rejects(async () => {
        await validator.validateToken(invalidAudienceToken);
    }, (error: unknown) => error instanceof AuthenticationError && error.code === 'AUTH_INVALID_AUDIENCE');
});
