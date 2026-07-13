/**
 * Unit tests for authentication middleware
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { authenticateMCPRequest, authCache, validatePermissions } from '../../auth/middleware';
import { buildMcpInterfaceIntegrationRecord } from '../../interface-integration';
import { createClient } from '@bitcode/supabase';
import {
  BtdRegistryModel,
  OrganizationsModel,
  OrganizationMembersModel,
  UserApiKeysModel,
  UserBtdBalancesModel,
  UserProfilesModel,
  UsersModel
} from '@bitcode/orm';

jest.mock('@bitcode/logger');
jest.mock('@bitcode/supabase', () => ({
  createClient: jest.fn()
}));
jest.mock('@bitcode/orm', () => ({
  UsersModel: jest.fn(),
  UserProfilesModel: jest.fn(),
  UserApiKeysModel: jest.fn(),
  UserBtdBalancesModel: jest.fn(),
  BtdRegistryModel: jest.fn(),
  OrganizationsModel: jest.fn(),
  OrganizationMembersModel: jest.fn(),
  readBitcodeWalletBindingFromProfile: jest.fn((profile) => profile?.wallet_binding ?? null)
}));

const mockGetByKeyHash = jest.fn();
const mockUpdateLastUsed = jest.fn();
const mockGetById = jest.fn();
const mockGetProfileByUserId = jest.fn();
const mockReadBtdHoldingAmount = jest.fn();
const mockGetMembership = jest.fn();
const mockGetAssetPackRange = jest.fn();
const mockListOwnershipClaims = jest.fn();
const mockListReadLicenses = jest.fn();

const resetOrmMocks = () => {
  (createClient as jest.Mock).mockReturnValue({ supabase: 'test' });

  (UserApiKeysModel as unknown as jest.Mock).mockImplementation(() => ({
    getByKeyHash: mockGetByKeyHash,
    updateLastUsed: mockUpdateLastUsed
  }));

  (UsersModel as unknown as jest.Mock).mockImplementation(() => ({
    getById: mockGetById
  }));

  (UserProfilesModel as unknown as jest.Mock).mockImplementation(() => ({
    getByUserId: mockGetProfileByUserId
  }));

  (UserBtdBalancesModel as unknown as jest.Mock).mockImplementation(() => ({
    readBtdHoldingAmount: mockReadBtdHoldingAmount
  }));

  (OrganizationsModel as unknown as jest.Mock).mockImplementation(() => ({
    getById: mockGetById
  }));

  (OrganizationMembersModel as unknown as jest.Mock).mockImplementation(() => ({
    getMembership: mockGetMembership
  }));

  (BtdRegistryModel as unknown as jest.Mock).mockImplementation(() => ({
    getAssetPackRange: mockGetAssetPackRange,
    listOwnershipClaims: mockListOwnershipClaims,
    listReadLicenses: mockListReadLicenses
  }));
};

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authCache.clear();
    resetOrmMocks();
  });

  describe('authenticateMCPRequest', () => {
    it('declares the MCP interface integration record through the package-owned BTD contract', () => {
      expect(buildMcpInterfaceIntegrationRecord()).toMatchObject({
        surface: 'mcp',
        packageExport: '@bitcode/btd/interface-integration-contract',
        packageOwned: true,
        routeLocalReimplementation: false,
        sourceSafeLowDetailIntact: true,
        transactionCockpitRegression: false,
        objectFamilies: expect.arrayContaining(['source_to_shares_proof', 'organization_authority']),
      });
    });

    it('authenticates a valid API key and derives current Bitcode permissions', async () => {
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
      mockGetProfileByUserId.mockResolvedValue({
        wallet_binding: {
          address: 'wallet-operator',
          status: 'verified'
        }
      });
      mockReadBtdHoldingAmount.mockResolvedValue(120);

      const result = await authenticateMCPRequest('Bearer key_test123', {
        requireOrganization: true,
        requiredPermissions: {
          pipelines: ['create'],
          resources: ['read']
        }
      });

      expect(result.success).toBe(true);
      expect(result.context).toMatchObject({
        userId: 'user123',
        organizationId: 'org123',
        apiKeyId: 'key123',
        apiKeyName: 'Bitcode Test Key',
        organizationName: 'Bitcode Labs',
        organizationSlug: 'bitcode-labs',
        walletId: 'wallet-operator',
        btdBalance: 120
      });
      expect(result.context?.permissions.pipelines.create).toBe(true);
      expect(result.context?.permissions.organization.viewAnalytics).toBe(true);
      expect(mockGetByKeyHash).toHaveBeenCalledTimes(1);
      expect(mockUpdateLastUsed).toHaveBeenCalledWith('key123');
    });

    it('reuses cached auth context across repeated requests', async () => {
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
      mockGetProfileByUserId.mockResolvedValue(null);
      mockReadBtdHoldingAmount.mockResolvedValue(50);

      const first = await authenticateMCPRequest('Bearer key_test123', {
        requiredPermissions: { resources: ['read'] }
      });
      const second = await authenticateMCPRequest('Bearer key_test123', {
        requiredPermissions: { resources: ['read'] }
      });

      expect(first.success).toBe(true);
      expect(second.success).toBe(true);
      expect(mockGetByKeyHash).toHaveBeenCalledTimes(1);
      expect(mockUpdateLastUsed).toHaveBeenCalledTimes(1);
      expect(mockGetById).toHaveBeenCalledTimes(1);
    });

    it('fails closed when the authorization header does not contain a Bearer API key', async () => {
      const result = await authenticateMCPRequest('invalid_token');

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        code: 'MISSING_API_KEY',
        statusCode: 401
      });
    });

    it('fails closed on insufficient derived permissions', async () => {
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
      mockGetProfileByUserId.mockResolvedValue(null);
      mockReadBtdHoldingAmount.mockResolvedValue(50);

      const result = await authenticateMCPRequest('Bearer key_test123', {
        requiredPermissions: { pipelines: ['create'] }
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        code: 'INSUFFICIENT_PERMISSIONS',
        statusCode: 403
      });
      expect(result.error?.message).toContain('pipelines.create');
    });

    it('fails closed when an aggregate minimum BTD holding gate is requested', async () => {
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
      mockGetProfileByUserId.mockResolvedValue(null);
      mockReadBtdHoldingAmount.mockResolvedValue(10);

      const result = await authenticateMCPRequest('Bearer key_test123', {
        minimumBtdHolding: 100
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        code: 'REGISTRY_READ_ACCESS_REQUIRED',
        statusCode: 403
      });
    });

    it('admits MCP requests with registry-derived licensed-read access', async () => {
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
      mockGetProfileByUserId.mockResolvedValue({
        wallet_binding: {
          address: 'wallet-reader',
          status: 'verified'
        }
      });
      mockReadBtdHoldingAmount.mockResolvedValue(0);
      mockGetAssetPackRange.mockResolvedValue({
        asset_pack_id: 'asset-pack-1',
        range_start: 0,
        range_end_exclusive: 5,
        token_count: 5,
        access_policy_id: 'policy-1',
        access_policy_hash: 'policy-hash'
      });
      mockListOwnershipClaims.mockResolvedValue([]);
      mockListReadLicenses.mockResolvedValue([
        {
          license_id: 'license-1',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-1',
          access_policy_hash: 'policy-hash',
          valid_from: '2026-05-01T00:00:00.000Z'
        }
      ]);

      const result = await authenticateMCPRequest('Bearer key_test123', {
        requiredPermissions: { resources: ['read'] },
        requiredReadAccess: {
          assetPackId: 'asset-pack-1',
          at: '2026-05-19T00:00:00.000Z'
        }
      });

      expect(result.success).toBe(true);
      expect(result.context?.btdReadAccess).toEqual([
        expect.objectContaining({
          assetPackId: 'asset-pack-1',
          walletId: 'wallet-reader',
          decision: 'licensed_read',
          accessPolicyHash: 'policy-hash'
        })
      ]);
    });

    it('rejects MCP requests without owner-read or licensed-read registry access', async () => {
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
      mockGetProfileByUserId.mockResolvedValue({
        wallet_binding: {
          address: 'wallet-reader',
          status: 'verified'
        }
      });
      mockReadBtdHoldingAmount.mockResolvedValue(0);
      mockGetAssetPackRange.mockResolvedValue({
        asset_pack_id: 'asset-pack-1',
        range_start: 0,
        range_end_exclusive: 5,
        token_count: 5,
        access_policy_id: 'policy-1',
        access_policy_hash: 'policy-hash'
      });
      mockListOwnershipClaims.mockResolvedValue([]);
      mockListReadLicenses.mockResolvedValue([]);

      const result = await authenticateMCPRequest('Bearer key_test123', {
        requiredPermissions: { resources: ['read'] },
        requiredReadAccess: {
          assetPackId: 'asset-pack-1',
          at: '2026-05-19T00:00:00.000Z'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        code: 'INSUFFICIENT_BTD_READ_ACCESS',
        statusCode: 403
      });
    });

    it('admits MCP delivery only when organization authority and registry read access agree', async () => {
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
          resources: ['read'],
          asset_pack: ['deliver']
        }
      });
      mockGetProfileByUserId.mockResolvedValue({
        wallet_binding: {
          address: 'wallet-reader',
          status: 'verified'
        }
      });
      mockReadBtdHoldingAmount.mockResolvedValue(0);
      mockGetAssetPackRange.mockResolvedValue({
        asset_pack_id: 'asset-pack-1',
        range_start: 0,
        range_end_exclusive: 5,
        token_count: 5,
        access_policy_id: 'policy-1',
        access_policy_hash: 'policy-hash'
      });
      mockListOwnershipClaims.mockResolvedValue([]);
      mockListReadLicenses.mockResolvedValue([
        {
          license_id: 'license-1',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-1',
          access_policy_hash: 'policy-hash',
          valid_from: '2026-05-01T00:00:00.000Z'
        }
      ]);

      const result = await authenticateMCPRequest('Bearer key_test123', {
        requireOrganization: true,
        requiredPermissions: { resources: ['read'] },
        requiredReadAccess: {
          assetPackId: 'asset-pack-1',
          at: '2026-05-19T00:00:00.000Z'
        },
        requiredInterfaceAuthority: {
          action: 'deliver_asset_pack',
          settlementState: 'settled',
          confirmed: true,
          targetAnchor: 'github:engineeredsoftware/ENGI/pull/42',
          at: '2026-05-19T00:00:00.000Z'
        }
      });

      expect(result.success).toBe(true);
      expect(result.context?.interfaceAuthority).toEqual([
        expect.objectContaining({
          interfaceSurface: 'mcp',
          action: 'deliver_asset_pack',
          decision: 'allowed',
          sourceVisibility: 'protected_source_allowed'
        })
      ]);
    });

    it('rejects MCP delivery when interface authority is missing settlement and confirmation', async () => {
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
          resources: ['read'],
          asset_pack: ['deliver']
        }
      });
      mockGetProfileByUserId.mockResolvedValue({
        wallet_binding: {
          address: 'wallet-reader',
          status: 'verified'
        }
      });
      mockReadBtdHoldingAmount.mockResolvedValue(0);
      mockGetAssetPackRange.mockResolvedValue({
        asset_pack_id: 'asset-pack-1',
        range_start: 0,
        range_end_exclusive: 5,
        token_count: 5,
        access_policy_id: 'policy-1',
        access_policy_hash: 'policy-hash'
      });
      mockListOwnershipClaims.mockResolvedValue([]);
      mockListReadLicenses.mockResolvedValue([
        {
          license_id: 'license-1',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-1',
          access_policy_hash: 'policy-hash',
          valid_from: '2026-05-01T00:00:00.000Z'
        }
      ]);

      const result = await authenticateMCPRequest('Bearer key_test123', {
        requireOrganization: true,
        requiredPermissions: { resources: ['read'] },
        requiredReadAccess: {
          assetPackId: 'asset-pack-1',
          at: '2026-05-19T00:00:00.000Z'
        },
        requiredInterfaceAuthority: {
          action: 'deliver_asset_pack',
          settlementState: 'pending',
          confirmed: false,
          at: '2026-05-19T00:00:00.000Z'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        code: 'INSUFFICIENT_INTERFACE_AUTHORITY',
        statusCode: 403
      });
      expect(result.error?.message).toContain('settlement_required');
      expect(result.error?.message).toContain('explicit_confirmation_required');
    });
  });

  describe('validatePermissions', () => {
    it('validates the current structured permission shape', () => {
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
            manageBtdHoldings: false
          },
          resources: {
            read: true,
            export: false
          }
        }
      };

      expect(
        validatePermissions(context as any, {
          pipelines: ['read'],
          resources: ['read']
        })
      ).toBe(true);

      expect(
        validatePermissions(context as any, {
          pipelines: ['cancel']
        })
      ).toBe(false);
    });

    it('treats empty requirements as satisfied', () => {
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
            manageBtdHoldings: false
          },
          resources: {
            read: false,
            export: false
          }
        }
      };

      expect(validatePermissions(context as any, {})).toBe(true);
    });
  });
});
