import { ProcessorZoneRoutingModule } from './processor-zone-routing.module';

describe('ProcessorZoneRoutingModule', () => {
  let processorZoneRoutingModule: ProcessorZoneRoutingModule;

  beforeEach(() => {
    processorZoneRoutingModule = new ProcessorZoneRoutingModule();
  });

  it('should create an instance', () => {
    expect(processorZoneRoutingModule).toBeTruthy();
  });
});
