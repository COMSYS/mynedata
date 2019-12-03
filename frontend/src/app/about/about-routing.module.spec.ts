import { AboutRoutingModule } from './about-routing.module';

describe('AboutRoutingModule', () => {
  let aboutRoutingModule: AboutRoutingModule;

  beforeEach(() => {
    aboutRoutingModule = new AboutRoutingModule();
  });

  it('should create an instance', () => {
    expect(AboutRoutingModule).toBeTruthy();
  });
});
