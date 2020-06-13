import React from "react";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardHeader,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Box from "@material-ui/core/utils";
import readXlsxFile from "read-excel-file";
// import Papa from 'papaparse'
// import fs from 'fs'
// const fs = require('fs-extra');
// import { readFile, readFileSync } from 'fs';
// import d3 from 'react-d3-library';
import * as d3 from "d3";
import firebase from "./config/firebase";
import { Chart } from "react-google-charts";

const db = firebase.firestore();

export default class Home extends React.Component {
  state = {
    search: "",
    mode: "Author-Field",
    result: [],
    history: [
      // "Author-Field - ThanasartThanasartThanasartThanasartThanasartThanasartThanasart",
      // "Keyword-ID, Title - Auto",
      // "Author-Author - KMITL",
    ],
    chartData: [],
    chartTitle: "",
    chartTitleX: "",
    chartTitleY: "",
    searchOption: [],
  };
  componentDidMount() {
    const searchOption = [];
  }
  getAuthors = () => {
    const db_temp = db.collection("AuthorXContentXReserve")
  }
  onChangeText = (e) => {
    const search = e.target.value;
    this.setState({ search });
  };
  handleChangeMode = (event) => {
    this.setState({ mode: event.target.value });
  };
  onSubmit = async () => {
    const { search } = this.state;

    const fields = await this.getFieldByAuthor(search);
    const chartData = fields.map((obj) => [
      obj["freq_reserve"],
      obj["freq_genre"],
      "o",
      obj["fieldName"],
    ]);
    chartData.unshift([
      "",
      "",
      {
        role: "annotation",
        type: "string",
      },
      {
        role: "annotationText",
        type: "string",
      },
    ]);

    console.log(chartData);

    const chartTitle = search + " Fields";
    const chartTitleX = "Frequency Reserve";
    const chartTitleY = "Frequency Genre";

    this.setState({ chartData, chartTitle, chartTitleX, chartTitleY });
  };
  getFieldByAuthor = (author) =>
    new Promise((resolve, reject) => {
      const marc_tags = [
        "marc_tag.100",
        "marc_tag.110",
        "marc_tag.700",
        "marc_tag.710",
      ];

      const promises = marc_tags.map((marc_tag) =>
        db
          .collection("AuthorXContentXReserve")
          .where(marc_tag, "==", author) // array-contains
          .get()
      );

      Promise.all(promises)
        .then((snapshots) => {
          console.log(snapshots);
          if (snapshots.every((snapshot) => snapshot.empty)) {
            console.log("No matching documents.");
            return;
          }

          const result = {};
          const doc_objs = {};

          snapshots.forEach((snapshot) => {
            snapshot.forEach((doc) => {
              doc_objs[doc.id] = doc;
            });
          });

          Object.values(doc_objs).forEach((doc) => {
            // console.log(doc.id, "=>", doc.data());

            const fieldName = doc.data()["marc"]["650"];
            const bookName = doc.data()["marc_tag"]["245"];

            const sumCount =
              doc.data()["checkout"] +
              doc.data()["renew"] +
              doc.data()["internal"];

            if (!Object.keys(result).includes(fieldName)) {
              result[fieldName] = {
                detail: [],
                freq_genre: 0,
                freq_reserve: 0,
              };
            }

            result[fieldName]["detail"].push({
              bookName,
              freq: sumCount,
            });
            result[fieldName]["freq_genre"] += 1;
            result[fieldName]["freq_reserve"] += sumCount;
          });

          const resultWithTop = Object.keys(result).map((fieldName) => {
            const field = result[fieldName];
            return {
              book_top_three: field["detail"]
                .sort((a, b) => a.freq - b.freq)
                .slice(0, 3),
              freq_genre: field["freq_genre"],
              freq_reserve: field["freq_reserve"],
              fieldName,
            };
          });
          resolve(resultWithTop);
        })
        .catch((err) => {
          console.log("Error getting documents", err);
        }); // สำนักงานคณะกรรมการสิ่งแวดล้อมแห่งชาติ
    });
  render() {
    const {
      search,
      mode,
      result,
      history,
      chartData,
      chartTitle,
      chartTitleX,
      chartTitleY,
    } = this.state;
    return (
      <div id="container">
        <div id="left">
          <Card id="mode-contrainer">
            <CardHeader
              // title="Mode"
              subheader="Mode"
            />
            <CardContent id="delete-padding">
              <RadioGroup
                id="delete-padding"
                value={mode}
                onChange={this.handleChangeMode}
              >
                <FormControlLabel
                  value="Author-Field"
                  control={<Radio />}
                  label="Author-Field"
                />
                <FormControlLabel
                  value="Keyword-ID, Title"
                  control={<Radio />}
                  label="Keyword-ID, Title"
                />
                <FormControlLabel
                  value="Author-Author"
                  control={<Radio />}
                  label="Author-Author"
                />
              </RadioGroup>
            </CardContent>
          </Card>
          <Card id="history-contrainer">
            <CardHeader
              // title="Mode"
              subheader="History"
            />
            <CardContent>
              <List>
                {history.map((item, index) => {
                  const mode = item.split(" - ")[0];
                  const search = item.split(" - ")[1];
                  return (
                    <ListItem key={index} button>
                      <ListItemText style={{ color: "red" }} primary={item} />
                      {/* <ListItemText primary={search} /> */}
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </div>
        <div id="center">
          <Chart
            id="chart"
            // width={"600px"}
            height={"100vh"}
            chartType="ScatterChart"
            loader={<div>Loading Chart</div>}
            data={chartData}
            options={{
              title: chartTitle,
              hAxis: {
                title: chartTitleX,
                maxValue: Math.max(...chartData.slice(1).map((d) => d[0])) + 1,
              },
              vAxis: {
                title: chartTitleY,
                maxValue: Math.max(...chartData.slice(1).map((d) => d[1])) + 1,
                minValue: Math.min(...chartData.slice(1).map((d) => d[1])) - 1,
              },
              explorer: {
                axis: "horizontal",
                keepInBounds: false,
                maxZoomIn: 1000,
                zoomDelta: 0.9,
              },
              legend: "none",
            }}
            rootProps={{ "data-testid": "1" }}
            chartEvents={[
              {
                eventName: "select",
                callback: ({ chartWrapper }) => {
                  const chart = chartWrapper.getChart();
                  const selection = chart.getSelection();
                  if (selection.length === 1) {
                    const { search } = this.state
                    const [selectedItem] = selection;
                    const dataTable = chartWrapper.getDataTable();
                    const {setAuthor, setFeild} = this.props
                    setAuthor(search);
                    setFeild(chartData[selectedItem['row'] + 1][3]);
                    console.log(this.props.history);
                    this.props.history.push("/table");
                  }
                  console.log(selection);
                },
              },
            ]}
          />
        </div>
        <div id="right">
          <Autocomplete
            id="txt-search"
            debug
            value={search}
            options={["a", "b", "c"]}
            onInputChange={this.onChangeText}
            renderInput={(params) => <TextField {...params} label="Search" />}
          />
          {/* <TextField
            value={search}
            onChange={this.onChangeText}
            label="Search"
          /> */}
          <div id="search-table">
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>No.</TableCell>
                    <TableCell align="center">Title</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{index}</TableCell>
                      <TableCell align="left">{item}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <Button variant="outlined" id="submit-btn" onClick={this.onSubmit}>
            Submit
          </Button>
        </div>
      </div>
    );
  }
}

// import rd3 from 'react-d3-library';
// import node from './d3test';
// const RD3Component = rd3.Component;

// export default class my_First_React_D3_Library_Component extends React.Component {

//   constructor(props) {
//     super(props);
//     this.state = {d3: ''}
//   }

//   componentDidMount() {
//     this.setState({d3: node});
//   }

//   render() {
//     return (
//       <div>
//         <RD3Component data={this.state.d3} />
//       </div>
//     )
//   }
// };
