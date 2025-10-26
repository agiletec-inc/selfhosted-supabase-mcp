import test from 'node:test';
import assert from 'node:assert/strict';

import { SessionManager } from '../src/auth/session.ts';
import { SessionError } from '../src/auth/types.ts';

const baseConfig = {
    jwtSecret: 'unit-test-secret',
    sessionTimeout: 200,
    maxConcurrentSessions: 1,
    enableAuditLogging: false,
    allowedAudiences: ['mcp-server'],
    allowedIssuers: ['supabase'],
    requireHumanApproval: [],
};

test('SessionManager enforces concurrent session limits', async () => {
    const manager = new SessionManager(baseConfig);

    try {
        const session = await manager.createSession('user-1');
        assert.ok(session.sessionId);

        await assert.rejects(
            () => manager.createSession('user-1'),
            (error: unknown) => error instanceof SessionError && error.code === 'SESSION_LIMIT_EXCEEDED',
        );
    } finally {
        manager.destroy();
    }
});

test('SessionManager validates and extends sessions', async () => {
    const manager = new SessionManager({ ...baseConfig, maxConcurrentSessions: 2 });

    try {
        const session = await manager.createSession('user-2', 'agent', '127.0.0.1');
        const validated = await manager.validateSession(session.sessionId);

        assert.ok(validated);
        assert.equal(validated?.userId, 'user-2');

        const extended = await manager.extendSession(session.sessionId);
        assert.equal(extended, true);

        const isBound = manager.validateSessionBinding(session.sessionId, 'agent', '127.0.0.1');
        assert.equal(isBound, true);

        await manager.destroySession(session.sessionId);
        const afterDestroy = await manager.validateSession(session.sessionId);
        assert.equal(afterDestroy, null);
    } finally {
        manager.destroy();
    }
});
