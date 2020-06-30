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
import { RemoteChunkSize } from "papaparse";
import ModalAlert from "./ModalAlert";
import ModalLoading from "./ModalLoading";

const db_main_table = firebase
  .firestore()
  .collection("AuthorXContentXReserveXYears");
const db_keys_table = firebase.firestore().collection("AuthorName");

// const AUTHOR_FIELD = require("./data/author_field.json");

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
    openModalAlert: false,
    txtModalAlert: "",
    loading: false,
  };
  componentDidMount = async () => {
    console.log(this.props.previousState);
    if (Object.keys(this.props.previousState).length === 0) {
      const authorsName = await this.getAuthors();
      this.setState({ searchOption: authorsName });
    } else {
      this.setState(this.props.previousState);
    }
  };
  closeModalAlert = () =>
    this.setState({ openModalAlert: false }, () => console.log("aaa"));
  getAuthors = () =>
    new Promise((resolve, reject) => {
      db_keys_table.get().then((snapshot) => {
        // console.log(snapshot);
        // console.log(snapshot.empty);
        let authorsName = [];
        snapshot.forEach((doc) => {
          authorsName = authorsName.concat(...Object.values(doc.data()));
        });
        resolve(authorsName);
      });
    });
  onChangeTextOption = (event, value) => {
    this.setState({ search: value });
  };
  onChangeText = (event) => {
    const { value } = event.target;
    this.setState({ search: value });
  };
  onKeyPressText = (event) => {
    if (event.key === "Enter") {
      this.refs.submit.click();
    }
  };
  handleChangeMode = (event) => {
    const { value } = event.target;
    this.resetChart(() => {
      this.setState({ mode: value });
    });
    // this.props.setGG({'a': 'b'})
  };
  // componentWillMount = () => {
  //   // this.props.history.location.state
  //   console.log(this.props.gg)
  //   // console.log(this.props)
  //   console.log(this.location)
  //   console.log(window.history)
  // }
  resetChart = (callback = () => {}) =>
    this.setState(
      {
        search: "",
        chartData: [],
        chartTitle: "",
        chartTitleX: "",
        chartTitleY: "",
      },
      callback
    );
  onClickHistory = (state) => {
    this.setState({ loading: true }, () =>
      this.setState(state, () => this.setState({ loading: false }))
    );
  };
  saveHistory = (search) => {
    const { mode, history } = this.state;
    history.push({ key: [mode, search].join(" - "), state: this.state });
    this.setState({ history, loading: false });
  };
  onSubmit = () => {
    this.setState({ loading: true }, () => {
      const { mode } = this.state;
      if (mode == "Author-Field") {
        this.processAuthorField();
      } else if (mode == "Keyword-ID, Title") {
        this.processKeyword();
      } else {
        this.processAuthorAuthor();
      }
    });
  };
  processAuthorField = async () => {
    const { search } = this.state;
    if (!this.state.searchOption.includes(search)) {
      this.setState({
        openModalAlert: true,
        txtModalAlert: "Author Not Found.",
      });
      return;
    }

    console.log("in process author-field");

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

    console.log("finish cal chart data");

    console.log(chartData);

    const chartTitle = search + " Fields";
    const chartTitleX = "Frequency Reserve";
    const chartTitleY = "Frequency Genre";

    this.setState({ chartData, chartTitle, chartTitleX, chartTitleY }, () =>
      this.saveHistory(search)
    );
  };
  getFieldByAuthor = (author) =>
    new Promise((resolve, reject) => {
      console.log("det f", author);
      const marc_tags = [
        "marc_tag.100",
        "marc_tag.110",
        "marc_tag.700",
        "marc_tag.710",
      ];

      const promises = marc_tags.map((marc_tag) =>
        db_main_table
          .where(marc_tag, "array-contains", author) // ==
          .get()
      );

      Promise.all(promises)
        .then((snapshots) => {
          console.log(snapshots);
          if (snapshots.every((snapshot) => snapshot.empty)) {
            this.setState({
              openModalAlert: true,
              txtModalAlert: "Author Not Found.",
            });
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

            const data = doc.data();

            const fieldNames =
              "marc" in data && "650" in data["marc"]
                ? data["marc"]["650"] || []
                : [];
            const bookName =
              "marc" in data && "245" in data["marc"]
                ? data["marc"]["245"][0]
                : "-";

            const sumCount =
              doc.data()["checkout"] +
              doc.data()["renew"] +
              doc.data()["internal"];

            fieldNames.forEach((fieldName) => {
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
          this.setState({
            openModalAlert: true,
            txtModalAlert: "Have some worng, please try again.",
          });
          console.log("Error getting documents", err);
        }); // สำนักงานคณะกรรมการสิ่งแวดล้อมแห่งชาติ
    });
  processKeyword = async () => {
    const { search } = this.state;
    // const search = "frequency"; // telephone

    const field_author = await this.getByKeyword(search);
    const chartData = [
      ["Author", "Parent", "number of book", "frequency of reserve"],
      [{ v: search + " header", f: search }, null, 0, 0],
    ];
    Object.keys(field_author).forEach((field) => {
      const { n_book, freq_reserve, authors } = field_author[field];
      chartData.push([field, search + " header", n_book, freq_reserve]);
      Object.keys(authors).forEach((author) => {
        const { n_book, freq_reserve } = field_author[field]['authors'][author];
        chartData.push([
          { v: author + field, f: author },
          field,
          n_book,
          freq_reserve,
        ]);
      });
    });

    console.log(chartData);

    this.setState({ chartData }, () => this.saveHistory(search));
  };
  getByKeyword = (keyword) =>
    new Promise((resolve, reject) => {
      const queryText = keyword;
      console.log("start");
      db_main_table
        .where("keywords", "array-contains", queryText)
        .get()
        .then((snapshot) => {
          console.log(snapshot);
          if (snapshot.empty) {
            this.setState({
              openModalAlert: true,
              txtModalAlert: "Keyword Not Found.",
            });
            console.log("No matching documents.");
            return;
          }

          const doc_objs = {};
          snapshot.docs.forEach((doc) => {
            doc_objs[doc.id] = doc;
          });

          const field_author = {};
          Object.values(doc_objs).forEach((doc) => {
            const data = doc.data();
            console.log(data);
            if (!("marc" in data && "650" in data["marc"])) {
              return;
            }
            const sumCount =
              data["checkout"] + data["renew"] + data["internal"];
            const fields = [].concat(...Object.values(data["marc"]["650"]));
            const authors = [].concat(...Object.values(data["marc_tag"]));
            fields.forEach((field) => {
              if (!(field in field_author)) {
                field_author[field] = {
                  n_book: 0,
                  freq_reserve: 0,
                  authors: {},
                };
              }
              field_author[field]["n_book"] += 1;
              field_author[field]["freq_reserve"] += sumCount;
              authors.forEach((author) => {
                if (!(author in field_author[field])) {
                  field_author[field]['authors'][author] = {
                    n_book: 0,
                    freq_reserve: 0,
                  };
                }
                field_author[field]['authors'][author]["n_book"] += 1;
                field_author[field]['authors'][author]["freq_reserve"] += sumCount;
              });
            });
            resolve(field_author);
          });
        });
    });

  processAuthorAuthor = async () => {
    const { search } = this.state;
    // const search = "frequency"; // telephone

    const author_field = await this.getAuthorByAuthor(search);
    const chartData = [
      ["Field", "Parent", "number of book", "frequency of reserve"],
      [{ v: search + " header", f: search }, null, 0, 0],
    ];
    Object.keys(author_field).forEach((author) => {
      chartData.push([author, search + " header", 0, 0]);
      Object.keys(author_field[author]).forEach((field) => {
        const { n_book, freq_reserve } = author_field[author][field];
        chartData.push([
          { v: field + author, f: field },
          author,
          n_book,
          freq_reserve,
        ]);
      });
    });

    console.log(chartData);

    this.setState({ chartData }, () => this.saveHistory(search));
  };

  getAuthorByAuthor = (author) =>
    new Promise((resolve, reject) => {
      const marc_tags = [
        "marc_tag.100",
        "marc_tag.110",
        "marc_tag.700",
        "marc_tag.710",
      ];

      const promises = marc_tags.map((marc_tag) =>
        db_main_table
          .where(marc_tag, "array-contains", author) // ==
          .get()
      );

      Promise.all(promises)
        .then((snapshots) => {
          if (snapshots.every((snapshot) => snapshot.empty)) {
            this.setState({
              openModalAlert: true,
              txtModalAlert: "Author Not Found.",
            });
            console.log("No matching documents with author.");
            return;
          }

          const fields = [];
          const doc_objs = {};

          snapshots.forEach((snapshot) => {
            snapshot.forEach((doc) => {
              const data = doc.data();
              const fieldNames =
                "marc" in data && "650" in data["marc"]
                  ? data["marc"]["650"] || []
                  : [];

              fieldNames.forEach((fieldName) => {
                if (!fields.includes(fieldName)) {
                  fields.push(fieldName);
                }
              });
            });
          });

          // Object.values(doc_objs).forEach((doc) => {
          //   const data = doc.data();
          //   const fieldNames =
          //     "marc" in data && "650" in data["marc"]
          //       ? data["marc"]["650"] || []
          //       : [];

          //   fieldNames.forEach((fieldName) => {
          //     if (!fields.includes(fieldName)) {
          //       fields.push(fieldName);
          //     }
          //   });
          // });

          const promisefields = [];
          let c = 0;
          let subfields = [];
          fields.forEach((field) => {
            c += 1;
            subfields.push(field);
            if (c % 10 == 0) {
              promisefields.push(
                db_main_table
                  .where("marc.650", "array-contains-any", subfields)
                  .get()
              );
              subfields = [];
            }
          });
          if (subfields.length !== 0) {
            promisefields.push(
              db_main_table
                .where("marc.650", "array-contains-any", subfields)
                .get()
            );
          }

          console.log(fields);
          console.log(promisefields);

          console.log(author, "has field", promisefields.length);

          Promise.all(promisefields).then((snapshots) => {
            console.log(snapshots);
            if (snapshots.every((snapshot) => snapshot.empty)) {
              this.setState({
                openModalAlert: true,
                txtModalAlert: "Field Not Found.",
              });
              console.log("No matching documents.");
              return;
            }

            const doc_objs = {};

            snapshots.forEach((snapshot) => {
              snapshot.forEach((doc) => {
                doc_objs[doc.id] = doc;
              });
            });
            const result = {};
            Object.values(doc_objs).forEach((docByField) => {
              const dataByField = docByField.data();
              const authorNames = [];
              if (!("marc_tag" in dataByField && "marc" in dataByField)) {
                return;
              }
              Object.values(dataByField["marc_tag"]).forEach((authors) => {
                authors.forEach((authorName) => {
                  authorNames.push(authorName);
                });
              });
              const authorFields = dataByField["marc"]["650"];
              const sumCount =
                dataByField["checkout"] +
                dataByField["renew"] +
                dataByField["internal"];
              authorNames.forEach((author) => {
                if (!(author in result)) {
                  result[author] = {};
                }
                authorFields.forEach((field) => {
                  if (!(field in result[author])) {
                    result[author][field] = {
                      n_book: 0,
                      freq_reserve: 0,
                    };
                  }
                  result[author][field]["n_book"] += 1;
                  result[author][field]["freq_reserve"] += sumCount;
                });
              });
              console.log(result);
              resolve(result);
            });
          });
        })
        .catch((err) => {
          this.setState({
            openModalAlert: true,
            txtModalAlert: "Have some worng, please try again.",
          });
          console.log("Error getting documents", err);
        }); // สำนักงานคณะกรรมการสิ่งแวดล้อมแห่งชาติ
    });
  testDataTree = () => {
    // var test = [
    //   [
    //     "Location",
    //     "Parent",
    //     "Market trade volume (size)",
    //     "Market increase/decrease (color)",
    //   ],
    //   ["ABN", null, 0, 0],
    // ];

    // for (var i = 1; i <= 50; i++) {
    //   const p = i <= 30 ? "ABN" : i - 30;
    //   const f = i == 31 ? 1 : i == 32 ? 500 : 1;
    //   const c = i % 10;
    //   test.push([i.toString(), p.toString(), f, c]);
    // }
    // console.log(test);
    const test = [
      ["Person", "Fruit", "Size", "Color"],
      ["Global", null, 0, 0],
      ["Bananas", "Global", 0, 0],
      [{ v: "Rick0", f: "Rick" }, "Bananas", 100, 0],
      [{ v: "Anne0", f: "Anne" }, "Bananas", 40, 0],
      [{ v: "Peter0", f: "Peter" }, "Bananas", 5, 0],
      ["Apples", "Global", 0, 0],
      [{ v: "Anne1", f: "Anne" }, "Apples", 20, 2],
      [{ v: "Peter1", f: "Peter" }, "Apples", 20, 2],
      [{ v: "Rick1", f: "Rick" }, "Apples", 15, 2],
      ["Oranges", "Global", 0, 0],
      [{ v: "Rick2", f: "Rick" }, "Oranges", 20, 1],
      [{ v: "Peter2", f: "Peter" }, "Oranges", 20, 1],
      [{ v: "Anne2", f: "Anne" }, "Oranges", 10, 1],
      ["Susanne", "Global", 10, null],
    ];
    return test;
  };
  renderSearchBar = () => {
    const { search, searchOption, mode } = this.state;
    return mode == "Author-Field" ? (
      <Autocomplete
        id="txt-search"
        debug
        value={search}
        options={searchOption}
        onChange={this.onChangeTextOption}
        onKeyPress={this.onKeyPressText}
        renderInput={(params) => <TextField {...params} label="Search" />}
      />
    ) : mode == "Keyword-ID, Title" ? (
      <TextField
        id="txt-search"
        value={search}
        onChange={this.onChangeText}
        onKeyPress={this.onKeyPressText}
        label="Search"
      />
    ) : (
      // Author-Author
      <Autocomplete
        id="txt-search"
        debug
        value={search}
        options={searchOption}
        onChange={this.onChangeTextOption}
        onKeyPress={this.onKeyPressText}
        renderInput={(params) => <TextField {...params} label="Search" />}
      />
      // <TextField
      //   id="txt-search"
      //   value={search}
      //   onChange={this.onChangeText}
      //   label="Search"
      // />
    );
  };
  renderChart = () => {
    const {
      mode,
      chartData,
      chartTitle,
      chartTitleX,
      chartTitleY,
    } = this.state;
    return chartData.length == 0 ? null : mode == "Author-Field" ? (
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
                const { search } = this.state;
                const [selectedItem] = selection;
                const dataTable = chartWrapper.getDataTable();
                const { setAuthor, setField, setPreviousState } = this.props;
                setAuthor(search);
                setField(chartData[selectedItem["row"] + 1][3]);
                // console.log(this.props.history);
                setPreviousState(this.state);
                this.props.history.push("/table");
              }
              console.log(selection);
            },
          },
        ]}
      />
    ) : mode == "Keyword-ID, Title" ? (
      <Chart
        key="Keyword-ID, Title"
        // id="chart"
        // width={"500px"}
        // height={"300px"}
        height={"100vh"}
        chartType="TreeMap"
        loader={<div>Loading Chart</div>}
        data={chartData}
        // data={this.testDataTree()}
        options={{
          minColor: "#f00",
          midColor: "#ddd",
          maxColor: "#0d0",
          headerHeight: 15,
          fontColor: "black",
          showScale: true,
          generateTooltip: (row, size, value) => {
            const target = chartData[row + 1];
            const c = target[3];
            return typeof target[0] === "object"
              ? `<div id="treemap-tooltip">author: ${target[0]["f"]}<br/>number of book: ${size}<br/>freq of reserve:${c}</div>`
              : `<div id="treemap-tooltip">field: ${target[0]}<br/>number of book: ${size}<br/>freq of reserve:${c}</div>`;
          },
        }}
        rootProps={{ "data-testid": "1" }}
        chartEvents={[
          {
            eventName: "select",
            callback: ({ chartWrapper }) => {
              const chart = chartWrapper.getChart();
              const selection = chart.getSelection();
              const [selectedItem] = selection;
              const target = chartData[selectedItem["row"] + 1];
              if (typeof target[0] === "object" && selectedItem["row"] != 0) {
                const author = target[0]["f"];
                const field = target[1];
                const { setAuthor, setField, setPreviousState } = this.props;
                setAuthor(author);
                setField(field);
                setPreviousState(this.state);
                this.props.history.push("/table");
              }
            },
          },
        ]}
      />
    ) : (
      // Author-Author
      <Chart
        key="Author-Author"
        // id="chart"
        // width={"500px"}
        // height={"300px"}
        height={"100vh"}
        chartType="TreeMap"
        loader={<div>Loading Chart</div>}
        data={chartData}
        // data={this.testDataTree()}
        options={{
          minColor: "#f00",
          midColor: "#ddd",
          maxColor: "#0d0",
          headerHeight: 15,
          fontColor: "black",
          showScale: true,
        }}
        rootProps={{ "data-testid": "1" }}
        chartEvents={[
          {
            eventName: "select",
            callback: ({ chartWrapper }) => {
              const chart = chartWrapper.getChart();
              const selection = chart.getSelection();
              const [selectedItem] = selection;
              const target = chartData[selectedItem["row"] + 1];
              if (typeof target[0] === "object" && selectedItem["row"] != 0) {
                const author = target[1];
                const field = target[0]["f"];
                const { setAuthor, setField, setPreviousState } = this.props;
                setAuthor(author);
                setField(field);
                setPreviousState(this.state);
                this.props.history.push("/table");
              }
            },
          },
        ]}
      />
    );
  };
  render() {
    const {
      mode,
      result,
      history,
      openModalAlert,
      txtModalAlert,
      loading,
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
                  const { key, state } = item;
                  return (
                    <ListItem key={index} button>
                      <ListItemText
                        onClick={() => this.onClickHistory(state)}
                        style={{ color: "red" }}
                        primary={key}
                      />
                      {/* <ListItemText primary={search} /> */}
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </div>
        <div id="center">{this.renderChart()}</div>
        <div id="right">
          {this.renderSearchBar()}
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
          <Button
            ref="submit"
            variant="outlined"
            id="submit-btn"
            // onClick={() =>
            //   this.getByKeyword("cc").then((r) => console.log("fini"))
            // }
            onClick={this.onSubmit}
          >
            Submit
          </Button>
        </div>
        <ModalAlert
          closeModal={this.closeModalAlert}
          open={openModalAlert}
          text={txtModalAlert}
        />
        <ModalLoading loading={loading} />
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
