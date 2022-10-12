#!/usr/bin/env node
import * as yargs from "yargs";
import { dir2csv } from "./cli/dir2csv";

yargs
  .scriptName("oats")
  .usage("$0 <cmd> [args]")
  .command(
    "dir2csv",
    "writes full file paths of target directory to a csv",
    (yargs) => {
      yargs
        .option("target", {
          type: "string",
          default: "./",
          describe: "the directory to get the files from",
        })
        .option("output", {
          type: "string",
          default: "./dir2csv-output.csv",
          describe: "the path to write the csv to",
        });
    },
    function (argv) {
      dir2csv(argv.target as string, argv.output as string);
    }
  )
  .help()
  .demandCommand(1, "Please supply a command for oats to run").argv;
