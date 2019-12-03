import {DataTypes} from '../../config/data-types.config';
import {RequestStateEnum, UserConsentStateEnum} from '../../config/requests.config';

export interface RequestInternalRepresentationModel {
  processorId: number;
  requestId: number;
  title: string;
  targetedData: {
    datatype: DataTypes;
    detailed: string;
  }[];
  goalDescription: string;
  reward: number | string;
  description: string;
  requestState: RequestStateEnum;
  consentState: UserConsentStateEnum;
  intervalTime: {
    start: number;
    end: number;
  };
  consentTime: {
    start: number;
    end: number;
  };
  granularity: number;
  amount: number;
  maxPrivacy: number;
  thumbnailUrl?: string;
}

/*
interval time is the timespan from which the requested data points are to take
consent time is the timespan where a user can accept or decline a request, after consent time ended, the query should not be listed any more (except to the users that participated in them, to show them the results)
*/
