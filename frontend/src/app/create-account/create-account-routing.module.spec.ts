import { CreateAccountRoutingModule } from './create-account-routing.module';

describe('CreateAccountRoutingModule', () => {
  let createAccountRoutingModule: CreateAccountRoutingModule;

  beforeEach(() => {
    createAccountRoutingModule = new CreateAccountRoutingModule();
  });

  it('should create an instance', () => {
    expect(createAccountRoutingModule).toBeTruthy();
  });
});
