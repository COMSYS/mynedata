import { CreateAccountModule } from './create-account.module';

describe('CreateAccountModule', () => {
  let createAccountModule: CreateAccountModule;

  beforeEach(() => {
    createAccountModule = new CreateAccountModule();
  });

  it('should create an instance', () => {
    expect(createAccountModule).toBeTruthy();
  });
});
