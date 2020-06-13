import React from "react";
import { Button } from "@material-ui/core";
import fs from "fs";
// ../node_modules/@types/node/fs
export default class Home extends React.Component {
  state = {
    file: null,
  };

  fileChange = (e) => {
    this.setState({ file: e.target.files[0] });
  };

  storeData = () => {
    const { file } = this.state;
    const path = URL.createObjectURL(file);

    // var fs = require("fs"),
    //   es = require("event-stream");

    var lineNr = 0;

    var s = fs.createReadStream("very-large-file.csv");
    // .pipe(es.split())
    // .pipe(
    //   es
    //     .mapSync(function (line) {
    //       // pause the readstream
    //       s.pause();

    //       lineNr += 1;

    //       // process line here and call s.resume() when rdy
    //       // function below was for logging memory usage
    //       logMemoryUsage(lineNr);

    //       // resume the readstream, possibly from a callback
    //       s.resume();
    //     })
    //     .on("error", function (err) {
    //       console.log("Error while reading file.", err);
    //     })
    //     .on("end", function () {
    //       console.log("Read entire file.");
    //     })
    // );

    // if (!file) return;

    // var reader = new FileReader();
    // reader.onload = function (progressEvent) {
    //   // Entire file
    //   console.log(this.result);

    //   // By lines
    //   var lines = this.result.split("\n");
    //   for (var line = 0; line < lines.length; line++) {
    //     console.log(lines[line]);
    //   }
    // };
    // reader.readAsText(file);
  };

  render() {
    return (
      <div
        id="container"
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input onChange={this.fileChange} type="file" name="file" id="file" />
        <Button variant="outlined" id="submit-btn" onClick={this.storeData}>
          Submit
        </Button>
      </div>
    );
  }
}
