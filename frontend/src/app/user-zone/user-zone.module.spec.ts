import { UserZoneModule } from './user-zone.module';

describe('UserZoneModule', () => {
  let userZoneModule: UserZoneModule;

  beforeEach(() => {
    userZoneModule = new UserZoneModule();
  });

  it('should create an instance', () => {
    expect(userZoneModule).toBeTruthy();
  });
});
