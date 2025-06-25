import { SessionService } from '~/middleware/session';

const mockFindUserBySession = vi.spyOn(SessionService, 'findUserBySession');
beforeAll(() => {
  mockFindUserBySession.mockImplementation(async () => {
    return {
      user_id: 1,
      email: '',
      password: '',
      username: '',
      description: '',
      twofa_enable: false,
      twofa_secret: '',
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
});

afterAll(() => {
  mockFindUserBySession.mockRestore();
});
