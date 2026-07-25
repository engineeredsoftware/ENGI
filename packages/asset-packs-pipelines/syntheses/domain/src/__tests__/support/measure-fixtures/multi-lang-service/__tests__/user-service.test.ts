import { UserService } from '../src/services/user-service';

describe('UserService', () => {
  it('creates a user', async () => {
    const service = new UserService();
    const user = await service.create({
      email: 'a@example.com',
      name: 'Ada',
    });
    expect(user.id).toBeTruthy();
    expect(user.email).toBe('a@example.com');
  });
});
