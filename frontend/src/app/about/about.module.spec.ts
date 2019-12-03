import { AboutModule } from './about.module';

describe('AboutModule', () => {
  let createAboutModule: AboutModule;

  beforeEach(() => {
    createAboutModule = new AboutModule();
  });

  it('should create an instance', () => {
    expect(createAboutModule).toBeTruthy();
  });
});
