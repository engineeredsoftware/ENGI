/**
 * @jest-environment node
 */
import { supabaseAdmin } from '@bitcode/supabase';
import {
  BtdFungibleMutationRejectedError,
  calculateMeasuredBtdFromTokens,
  getBtdBalance,
  rejectFungibleBtdMutation,
} from '@bitcode/btd';

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}));

describe('BTD read posture', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('reads aggregate BTD holdings without mutating the storage carrier', async () => {
    const maybeSingleMock = jest.fn().mockResolvedValue({ data: { balance: 50 }, error: null });

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'user_credits') {
        return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: maybeSingleMock };
      }
      return {};
    });

    await expect(getBtdBalance(userId)).resolves.toBe(50);
    expect(maybeSingleMock).toHaveBeenCalled();
  });

  it('rejects attempts to mutate BTD as a fungible spend balance', () => {
    expect(() => rejectFungibleBtdMutation()).toThrow(BtdFungibleMutationRejectedError);
  });

  it('measures BTD content amount separately from fees', () => {
    expect(calculateMeasuredBtdFromTokens({ inputTokens: 1200, outputTokens: 50 })).toBe(2);
  });
});
