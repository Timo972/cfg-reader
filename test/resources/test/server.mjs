import * as alt from "alt-server";
import { Config, Type } from "../../../index.mjs";

alt.log("Hello World");

const cfg = new Config('server.cfg');

alt.log(cfg.get('name'));

alt.log(cfg.getOfType('name', Type.String));

alt.log(cfg.set('name', Math.random()+''));

cfg.save();

alt.log(cfg.get('name'));

process.exit(0);