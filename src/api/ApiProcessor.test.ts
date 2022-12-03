/* eslint-disable @typescript-eslint/naming-convention */

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { IApiData } from "./ApiTypes";
import { processData } from "./ApiProcessor";

dayjs.extend(duration);

const defaultDataProps = {
  owner_id: 0,
  event: 2021,
};

const defaultMemberProps = {
  id: 0,
  name: null,
  stars: 0,
  local_score: 0,
  global_score: 0,
  last_star_ts: 0,
  completion_day_level: {},
};

beforeAll(() => {
  jest.spyOn(console, "assert").mockImplementation();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("processMember()", () => {
  it("sets id", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1337: { ...defaultMemberProps, id: 1337 } },
    };

    expect(processData(data)[1337].id).toBe(1337);
  });

  it("sets name", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, name: "John Doe" } },
    };

    expect(processData(data)[1].name).toBe("John Doe");
  });

  it("sets name [name: null]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].name).toBe("#1");
  });

  it("sets active [last_star_ts: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: 0 } },
    };

    expect(processData(data)[1].active).toBe(false);
  });

  it("sets active [last_star_ts: 1]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: 1 } },
    };

    expect(processData(data)[1].active).toBe(true);
  });

  it("sets finished [stars: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].finished).toBe(false);
  });

  it("sets finished [stars: 50]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, stars: 50 } },
    };

    expect(processData(data)[1].finished).toBe(true);
  });

  it("sets totalStars", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, stars: 42 } },
    };

    expect(processData(data)[1].totalStars).toBe(42);
  });

  it("sets stars", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 201, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(Object.keys(result[1].stars).length).toBe(25);
    expect(result[1].stars[0]).toBe(undefined);
    expect(result[1].stars[1]).toBe(1);
    expect(result[1].stars[15]).toBe(2);
    expect(result[1].stars[20]).toBe(2);
  });

  it("sets localScore", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, local_score: 1337 } },
    };

    expect(processData(data)[1].localScore).toBe(1337);
  });

  it("sets globalScore", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, global_score: 42 } },
    };

    expect(processData(data)[1].globalScore).toBe(42);
  });

  it("sets lastTimestamp", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: 21 } },
    };

    expect(processData(data)[1].lastTimestamp).toEqual(dayjs.unix(21));
  });

  it("sets lastTimestamp [last_star_ts: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].lastTimestamp).toBe(null);
  });

  it("sets lastTime [last_star_ts: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].lastTime).toBe(null);
  });

  it("sets lastTime [event: 2020]", () => {
    const timestamp = dayjs("2020-12-01T15:00:00.000Z");
    const duration = dayjs.duration(10, "hours");

    const data: IApiData = {
      ...defaultDataProps,
      event: 2020,
      members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: timestamp.unix() } },
    };

    expect(processData(data)[1].lastTime).toEqual(duration);
  });

  it("sets lastTime [event: 2021]", () => {
    const timestamp = dayjs("2021-12-01T15:00:00.000Z");
    const duration = dayjs.duration(10, "hours");

    const data: IApiData = {
      ...defaultDataProps,
      event: 2021,
      members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: timestamp.unix() } },
    };

    expect(processData(data)[1].lastTime).toEqual(duration);
  });

  it("sets partaTimestamp", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 201, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(Object.keys(result[1].partaTimestamp).length).toBe(25);
    expect(result[1].partaTimestamp[0]).toBe(undefined);
    expect(result[1].partaTimestamp[1]).toEqual(dayjs.unix(10));
    expect(result[1].partaTimestamp[15]).toEqual(dayjs.unix(150));
    expect(result[1].partaTimestamp[20]).toEqual(dayjs.unix(200));
    expect(result[1].partaTimestamp[25]).toBe(null);
  });

  it("sets partbTimestamp", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 201, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(Object.keys(result[1].partbTimestamp).length).toBe(25);
    expect(result[1].partbTimestamp[0]).toBe(undefined);
    expect(result[1].partbTimestamp[1]).toBe(null);
    expect(result[1].partbTimestamp[15]).toEqual(dayjs.unix(151));
    expect(result[1].partbTimestamp[20]).toEqual(dayjs.unix(201));
    expect(result[1].partbTimestamp[25]).toBe(null);
  });

  it("sets partaTimes [event: 2020]", () => {
    const ts1a = dayjs("2020-12-01T10:00:00.000Z");
    const ts15a = dayjs("2020-12-15T15:00:00.000Z");
    const ts20a = dayjs("2020-12-21T05:00:00.000Z");
    const dur1a = dayjs.duration(5, "hours");
    const dur15a = dayjs.duration(10, "hours");
    const dur20a = dayjs.duration(1, "days");

    const data: IApiData = {
      ...defaultDataProps,
      event: 2020,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: ts1a.unix(), star_index: 0 } },
            15: {
              1: { get_star_ts: ts15a.unix(), star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: ts20a.unix(), star_index: 0 },
              2: { get_star_ts: 201, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(Object.keys(result[1].partaTimes).length).toBe(25);
    expect(result[1].partaTimes[0]).toBe(undefined);
    expect(result[1].partaTimes[1]).toEqual(dur1a);
    expect(result[1].partaTimes[15]).toEqual(dur15a);
    expect(result[1].partaTimes[20]).toEqual(dur20a);
    expect(result[1].partaTimes[25]).toBe(null);
  });

  it("sets partbTimes [event: 2020]", () => {
    const ts15b = dayjs("2020-12-15T20:00:00.000Z");
    const ts20b = dayjs("2020-12-22T05:00:00.000Z");
    const dur15b = dayjs.duration(15, "hours");
    const dur20b = dayjs.duration(2, "days");

    const data: IApiData = {
      ...defaultDataProps,
      event: 2020,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: ts15b.unix(), star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: ts20b.unix(), star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(Object.keys(result[1].partbTimes).length).toBe(25);
    expect(result[1].partbTimes[0]).toBe(undefined);
    expect(result[1].partbTimes[1]).toBe(null);
    expect(result[1].partbTimes[15]).toEqual(dur15b);
    expect(result[1].partbTimes[20]).toEqual(dur20b);
    expect(result[1].partbTimes[25]).toBe(null);
  });

  it("sets partaCompleted", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 201, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].partaCompleted).toBe(3);
  });

  it("sets partbCompleted", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 201, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].partbCompleted).toBe(2);
  });

  it("sets deltaTimes", () => {
    const delta15 = dayjs.duration(1, "seconds");
    const delta20 = dayjs.duration(2, "seconds");

    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 202, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(Object.keys(result[1].deltaTimes).length).toBe(25);
    expect(result[1].deltaTimes[0]).toBe(undefined);
    expect(result[1].deltaTimes[1]).toBe(null);
    expect(result[1].deltaTimes[15]).toEqual(delta15);
    expect(result[1].deltaTimes[20]).toEqual(delta20);
    expect(result[1].deltaTimes[25]).toEqual(null);
  });

  it("sets totalDelta [last_star_ts: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].totalDelta).toBe(null);
  });

  it("sets totalDelta", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          last_star_ts: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 202, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].totalDelta).toEqual(dayjs.duration(3, "seconds"));
  });

  it("sets medianDelta [last_star_ts: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].medianDelta).toBe(null);
  });

  it("sets medianDelta [deltaTimes: 1, 2]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          last_star_ts: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 202, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].medianDelta).toEqual(dayjs.duration(1.5, "seconds"));
  });

  it("sets medianDelta [deltaTimes: 1, 2, 3]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          last_star_ts: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: 10, star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: 151, star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 202, star_index: 0 },
            },
            21: {
              1: { get_star_ts: 210, star_index: 0 },
              2: { get_star_ts: 213, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].medianDelta).toEqual(dayjs.duration(2, "seconds"));
  });

  it("sets totalTime [last_star_ts: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].totalTime).toBe(null);
  });

  it("sets totalTime [event: 2020]", () => {
    const ts1a = dayjs("2020-12-01T06:00:00.000Z");
    const ts15b = dayjs("2020-12-15T20:00:00.000Z");
    const ts20b = dayjs("2020-12-20T06:00:00.000Z");
    const time = dayjs.duration(17, "hours");

    const data: IApiData = {
      ...defaultDataProps,
      event: 2020,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          last_star_ts: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: ts1a.unix(), star_index: 0 } },
            15: {
              1: { get_star_ts: 150, star_index: 0 },
              2: { get_star_ts: ts15b.unix(), star_index: 0 },
            },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: ts20b.unix(), star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].totalTime).toEqual(time);
  });

  it("sets timePerStar [last_star_ts: 0]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: { 1: { ...defaultMemberProps, id: 1 } },
    };

    expect(processData(data)[1].timePerStar).toBe(null);
  });

  it("sets timePerStar", () => {
    const ts1a = dayjs("2020-12-01T10:00:00.000Z");
    const ts15a = dayjs("2020-12-15T15:00:00.000Z");
    const ts15b = dayjs("2020-12-15T16:00:00.000Z");
    const ts20a = dayjs("2020-12-21T05:00:00.000Z");
    const ts20b = dayjs("2020-12-21T10:00:00.000Z");

    const average = dayjs.duration((5 + 11 + 29) / 5, "hours");

    const data: IApiData = {
      ...defaultDataProps,
      event: 2020,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          stars: 5,
          last_star_ts: 1,
          completion_day_level: {
            1: { 1: { get_star_ts: ts1a.unix(), star_index: 0 } },
            15: {
              1: { get_star_ts: ts15a.unix(), star_index: 0 },
              2: { get_star_ts: ts15b.unix(), star_index: 0 },
            },
            20: {
              1: { get_star_ts: ts20a.unix(), star_index: 0 },
              2: { get_star_ts: ts20b.unix(), star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].timePerStar).toEqual(average);
  });
});

describe("processAllMembers()", () => {
  it("sets points", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(Object.keys(result[1].points).length).toBe(25);
    expect(result[1].points[0]).toBe(undefined);
    expect(result[1].points[10]).toBe(2);
    expect(result[1].points[20]).toBe(3);
    expect(result[1].points[25]).toBe(0);

    expect(Object.keys(result[2].points).length).toBe(25);
    expect(result[2].points[0]).toBe(undefined);
    expect(result[2].points[10]).toBe(1);
    expect(result[2].points[20]).toBe(3);
    expect(result[2].points[25]).toBe(0);
  });

  it("sets points [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
          },
        },
      },
    };

    const result = processData(data);

    // AoC breaks timestamp ties via the user id
    // https://www.reddit.com/r/adventofcode/comments/7krz2u/comment/drgqics/
    expect(result[1].points[10]).toBe(3);
    expect(result[2].points[10]).toBe(2);
    expect(result[3].points[10]).toBe(1);
  });

  it("sets partaPoints", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(Object.keys(result[1].partaPoints).length).toBe(25);
    expect(result[1].partaPoints[0]).toBe(undefined);
    expect(result[1].partaPoints[10]).toBe(2);
    expect(result[1].partaPoints[20]).toBe(2);
    expect(result[1].partaPoints[25]).toBe(0);

    expect(Object.keys(result[2].partaPoints).length).toBe(25);
    expect(result[2].partaPoints[0]).toBe(undefined);
    expect(result[2].partaPoints[10]).toBe(1);
    expect(result[2].partaPoints[20]).toBe(1);
    expect(result[2].partaPoints[25]).toBe(0);
  });

  it("sets partaPoints [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
          },
        },
      },
    };

    const result = processData(data);

    // AoC breaks timestamp ties via the user id
    // https://www.reddit.com/r/adventofcode/comments/7krz2u/comment/drgqics/
    expect(result[1].partaPoints[10]).toBe(3);
    expect(result[2].partaPoints[10]).toBe(2);
    expect(result[3].partaPoints[10]).toBe(1);
  });

  it("sets partbPoints", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(Object.keys(result[1].partbPoints).length).toBe(25);
    expect(result[1].partbPoints[0]).toBe(undefined);
    expect(result[1].partbPoints[10]).toBe(0);
    expect(result[1].partbPoints[20]).toBe(1);
    expect(result[1].partbPoints[25]).toBe(0);

    expect(Object.keys(result[2].partbPoints).length).toBe(25);
    expect(result[2].partbPoints[0]).toBe(undefined);
    expect(result[2].partbPoints[10]).toBe(0);
    expect(result[2].partbPoints[20]).toBe(2);
    expect(result[2].partbPoints[25]).toBe(0);
  });

  it("sets partbPoints [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: {
              1: { get_star_ts: 1, star_index: 0 },
              2: { get_star_ts: 10, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: {
              1: { get_star_ts: 2, star_index: 0 },
              2: { get_star_ts: 10, star_index: 0 },
            },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: {
              1: { get_star_ts: 3, star_index: 0 },
              2: { get_star_ts: 11, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    // AoC breaks timestamp ties via the user id
    // https://www.reddit.com/r/adventofcode/comments/7krz2u/comment/drgqics/
    expect(result[1].partbPoints[10]).toBe(3);
    expect(result[2].partbPoints[10]).toBe(2);
    expect(result[3].partbPoints[10]).toBe(1);
  });

  it("sets partaRanks", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(Object.keys(result[1].partaRanks).length).toBe(25);
    expect(result[1].partaRanks[0]).toBe(undefined);
    expect(result[1].partaRanks[10]).toBe(1);
    expect(result[1].partaRanks[20]).toBe(1);
    expect(result[1].partaRanks[25]).toBe(null);

    expect(Object.keys(result[2].partaRanks).length).toBe(25);
    expect(result[2].partaRanks[0]).toBe(undefined);
    expect(result[2].partaRanks[10]).toBe(2);
    expect(result[2].partaRanks[20]).toBe(2);
    expect(result[2].partaRanks[25]).toBe(null);
  });

  it("sets partaRanks [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
          },
        },
      },
    };

    const result = processData(data);

    expect(result[1].partaRanks[10]).toBe(1);
    expect(result[2].partaRanks[10]).toBe(1);
    expect(result[3].partaRanks[10]).toBe(3);
  });

  it("sets partbRanks", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(Object.keys(result[1].partbRanks).length).toBe(25);
    expect(result[1].partbRanks[0]).toBe(undefined);
    expect(result[1].partbRanks[10]).toBe(null);
    expect(result[1].partbRanks[20]).toBe(2);
    expect(result[1].partbRanks[25]).toBe(null);

    expect(Object.keys(result[2].partbRanks).length).toBe(25);
    expect(result[2].partbRanks[0]).toBe(undefined);
    expect(result[2].partbRanks[10]).toBe(null);
    expect(result[2].partbRanks[20]).toBe(1);
    expect(result[2].partbRanks[25]).toBe(null);
  });

  it("sets partbRanks [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: {
              1: { get_star_ts: 1, star_index: 0 },
              2: { get_star_ts: 10, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: {
              1: { get_star_ts: 2, star_index: 0 },
              2: { get_star_ts: 10, star_index: 0 },
            },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: {
              1: { get_star_ts: 3, star_index: 0 },
              2: { get_star_ts: 11, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(result[1].partbRanks[10]).toBe(1);
    expect(result[2].partbRanks[10]).toBe(1);
    expect(result[3].partbRanks[10]).toBe(3);
  });

  it("sets deltaRanks", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 100, star_index: 0 } },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 209, star_index: 0 },
            },
            21: {
              1: { get_star_ts: 210, star_index: 0 },
              2: { get_star_ts: 212, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 101, star_index: 0 } },
            20: {
              1: { get_star_ts: 205, star_index: 0 },
              2: { get_star_ts: 206, star_index: 0 },
            },
            21: {
              1: { get_star_ts: 210, star_index: 0 },
              2: { get_star_ts: 219, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(Object.keys(result[1].deltaRanks).length).toBe(25);
    expect(result[1].deltaRanks[0]).toBe(undefined);
    expect(result[1].deltaRanks[10]).toBe(null);
    expect(result[1].deltaRanks[20]).toBe(2);
    expect(result[1].deltaRanks[21]).toBe(1);
    expect(result[1].deltaRanks[25]).toBe(null);

    expect(Object.keys(result[2].deltaRanks).length).toBe(25);
    expect(result[2].deltaRanks[0]).toBe(undefined);
    expect(result[2].deltaRanks[10]).toBe(null);
    expect(result[2].deltaRanks[20]).toBe(1);
    expect(result[2].deltaRanks[21]).toBe(2);
    expect(result[2].deltaRanks[25]).toBe(null);
  });

  it("sets deltaRanks [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 210, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: {
              1: { get_star_ts: 220, star_index: 0 },
              2: { get_star_ts: 230, star_index: 0 },
            },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: {
              1: { get_star_ts: 240, star_index: 0 },
              2: { get_star_ts: 300, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);

    expect(result[1].deltaRanks[10]).toBe(1);
    expect(result[2].deltaRanks[10]).toBe(1);
    expect(result[3].deltaRanks[10]).toBe(3);
  });

  it("sets partaMinRankCount [up to 3]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 101, star_index: 0 } },
            11: { 1: { get_star_ts: 102, star_index: 0 } },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 103, star_index: 0 } },
            11: { 1: { get_star_ts: 104, star_index: 0 } },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: { 1: { get_star_ts: 105, star_index: 0 } },
            11: { 1: { get_star_ts: 106, star_index: 0 } },
          },
        },
      },
    };

    expect(processData(data)[1].partaMinRankCount[1]).toBe(2);
    expect(processData(data)[1].partaMinRankCount[2]).toBe(2);
    expect(processData(data)[1].partaMinRankCount[3]).toBe(2);

    expect(processData(data)[2].partaMinRankCount[1]).toBe(0);
    expect(processData(data)[2].partaMinRankCount[2]).toBe(2);
    expect(processData(data)[2].partaMinRankCount[3]).toBe(2);

    expect(processData(data)[3].partaMinRankCount[1]).toBe(0);
    expect(processData(data)[3].partaMinRankCount[2]).toBe(0);
    expect(processData(data)[3].partaMinRankCount[3]).toBe(2);
  });

  it("sets partbMinRankCount [up to 3]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: {
              1: { get_star_ts: 10, star_index: 0 },
              2: { get_star_ts: 100, star_index: 0 },
            },
            11: {
              1: { get_star_ts: 11, star_index: 0 },
              2: { get_star_ts: 101, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: {
              1: { get_star_ts: 10, star_index: 0 },
              2: { get_star_ts: 102, star_index: 0 },
            },
            11: {
              1: { get_star_ts: 11, star_index: 0 },
              2: { get_star_ts: 103, star_index: 0 },
            },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
          completion_day_level: {
            10: {
              1: { get_star_ts: 10, star_index: 0 },
              2: { get_star_ts: 104, star_index: 0 },
            },
            11: {
              1: { get_star_ts: 11, star_index: 0 },
              2: { get_star_ts: 105, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].partbMinRankCount[1]).toBe(2);
    expect(processData(data)[1].partbMinRankCount[2]).toBe(2);
    expect(processData(data)[1].partbMinRankCount[3]).toBe(2);

    expect(processData(data)[2].partbMinRankCount[1]).toBe(0);
    expect(processData(data)[2].partbMinRankCount[2]).toBe(2);
    expect(processData(data)[2].partbMinRankCount[3]).toBe(2);

    expect(processData(data)[3].partbMinRankCount[1]).toBe(0);
    expect(processData(data)[3].partbMinRankCount[2]).toBe(0);
    expect(processData(data)[3].partbMinRankCount[3]).toBe(2);
  });

  it("sets partaScore", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].partaScore).toBe(4);
    expect(processData(data)[2].partaScore).toBe(2);
  });

  it("sets partbScore", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
      },
    };

    expect(processData(data)[1].partbScore).toBe(1);
    expect(processData(data)[2].partbScore).toBe(2);
  });

  it("sets partaFirst", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
            20: {
              1: { get_star_ts: 20, star_index: 0 },
              2: { get_star_ts: 23, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 11, star_index: 0 } },
            20: {
              1: { get_star_ts: 21, star_index: 0 },
              2: { get_star_ts: 22, star_index: 0 },
            },
          },
        },
        3: {
          ...defaultMemberProps,
          id: 3,
        },
      },
    };

    const result = processData(data);
    expect(result[1].partaFirst).toBe(2);
    expect(result[2].partaFirst).toBe(0);
    expect(result[2].partaFirst).toBe(0);
  });

  it("sets partaFirst [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 10, star_index: 0 } },
          },
        },
      },
    };

    const result = processData(data);
    expect(result[1].partaFirst).toBe(1);
    expect(result[2].partaFirst).toBe(1);
  });

  it("sets partbFirst", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 100, star_index: 0 } },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 201, star_index: 0 },
            },
            21: {
              1: { get_star_ts: 210, star_index: 0 },
              2: { get_star_ts: 219, star_index: 0 },
            },
            22: {
              1: { get_star_ts: 220, star_index: 0 },
              2: { get_star_ts: 221, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 101, star_index: 0 } },
            20: {
              1: { get_star_ts: 201, star_index: 0 },
              2: { get_star_ts: 202, star_index: 0 },
            },
            21: {
              1: { get_star_ts: 211, star_index: 0 },
              2: { get_star_ts: 211, star_index: 0 },
            },
            22: {
              1: { get_star_ts: 221, star_index: 0 },
              2: { get_star_ts: 229, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(result[1].partbFirst).toBe(2);
    expect(result[2].partbFirst).toBe(1);
  });

  it("sets partbFirst [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: {
              1: { get_star_ts: 10, star_index: 0 },
              2: { get_star_ts: 20, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: {
              1: { get_star_ts: 11, star_index: 0 },
              2: { get_star_ts: 20, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(result[1].partbFirst).toBe(1);
    expect(result[2].partbFirst).toBe(1);
  });

  it("sets dayFirst", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: { 1: { get_star_ts: 100, star_index: 0 } },
            20: {
              1: { get_star_ts: 200, star_index: 0 },
              2: { get_star_ts: 205, star_index: 0 },
            },
            21: {
              1: { get_star_ts: 211, star_index: 0 },
              2: { get_star_ts: 215, star_index: 0 },
            },
            22: {
              1: { get_star_ts: 220, star_index: 0 },
              2: { get_star_ts: 226, star_index: 0 },
            },
            23: {
              1: { get_star_ts: 231, star_index: 0 },
              2: { get_star_ts: 236, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: { 1: { get_star_ts: 101, star_index: 0 } },
            20: {
              1: { get_star_ts: 201, star_index: 0 },
              2: { get_star_ts: 206, star_index: 0 },
            },
            21: {
              1: { get_star_ts: 210, star_index: 0 },
              2: { get_star_ts: 216, star_index: 0 },
            },
            22: {
              1: { get_star_ts: 221, star_index: 0 },
              2: { get_star_ts: 225, star_index: 0 },
            },
            23: {
              1: { get_star_ts: 230, star_index: 0 },
              2: { get_star_ts: 235, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(result[1].dayFirst).toBe(1);
    expect(result[2].dayFirst).toBe(1);
  });

  it("sets dayFirst [ex aequo]", () => {
    const data: IApiData = {
      ...defaultDataProps,
      members: {
        1: {
          ...defaultMemberProps,
          id: 1,
          completion_day_level: {
            10: {
              1: { get_star_ts: 10, star_index: 0 },
              2: { get_star_ts: 20, star_index: 0 },
            },
          },
        },
        2: {
          ...defaultMemberProps,
          id: 2,
          completion_day_level: {
            10: {
              1: { get_star_ts: 10, star_index: 0 },
              2: { get_star_ts: 20, star_index: 0 },
            },
          },
        },
      },
    };

    const result = processData(data);
    expect(result[1].dayFirst).toBe(1);
    expect(result[2].dayFirst).toBe(1);
  });
});
