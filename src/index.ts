#!/usr/bin/env node
import * as yargs from "yargs";
import { dir2csv } from "./cli/dir2csv";
import { dirdiff } from "./cli/dirdiff";

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
        })
        .option("stats", {
          type: "boolean",
          default: false,
          describe:
            "include file stats in the output csv, may take much longer to generate csv",
        });
    },
    (argv) => {
      dir2csv(
        argv.target as string,
        argv.output as string,
        argv.stats as boolean
      );
    }
  )
  .command(
    "dirdiff",
    "detects differences between 2 directories",
    (yargs) => {
      yargs
        .positional("target1", {
          type: "string",
          demandOption: true,
          describe: "the first directory to get the files from",
        })
        .positional("target2", {
          type: "string",
          demandOption: true,
          describe: "the second directory to get the files from",
        })
        .option("ignoreExtensions", {
          type: "boolean",
          default: false,
          describe: "ignore file extensions when doing comparisons",
        })
        .option("output", {
          type: "string",
          describe: "the path to write the csv to",
        });
    },
    (argv) => {
      dirdiff(
        argv.target1 as string,
        argv.target2 as string,
        argv.ignoreExtensions as boolean,
        argv.output as string
      );
    }
  )
  .help()
  .demandCommand(1, "Please supply a command for oats to run").argv;
