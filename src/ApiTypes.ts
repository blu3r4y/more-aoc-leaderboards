import * as Joi from "joi";

export declare interface Leaderboard {
  owner_id: number;
  event: number;
  members: {
    [id: number]: Member;
  };
}

export declare interface Member {
  id: number;
  name?: string;
  stars: number;
  local_score: number;
  global_score: number;
  last_star_ts: number;
  completion_day_level: Completion;
}

export declare interface Completion {
  [day: number]: {
    [part: number]: {
      get_star_ts: number;
    };
  };
}

// schema to validate any wild payload
export const schema = Joi.object({
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
          })
        )
      ),
    })
  ),
});
