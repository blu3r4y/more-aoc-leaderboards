/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from "fs";
import * as path from "path";

import { Schema } from "./ApiTypes";

describe("processData()", () => {
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  years.forEach((year) => {
    it(`validates ${year}`, () => {
      const file = path.resolve(__dirname, `../../data/e2e/${year}.json`);
      const json = JSON.parse(fs.readFileSync(file, "utf-8"));
      const { error } = Schema.validate(json);
      expect(error).toBeUndefined();
    });
  });
});
