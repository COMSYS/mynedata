export interface PinQueryInfoApiResponseModel {
  proc_id: number;
  query_id: number;
  consent_start_time: number;
  consent_finish_time: number;
  state: 'aborted' | 'completed' | 'pending';
  consent: 'accepted' | 'refused' | 'pending';
  result: string;
}
