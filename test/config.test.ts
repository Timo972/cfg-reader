import { strict as assert } from "assert";
import { Config, parse, serialize } from "../src";
import { Dict } from "../src/parser";

const filePath = "test.cfg";
const fileContent = `
test: true
`;
const config: Dict = {
  test: true,
};

interface MySQLConfig {
  host: string;
  username: string;
  password: string;
  database: string;
}

describe("Config API", () => {
  it("Config::load", async (done) => {
    const config = await Config.load(filePath);
    done();
  });

  it("Config::parse", () => {
    const config = Config.parse(fileContent);
  });

  it("Config::get", () => {
    const config = Config.parse(fileContent);
    const x = config.get<Dict>("mysql");
    config.get<string>("");
  });

  it("serialize", () => {
    const content = serialize(config, true, true);
  });

  it("parse", () => {
    const config = parse(fileContent);
  });
});
