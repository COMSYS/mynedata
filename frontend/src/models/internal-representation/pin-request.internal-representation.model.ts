export interface PinRequestInternalRepresentationModel {
  queryId: Number;
  sessionId: Number;
  query: String;
  consentTime: {
    start: Number;
    end: Number;
  };
}
