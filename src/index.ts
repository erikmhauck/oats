#!/usr/bin/env node
import * as yargs from "yargs";
import { dir2csv } from "./cli/dir2csv";
import { dirdiff } from "./cli/dirdiff";
import { BinaryToTextEncoding } from "crypto";

yargs
  .scriptName("oats")
  .usage("$0 <cmd> [args]")
  .command(
    "dir2csv <target>",
    "writes file paths of target directory to a csv",
    (yargs) => {
      yargs
        .positional("target", {
          type: "string",
          default: "./",
          describe:
            "the directory to get the files from, will default to current directory",
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
        })
        .option("hash", {
          type: "string",
          describe: "optional hash algorithm to use (eg: md5, sha256)",
        })
        .option("encoding", {
          type: "string",
          default: "hex",
          choices: ["base64", "hex"],
          describe: "encoding to use during hash",
        })
        .parse();
    },
    (argv) => {
      dir2csv(
        argv.target as string,
        argv.output as string,
        argv.stats as boolean,
        argv.hash as string,
        argv.encoding as BinaryToTextEncoding
      );
    }
  )
  .command(
    "dirdiff <target1> <target2>",
    "detects differences between 2 directories",
    (yargs) => {
      yargs
        .positional("target1", {
          type: "string",
          describe: "the first directory to get the files from",
        })
        .positional("target2", {
          type: "string",
          describe: "the second directory to get the files from",
        })
        .option("ignoreExtensions", {
          type: "boolean",
          default: false,
          describe: "ignore file extensions when doing comparisons",
        })
        .option("output", {
          type: "string",
          describe: "the path to write a csv to",
        })
        .demandOption(["target1", "target2"]);
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
