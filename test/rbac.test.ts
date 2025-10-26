import test from 'node:test';
import assert from 'node:assert/strict';

import { RBACManager } from '../src/auth/rbac.ts';
import type { AuthContext } from '../src/auth/types.ts';

const createContext = (roles: string[], permissions: string[] = []): AuthContext => ({
    sessionId: 'session',
    roles,
    permissions,
    isAuthenticated: roles.some(role => role !== 'anon'),
});

test('RBACManager grants read access to anon role for public data', () => {
    const rbac = new RBACManager();
    const context = createContext(['anon']);

    assert.equal(rbac.hasPermission(context, 'read', 'public_data'), true);
    assert.equal(rbac.hasPermission(context, 'write', 'migrations'), false);
});

test('RBACManager enforces tool permissions and conditions', () => {
    const rbac = new RBACManager();
    const context = createContext(['operator']);

    const { action, resource, conditions } = rbac.getToolPermissions('execute_sql');
    assert.equal(action, 'execute');
    assert.equal(resource, 'sql');
    assert.deepEqual(conditions, undefined);

    assert.equal(rbac.hasPermission(context, 'execute', 'sql', { readOnly: true }), true);
    assert.equal(rbac.hasPermission(context, 'execute', 'sql', { readOnly: false }), false);
});

test('RBACManager recognizes explicit permissions from JWT payload', () => {
    const rbac = new RBACManager();
    const context = createContext(['authenticated'], ['write:auth_users']);

    assert.equal(rbac.hasPermission(context, 'write', 'auth_users'), true);
});

test('RBACManager human approval required for destructive tools', () => {
    const rbac = new RBACManager();
    const serviceRoleContext = createContext(['service_role']);
    const adminContext = createContext(['admin']);

    assert.equal(rbac.requiresHumanApproval('execute_sql', serviceRoleContext), true);
    assert.equal(rbac.requiresHumanApproval('delete_auth_user', serviceRoleContext), true);
    assert.equal(rbac.requiresHumanApproval('execute_sql', adminContext), false);
});
