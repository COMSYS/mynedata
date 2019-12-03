import {DataTypes} from '../../config/data-types.config';
import {DATASOURCE_TIME_UNIT} from '../../app/core/services/upload-granularity.service';
import {RequestStateEnum, UserConsentStateEnum} from '../../config/requests.config';

export interface RequestApiResponseModel {
  query_id: number;
  proc_id: number;
  query_state: 'pending' | 'aborted' | 'completed';
  consent_state: 'accepted' | 'refused' | 'pending';
  price: number | string; // also string since some mocks from ComScience had strings describing a other-than-points reward
  interval_start_time: number;
  interval_finish_time: number;
  consent_start_time: number;
  consent_finish_time: number;
  amount: number;
  granularity: number;
  max_privacy: number;
  title: string;
  description: string;
  goal_description: string;
  used_data_types: string[];
  result: string;
  query: string;
  thumbnail_url?: string;
}
