import { ProcessorZoneModule } from './processor-zone.module';

describe('ProcessorZoneModule', () => {
  let processorZoneModule: ProcessorZoneModule;

  beforeEach(() => {
    processorZoneModule = new ProcessorZoneModule();
  });

  it('should create an instance', () => {
    expect(processorZoneModule).toBeTruthy();
  });
});
