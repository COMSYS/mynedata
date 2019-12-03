import { PrivacyProtectionShortModule } from './privacyProtectionShort.module';

describe('PrivacyProtectionShortModule', () => {
  let createPrivacyProtectionShortModule: PrivacyProtectionShortModule;

  beforeEach(() => {
    createPrivacyProtectionShortModule = new PrivacyProtectionShortModule();
  });

  it('should create an instance', () => {
    expect(createPrivacyProtectionShortModule).toBeTruthy();
  });
});
