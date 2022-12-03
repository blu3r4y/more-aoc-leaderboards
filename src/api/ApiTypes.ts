/* eslint-disable @typescript-eslint/naming-convention */

import Joi from "joi";

export declare interface IApiData {
  owner_id: number;
  event: number;
  members: {
    [id: number]: IApiMember;
  };
}

export declare interface IApiMember {
  id: number;
  name: string | null;
  stars: number;
  local_score: number;
  global_score: number;
  last_star_ts: number;
  completion_day_level: IApiCompletion;
}

export declare interface IApiCompletion {
  [day: number]: {
    [part: number]: {
      get_star_ts: number;
      star_index: number;
    };
  };
}

// schema to validate any wild payload
export const Schema = Joi.object({
  owner_id: Joi.number().required(),
  event: Joi.number().required(),
  members: Joi.object().pattern(
    Joi.number(),
    Joi.object({
      id: Joi.number().required(),
      name: Joi.string().allow(null),
      stars: Joi.number().required(),
      local_score: Joi.number().required(),
      global_score: Joi.number().required(),
      last_star_ts: Joi.number().required(),
      completion_day_level: Joi.object().pattern(
        Joi.number().min(1).max(25),
        Joi.object().pattern(
          Joi.number().min(1).max(2),
          Joi.object({
            get_star_ts: Joi.number().required(),
            star_index: Joi.number().required(),
          })
        )
      ),
    })
  ),
});
