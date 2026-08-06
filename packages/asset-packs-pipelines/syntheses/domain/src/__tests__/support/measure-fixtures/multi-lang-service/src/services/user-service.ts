import type { CreateUserInput } from '../handlers/users';
import type { User } from '../types';

/**
 * Domain service for user creation (fixture — in-memory only).
 */
export class UserService {
  private users: User[] = [];

  async create(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: `user_${this.users.length + 1}`,
      email: input.email,
      name: input.name,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  async list(): Promise<User[]> {
    return [...this.users];
  }
}
