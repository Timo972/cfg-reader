import * as alt from "alt-server";
import { Config } from "../../../index.mjs";

alt.log("Hello World");

alt.log(new Config('server.cfg').get('name'));

process.exit(0);