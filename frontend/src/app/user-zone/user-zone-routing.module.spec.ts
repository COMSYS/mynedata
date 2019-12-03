import { UserZoneRoutingModule } from './user-zone-routing.module';

describe('UserZoneRoutingModule', () => {
  let userZoneRoutingModule: UserZoneRoutingModule;

  beforeEach(() => {
    userZoneRoutingModule = new UserZoneRoutingModule();
  });

  it('should create an instance', () => {
    expect(userZoneRoutingModule).toBeTruthy();
  });
});
