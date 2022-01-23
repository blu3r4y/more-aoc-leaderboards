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

it("id", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1337: { ...defaultMemberProps, id: 1337 } },
  };

  expect(processData(data)[1337].id).toBe(1337);
});

it("name", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, name: "John Doe" } },
  };

  expect(processData(data)[1].name).toBe("John Doe");
});

it("name [name: null]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].name).toBe("#1");
});

it("active [last_star_ts: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: 0 } },
  };

  expect(processData(data)[1].active).toBe(false);
});

it("active [last_star_ts: 1]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: 1 } },
  };

  expect(processData(data)[1].active).toBe(true);
});

it("finished [stars: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].finished).toBe(false);
});

it("finished [stars: 50]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, stars: 50 } },
  };

  expect(processData(data)[1].finished).toBe(true);
});

it("totalStars", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, stars: 42 } },
  };

  expect(processData(data)[1].totalStars).toBe(42);
});

it("stars", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 201 } },
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

it("localScore", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, local_score: 1337 } },
  };

  expect(processData(data)[1].localScore).toBe(1337);
});

it("globalScore", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, global_score: 42 } },
  };

  expect(processData(data)[1].globalScore).toBe(42);
});

it("lastTimestamp", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: 21 } },
  };

  expect(processData(data)[1].lastTimestamp).toEqual(dayjs.unix(21));
});

it("lastTimestamp [last_star_ts: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].lastTimestamp).toBe(null);
});

it("lastTime [last_star_ts: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].lastTime).toBe(null);
});

it("lastTime [event: 2020]", () => {
  const timestamp = dayjs("2020-12-01T15:00:00.000Z");
  const duration = dayjs.duration(10, "hours");

  const data: IApiData = {
    ...defaultDataProps,
    event: 2020,
    members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: timestamp.unix() } },
  };

  expect(processData(data)[1].lastTime).toEqual(duration);
});

it("lastTime [event: 2021]", () => {
  const timestamp = dayjs("2021-12-01T15:00:00.000Z");
  const duration = dayjs.duration(10, "hours");

  const data: IApiData = {
    ...defaultDataProps,
    event: 2021,
    members: { 1: { ...defaultMemberProps, id: 1, last_star_ts: timestamp.unix() } },
  };

  expect(processData(data)[1].lastTime).toEqual(duration);
});

it("partaTimestamp", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 201 } },
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

it("partbTimestamp", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 201 } },
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

it("partaTimes [event: 2020]", () => {
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
          1: { 1: { get_star_ts: ts1a.unix() } },
          15: { 1: { get_star_ts: ts15a.unix() }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: ts20a.unix() }, 2: { get_star_ts: 201 } },
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

it("partbTimes [event: 2020]", () => {
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
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: ts15b.unix() } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: ts20b.unix() } },
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

it("partaCompleted", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 201 } },
        },
      },
    },
  };

  expect(processData(data)[1].partaCompleted).toBe(3);
});

it("partbCompleted", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 201 } },
        },
      },
    },
  };

  expect(processData(data)[1].partbCompleted).toBe(2);
});

it("deltaTimes", () => {
  const delta15 = dayjs.duration(1, "seconds");
  const delta20 = dayjs.duration(2, "seconds");

  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 202 } },
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

it("totalDelta [last_star_ts: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].totalDelta).toBe(null);
});

it("totalDelta", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        last_star_ts: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 202 } },
        },
      },
    },
  };

  expect(processData(data)[1].totalDelta).toEqual(dayjs.duration(3, "seconds"));
});

it("medianDelta [last_star_ts: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].medianDelta).toBe(null);
});

it("medianDelta [deltaTimes: 1, 2]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        last_star_ts: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 202 } },
        },
      },
    },
  };

  expect(processData(data)[1].medianDelta).toEqual(dayjs.duration(1.5, "seconds"));
});

it("medianDelta [deltaTimes: 1, 2, 3]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        last_star_ts: 1,
        completion_day_level: {
          1: { 1: { get_star_ts: 10 } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: 151 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 202 } },
          21: { 1: { get_star_ts: 210 }, 2: { get_star_ts: 213 } },
        },
      },
    },
  };

  expect(processData(data)[1].medianDelta).toEqual(dayjs.duration(2, "seconds"));
});

it("totalTime [last_star_ts: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].totalTime).toBe(null);
});

it("totalTime [event: 2020]", () => {
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
          1: { 1: { get_star_ts: ts1a.unix() } },
          15: { 1: { get_star_ts: 150 }, 2: { get_star_ts: ts15b.unix() } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: ts20b.unix() } },
        },
      },
    },
  };

  expect(processData(data)[1].totalTime).toEqual(time);
});

it("timePerStar [last_star_ts: 0]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: { 1: { ...defaultMemberProps, id: 1 } },
  };

  expect(processData(data)[1].timePerStar).toBe(null);
});

it("timePerStar", () => {
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
          1: { 1: { get_star_ts: ts1a.unix() } },
          15: { 1: { get_star_ts: ts15a.unix() }, 2: { get_star_ts: ts15b.unix() } },
          20: { 1: { get_star_ts: ts20a.unix() }, 2: { get_star_ts: ts20b.unix() } },
        },
      },
    },
  };

  expect(processData(data)[1].timePerStar).toEqual(average);
});

it("points", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
          20: { 1: { get_star_ts: 20 }, 2: { get_star_ts: 23 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
          20: { 1: { get_star_ts: 21 }, 2: { get_star_ts: 22 } },
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

it("points [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
      3: {
        ...defaultMemberProps,
        id: 3,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
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

it("partaPoints", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
          20: { 1: { get_star_ts: 20 }, 2: { get_star_ts: 23 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
          20: { 1: { get_star_ts: 21 }, 2: { get_star_ts: 22 } },
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

it("partaPoints [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
      3: {
        ...defaultMemberProps,
        id: 3,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
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

it("partbPoints", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
          20: { 1: { get_star_ts: 20 }, 2: { get_star_ts: 23 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
          20: { 1: { get_star_ts: 21 }, 2: { get_star_ts: 22 } },
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

it("partbPoints [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 1 }, 2: { get_star_ts: 10 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 2 }, 2: { get_star_ts: 10 } },
        },
      },
      3: {
        ...defaultMemberProps,
        id: 3,
        completion_day_level: {
          10: { 1: { get_star_ts: 3 }, 2: { get_star_ts: 11 } },
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

it("partaRanks", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
          20: { 1: { get_star_ts: 20 }, 2: { get_star_ts: 23 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
          20: { 1: { get_star_ts: 21 }, 2: { get_star_ts: 22 } },
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

it("partaRanks [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
      3: {
        ...defaultMemberProps,
        id: 3,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
        },
      },
    },
  };

  const result = processData(data);

  expect(result[1].partaRanks[10]).toBe(1);
  expect(result[2].partaRanks[10]).toBe(1);
  expect(result[3].partaRanks[10]).toBe(3);
});

it("partbRanks", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
          20: { 1: { get_star_ts: 20 }, 2: { get_star_ts: 23 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
          20: { 1: { get_star_ts: 21 }, 2: { get_star_ts: 22 } },
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

it("partbRanks [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 1 }, 2: { get_star_ts: 10 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 2 }, 2: { get_star_ts: 10 } },
        },
      },
      3: {
        ...defaultMemberProps,
        id: 3,
        completion_day_level: {
          10: { 1: { get_star_ts: 3 }, 2: { get_star_ts: 11 } },
        },
      },
    },
  };

  const result = processData(data);

  expect(result[1].partbRanks[10]).toBe(1);
  expect(result[2].partbRanks[10]).toBe(1);
  expect(result[3].partbRanks[10]).toBe(3);
});

it("deltaRanks", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 100 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 209 } },
          21: { 1: { get_star_ts: 210 }, 2: { get_star_ts: 212 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 101 } },
          20: { 1: { get_star_ts: 205 }, 2: { get_star_ts: 206 } },
          21: { 1: { get_star_ts: 210 }, 2: { get_star_ts: 219 } },
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

it("deltaRanks [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 210 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 220 }, 2: { get_star_ts: 230 } },
        },
      },
      3: {
        ...defaultMemberProps,
        id: 3,
        completion_day_level: {
          10: { 1: { get_star_ts: 240 }, 2: { get_star_ts: 300 } },
        },
      },
    },
  };

  const result = processData(data);

  expect(result[1].deltaRanks[10]).toBe(1);
  expect(result[2].deltaRanks[10]).toBe(1);
  expect(result[3].deltaRanks[10]).toBe(3);
});

it("partaFirst", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
          20: { 1: { get_star_ts: 20 }, 2: { get_star_ts: 23 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 } },
          20: { 1: { get_star_ts: 21 }, 2: { get_star_ts: 22 } },
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

it("partaFirst [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 } },
        },
      },
    },
  };

  const result = processData(data);
  expect(result[1].partaFirst).toBe(1);
  expect(result[2].partaFirst).toBe(1);
});

it("partbFirst", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 100 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 201 } },
          21: { 1: { get_star_ts: 210 }, 2: { get_star_ts: 219 } },
          22: { 1: { get_star_ts: 220 }, 2: { get_star_ts: 221 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 101 } },
          20: { 1: { get_star_ts: 201 }, 2: { get_star_ts: 202 } },
          21: { 1: { get_star_ts: 211 }, 2: { get_star_ts: 211 } },
          22: { 1: { get_star_ts: 221 }, 2: { get_star_ts: 229 } },
        },
      },
    },
  };

  const result = processData(data);
  expect(result[1].partbFirst).toBe(2);
  expect(result[2].partbFirst).toBe(1);
});

it("partbFirst [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 }, 2: { get_star_ts: 20 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 11 }, 2: { get_star_ts: 20 } },
        },
      },
    },
  };

  const result = processData(data);
  expect(result[1].partbFirst).toBe(1);
  expect(result[2].partbFirst).toBe(1);
});

it("dayFirst", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 100 } },
          20: { 1: { get_star_ts: 200 }, 2: { get_star_ts: 205 } },
          21: { 1: { get_star_ts: 211 }, 2: { get_star_ts: 215 } },
          22: { 1: { get_star_ts: 220 }, 2: { get_star_ts: 226 } },
          23: { 1: { get_star_ts: 231 }, 2: { get_star_ts: 236 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 101 } },
          20: { 1: { get_star_ts: 201 }, 2: { get_star_ts: 206 } },
          21: { 1: { get_star_ts: 210 }, 2: { get_star_ts: 216 } },
          22: { 1: { get_star_ts: 221 }, 2: { get_star_ts: 225 } },
          23: { 1: { get_star_ts: 230 }, 2: { get_star_ts: 235 } },
        },
      },
    },
  };

  const result = processData(data);
  expect(result[1].dayFirst).toBe(1);
  expect(result[2].dayFirst).toBe(1);
});

it("dayFirst [ex aequo]", () => {
  const data: IApiData = {
    ...defaultDataProps,
    members: {
      1: {
        ...defaultMemberProps,
        id: 1,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 }, 2: { get_star_ts: 20 } },
        },
      },
      2: {
        ...defaultMemberProps,
        id: 2,
        completion_day_level: {
          10: { 1: { get_star_ts: 10 }, 2: { get_star_ts: 20 } },
        },
      },
    },
  };

  const result = processData(data);
  expect(result[1].dayFirst).toBe(1);
  expect(result[2].dayFirst).toBe(1);
});
