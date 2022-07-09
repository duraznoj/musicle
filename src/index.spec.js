//import { Settings, DateTime } from "luxon";
//import DateTime from "luxon";
//import { Vex } from "vexflow;"
/*const { DateTime } = require("luxon");
const { Vex } = require("vexflow");

window.DateTime = luxon.DateTime; */



//const { convertPitch } = require("./index");
//const app = require("./app");
//import convertPitch from "./index.js";

import { func } from "./index.js"
describe(func, () => {
  test("say hello", () => {
    expect(func().toEqual(1));
  });
});

/*describe(convertPitch, () => {
  test("convert between midi and vexflow encoding", () => {
    expect(convertPitch(60)).toEqual('C');
  });
});*/

/*test("convert between midi and vexflow encoding", () => {
  expect(convertPitch(60)).toEqual('C');
});*/


