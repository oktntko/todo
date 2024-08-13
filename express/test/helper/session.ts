import { SessionService } from '~/middleware/session.js';

const mockFindUserBySession = vi.spyOn(SessionService, 'findUserBySession');
beforeAll(() => {
  mockFindUserBySession.mockImplementation(async () => {
    return {
      user_id: 1,
      email: '',
      password: '',
      username: '',
      description: '',
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
});

afterAll(() => {
  mockFindUserBySession.mockRestore();
});
