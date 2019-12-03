export interface RegisterQueryApiRequestModel {
  query: string;
  price: number|string;
  interval_start_time: number;
  interval_finish_time: number;
  consent_start_time: number;
  consent_finish_time: number;
  amount: number;
  granularity: number;
  max_privacy: number;
  thumbnail_url?: string;
  title: string;
  description: string;
  goal_description?: string;
}
