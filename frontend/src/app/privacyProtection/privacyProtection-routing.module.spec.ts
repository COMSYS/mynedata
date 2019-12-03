import { PrivacyProtectionRoutingModule } from './privacyProtection-routing.module';

describe('PrivacyProtectionRoutingModule', () => {
  let privacyProtectionRoutingModule: PrivacyProtectionRoutingModule;

  beforeEach(() => {
    privacyProtectionRoutingModule = new PrivacyProtectionRoutingModule();
  });

  it('should create an instance', () => {
    expect(PrivacyProtectionRoutingModule).toBeTruthy();
  });
});
