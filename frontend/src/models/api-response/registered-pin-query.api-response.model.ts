export interface RegisteredPinQueryApiResponseModel {
  processor_id: number;
  query_id: number;
  error_code: number;
  response_data: {
    session_id: number;
    session_pin: number;
  };
}
