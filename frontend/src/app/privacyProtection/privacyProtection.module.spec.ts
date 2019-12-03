import { PrivacyProtectionModule } from './privacyProtection.module';

describe('PrivacyProtectionModule', () => {
  let createPrivacyProtectionModule: PrivacyProtectionModule;

  beforeEach(() => {
    createPrivacyProtectionModule = new PrivacyProtectionModule();
  });

  it('should create an instance', () => {
    expect(createPrivacyProtectionModule).toBeTruthy();
  });
});
