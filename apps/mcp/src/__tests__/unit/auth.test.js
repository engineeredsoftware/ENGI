"use strict";
/**
 * Unit tests for authentication middleware
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const middleware_1 = require("../../auth/middleware");
const supabase_1 = require("@bitcode/supabase");
const orm_1 = require("@bitcode/orm");
globals_1.jest.mock('@bitcode/logger');
globals_1.jest.mock('@bitcode/supabase', () => ({
    createClient: globals_1.jest.fn()
}));
globals_1.jest.mock('@bitcode/orm', () => ({
    UsersModel: globals_1.jest.fn(),
    UserProfilesModel: globals_1.jest.fn(),
    UserApiKeysModel: globals_1.jest.fn(),
    UserBtdBalancesModel: globals_1.jest.fn(),
    OrganizationsModel: globals_1.jest.fn(),
    OrganizationMembersModel: globals_1.jest.fn()
}));
const mockGetByKeyHash = globals_1.jest.fn();
const mockUpdateLastUsed = globals_1.jest.fn();
const mockGetById = globals_1.jest.fn();
const mockGetCreditsByUserId = globals_1.jest.fn();
const mockGetMembership = globals_1.jest.fn();
const resetOrmMocks = () => {
    supabase_1.createClient.mockReturnValue({ supabase: 'test' });
    orm_1.UserApiKeysModel.mockImplementation(() => ({
        getByKeyHash: mockGetByKeyHash,
        updateLastUsed: mockUpdateLastUsed
    }));
    orm_1.UsersModel.mockImplementation(() => ({
        getById: mockGetById
    }));
    orm_1.UserBtdBalancesModel.mockImplementation(() => ({
        getByUserId: mockGetCreditsByUserId
    }));
    orm_1.OrganizationsModel.mockImplementation(() => ({
        getById: mockGetById
    }));
    orm_1.OrganizationMembersModel.mockImplementation(() => ({
        getMembership: mockGetMembership
    }));
};
(0, globals_1.describe)('Authentication Middleware', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        middleware_1.authCache.clear();
        resetOrmMocks();
    });
    (0, globals_1.describe)('authenticateMCPRequest', () => {
        (0, globals_1.it)('authenticates a valid API key and derives current Bitcode permissions', async () => {
            mockGetByKeyHash.mockResolvedValue({
                id: 'key123',
                user_id: 'user123',
                name: 'Bitcode Test Key',
                scopes: ['pipelines:create', 'resources:read'],
                expires_at: null
            });
            mockUpdateLastUsed.mockResolvedValue(undefined);
            mockGetById
                .mockResolvedValueOnce({
                id: 'user123',
                email: 'operator@example.com',
                full_name: 'Bitcode Operator',
                organization_id: 'org123'
            })
                .mockResolvedValueOnce({
                id: 'org123',
                name: 'Bitcode Labs',
                slug: 'bitcode-labs'
            });
            mockGetMembership.mockResolvedValue({
                role: 'member',
                permissions: {
                    organization: ['viewAnalytics'],
                    pipelines: ['create', 'read'],
                    resources: ['read']
                }
            });
            mockGetCreditsByUserId.mockResolvedValue({ balance: 120 });
            const result = await (0, middleware_1.authenticateMCPRequest)('Bearer key_test123', {
                requireOrganization: true,
                requiredPermissions: {
                    pipelines: ['create'],
                    resources: ['read']
                }
            });
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.context).toMatchObject({
                userId: 'user123',
                organizationId: 'org123',
                apiKeyId: 'key123',
                apiKeyName: 'Bitcode Test Key',
                organizationName: 'Bitcode Labs',
                organizationSlug: 'bitcode-labs',
                btdBalance: 120
            });
            (0, globals_1.expect)(result.context?.permissions.pipelines.create).toBe(true);
            (0, globals_1.expect)(result.context?.permissions.organization.viewAnalytics).toBe(true);
            (0, globals_1.expect)(mockGetByKeyHash).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)(mockUpdateLastUsed).toHaveBeenCalledWith('key123');
        });
        (0, globals_1.it)('reuses cached auth context across repeated requests', async () => {
            mockGetByKeyHash.mockResolvedValue({
                id: 'key123',
                user_id: 'user123',
                name: 'Bitcode Test Key',
                scopes: ['resources:read'],
                expires_at: null
            });
            mockUpdateLastUsed.mockResolvedValue(undefined);
            mockGetById
                .mockResolvedValueOnce({
                id: 'user123',
                email: 'operator@example.com',
                full_name: 'Bitcode Operator',
                organization_id: undefined
            });
            mockGetCreditsByUserId.mockResolvedValue({ balance: 50 });
            const first = await (0, middleware_1.authenticateMCPRequest)('Bearer key_test123', {
                requiredPermissions: { resources: ['read'] }
            });
            const second = await (0, middleware_1.authenticateMCPRequest)('Bearer key_test123', {
                requiredPermissions: { resources: ['read'] }
            });
            (0, globals_1.expect)(first.success).toBe(true);
            (0, globals_1.expect)(second.success).toBe(true);
            (0, globals_1.expect)(mockGetByKeyHash).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)(mockUpdateLastUsed).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)(mockGetById).toHaveBeenCalledTimes(1);
        });
        (0, globals_1.it)('fails closed when the authorization header does not contain a Bearer API key', async () => {
            const result = await (0, middleware_1.authenticateMCPRequest)('invalid_token');
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.error).toMatchObject({
                code: 'MISSING_API_KEY',
                statusCode: 401
            });
        });
        (0, globals_1.it)('fails closed on insufficient derived permissions', async () => {
            mockGetByKeyHash.mockResolvedValue({
                id: 'key123',
                user_id: 'user123',
                name: 'Bitcode Test Key',
                scopes: ['resources:read'],
                expires_at: null
            });
            mockUpdateLastUsed.mockResolvedValue(undefined);
            mockGetById.mockResolvedValueOnce({
                id: 'user123',
                email: 'operator@example.com',
                full_name: 'Bitcode Operator',
                organization_id: undefined
            });
            mockGetCreditsByUserId.mockResolvedValue({ balance: 50 });
            const result = await (0, middleware_1.authenticateMCPRequest)('Bearer key_test123', {
                requiredPermissions: { pipelines: ['create'] }
            });
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.error).toMatchObject({
                code: 'INSUFFICIENT_PERMISSIONS',
                statusCode: 403
            });
            (0, globals_1.expect)(result.error?.message).toContain('pipelines.create');
        });
        (0, globals_1.it)('fails closed when minimum BTD is not satisfied', async () => {
            mockGetByKeyHash.mockResolvedValue({
                id: 'key123',
                user_id: 'user123',
                name: 'Bitcode Test Key',
                scopes: ['resources:read'],
                expires_at: null
            });
            mockUpdateLastUsed.mockResolvedValue(undefined);
            mockGetById.mockResolvedValueOnce({
                id: 'user123',
                email: 'operator@example.com',
                full_name: 'Bitcode Operator',
                organization_id: undefined
            });
            mockGetCreditsByUserId.mockResolvedValue({ balance: 10 });
            const result = await (0, middleware_1.authenticateMCPRequest)('Bearer key_test123', {
                minimumBtd: 100
            });
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.error).toMatchObject({
                code: 'INSUFFICIENT_BTD',
                statusCode: 402
            });
        });
    });
    (0, globals_1.describe)('validatePermissions', () => {
        (0, globals_1.it)('validates the current structured permission shape', () => {
            const context = {
                permissions: {
                    pipelines: {
                        create: true,
                        read: true,
                        cancel: false,
                        retry: false
                    },
                    organization: {
                        manageMembers: false,
                        viewAnalytics: true,
                        manageBtd: false
                    },
                    resources: {
                        read: true,
                        export: false
                    }
                }
            };
            (0, globals_1.expect)((0, middleware_1.validatePermissions)(context, {
                pipelines: ['read'],
                resources: ['read']
            })).toBe(true);
            (0, globals_1.expect)((0, middleware_1.validatePermissions)(context, {
                pipelines: ['cancel']
            })).toBe(false);
        });
        (0, globals_1.it)('treats empty requirements as satisfied', () => {
            const context = {
                permissions: {
                    pipelines: {
                        create: false,
                        read: false,
                        cancel: false,
                        retry: false
                    },
                    organization: {
                        manageMembers: false,
                        viewAnalytics: false,
                        manageBtd: false
                    },
                    resources: {
                        read: false,
                        export: false
                    }
                }
            };
            (0, globals_1.expect)((0, middleware_1.validatePermissions)(context, {})).toBe(true);
        });
    });
});
