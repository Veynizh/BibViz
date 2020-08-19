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
  Slider,
} from "@material-ui/core";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
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
import { sum } from "d3";

const filterOptions = createFilterOptions({
  limit: 100,
});

const db_main_table = firebase
  .firestore()
  .collection("AuthorXContentXReserveXYears");
const db_keys_table = firebase.firestore().collection("AuthorName");
const db_overview_table = firebase.firestore().collection("Overview_year_field_base");

// const AUTHOR_FIELD = require("./data/author_field.json");

export default class Home extends React.Component {
  state = {
    search: "",
    mode: "Overview",
    result: [],
    history: [
      // "Author-Field - ThanasartThanasartThanasartThanasartThanasartThanasartThanasart",
      // "Keyword-ID, Title - Auto",
      // "Author-Author - KMITL",
    ],
    chartData: [],
    bookData: [],
    overviewOrigin: {},
    overviewData: [],
    searchOption: [],
    openModalAlert: false,
    txtModalAlert: "",
    filter: {},
    yearFilter: [1950, 2020],
    loading: false,
  };
  componentDidMount = () => {
    console.log(this.props.previousState);
    this.setState({ loading: true }, async () => {
      if (Object.keys(this.props.previousState).length === 0) {
        const [authorsName, overviewOrigin] = await Promise.all([
          this.getAuthors(),
          this.getOverview(),
        ]);
        // const authorsName = [];
        // const overviewData = await this.getOverview_t();
        console.log(overviewOrigin);
        this.setState(
          { searchOption: authorsName, overviewOrigin },
          this.setState({ loading: false })
        );
      } else {
        this.setState(
          this.props.previousState,
          this.setState({ loading: false })
        );
      }
    });
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
  getOverview = () =>
    new Promise((resolve, reject) => {
      db_overview_table.get().then(async (snapshot) => {
        const overview = {};
        console.log(snapshot.size);
        snapshot.forEach((doc) => {
          const book_id = doc.id;
          const books_data = doc.data();
          if (!Object.keys(overview).includes(book_id)) {
            overview[book_id] = {};
          }
          Object.assign(overview[book_id], books_data);
        });
        // const overview_1000 = {};
        // Object.keys(overview).forEach((book_id) => {
        //   if (Object.keys(overview_1000).length < 1000) {
        //     overview_1000[book_id] = overview[book_id];
        //   }
        // });
        await this.setDefualtOverview(overview);
        resolve(overview);
      });
    });
  setDefualtOverview = (overview) =>
    new Promise((resolve, reject) => {
      const fields_data = {};
      Object.values(overview).forEach((fields_data) => {
        Object.keys(fields_data).forEach((field) => {
          if (!Object.keys(fields_data).includes(field)) {
            fields_data[field] = {
              n_book: 0,
              rent: 0,
            };
          }
          fields_data[field]["n_book"] += Object.keys(fields_data[field]).length;
          fields_data[field]["rent"] += sum(Object.values(fields_data[field]).map(book_data=>book_data['rent']));
        });
      });
      const n_books = sum(Object.values(fields_data).map(field_data=>field_data['n_book']));
      const sum_rent = sum(Object.values(fields_data).map(field_data=>field_data['rent']));
      const ratio = sum_rent / n_books;
      const overviewData = Object.keys(fields_data).map((field) => [
        fields_data[field]["n_book"],
        fields_data[field]["rent"],
        ratio * fields_data[field]["n_book"],
      ]);
      overviewData.unshift(["n_book", "rent", "standard"]);
      this.setState({ overviewData }, resolve);
    });
  filterOverview = () => {
    const { filter, yearFilter } = this.state;
  };
  getOverview_t = () =>
    new Promise((resolve, reject) => {
      const overview = [
        ["x", "y", "y_temp"],
        [90, 4733.33, 3053],
        [12, 631.11, 487],
        [7, 368.15, 122],
        [37, 1945.93, 900],
        [1811, 95245.19, 28041],
        [45, 2366.67, 797],
        [40, 2103.7, 1412],
        [48, 2524.44, 791],
        [353, 18565.19, 6305],
        [116, 6100.74, 8143],
        [154, 8099.26, 8133],
        [99, 5206.67, 3569],
        [80, 4207.41, 1808],
        [132, 6942.22, 2338],
        [153, 8046.67, 2496],
        [356, 18722.96, 9437],
        [65, 3418.52, 1677],
        [156, 8204.44, 7443],
        [291, 15304.44, 4924],
        [147, 7731.11, 10212],
        [102, 5364.44, 2856],
        [172, 9045.93, 10892],
        [29, 1525.19, 1243],
        [57, 2997.78, 836],
        [23, 1209.63, 817],
        [242, 12727.41, 3425],
        [642, 33764.45, 7710],
        [15, 788.89, 79],
        [150, 7888.89, 3127],
        [112, 5890.37, 4564],
        [232, 12201.48, 4155],
        [1, 52.59, 0],
        [6, 315.56, 47],
        [477, 25086.67, 24797],
        [4, 210.37, 5],
        [3, 157.78, 14],
        [43, 2261.48, 1523],
        [702, 36920.0, 16900],
        [63, 3313.33, 1147],
        [25, 1314.81, 749],
        [4845, 254811.12, 357090],
        [2, 105.19, 6],
        [108, 5680.0, 5270],
        [27, 1420.0, 755],
        [19, 999.26, 157],
        [202, 10623.7, 4058],
        [72, 3786.67, 1013],
        [118, 6205.93, 2618],
        [59, 3102.96, 2029],
        [56, 2945.19, 864],
        [44, 2314.07, 1183],
        [9, 473.33, 450],
        [139, 7310.37, 2071],
        [1207, 63479.26, 22751],
        [574, 30188.15, 6080],
        [115, 6048.15, 2491],
        [193, 10150.37, 4658],
        [157, 8257.04, 13416],
        [419, 22036.3, 61825],
        [173, 9098.52, 11901],
        [21, 1104.44, 2297],
        [78, 4102.22, 8596],
        [76, 3997.04, 3499],
        [848, 44598.52, 16159],
        [414, 21773.33, 6741],
        [18, 946.67, 400],
        [58, 3050.37, 403],
        [684, 35973.33, 16749],
        [127, 6679.26, 8117],
        [46, 2419.26, 1755],
        [277, 14568.15, 6757],
        [892, 46912.59, 12897],
        [38, 1998.52, 2678],
        [79, 4154.81, 1749],
        [60, 3155.56, 1942],
        [416, 21878.52, 28224],
        [930, 48911.11, 22472],
        [5, 262.96, 32],
        [17, 894.07, 359],
        [73, 3839.26, 1985],
        [532, 27979.26, 15373],
        [208, 10939.26, 7729],
        [13, 683.7, 141],
        [717, 37708.89, 15358],
        [20, 1051.85, 333],
        [86, 4522.96, 2201],
        [51, 2682.22, 1252],
        [28, 1472.59, 688],
        [16, 841.48, 317],
        [42, 2208.89, 1288],
        [26, 1367.41, 1736],
        [32, 1682.96, 1310],
        [69, 3628.89, 3208],
        [213, 11202.22, 5751],
        [297, 15620.0, 15899],
        [24, 1262.22, 1610],
        [221, 11622.96, 7335],
        [30, 1577.78, 1128],
        [159, 8362.22, 6311],
        [31, 1630.37, 1534],
        [161, 8467.41, 14099],
        [247, 12990.37, 31885],
        [331, 17408.15, 9029],
        [68, 3576.3, 1424],
        [49, 2577.04, 1789],
        [211, 11097.04, 9511],
        [83, 4365.19, 4793],
        [143, 7520.74, 14242],
        [163, 8572.59, 5282],
        [398, 20931.85, 14912],
        [256, 13463.7, 12456],
        [602, 31660.74, 9029],
        [109, 5732.59, 3343],
        [293, 15409.63, 15753],
        [14, 736.3, 37],
        [410, 21562.96, 12279],
        [585, 30766.67, 25053],
        [1329, 69895.56, 58907],
        [175, 9203.7, 7606],
        [678, 35657.78, 18535],
        [455, 23929.63, 31678],
        [318, 16724.45, 28104],
        [272, 14305.19, 24517],
        [71, 3734.07, 2853],
        [1220, 64162.97, 73050],
        [66, 3471.11, 5484],
        [34, 1788.15, 3703],
        [81, 4260.0, 1393],
        [107, 5627.41, 1165],
        [11, 578.52, 99],
        [823, 43283.71, 63881],
        [105, 5522.22, 10112],
        [160, 8414.82, 5435],
        [426, 22404.45, 14195],
        [61, 3208.15, 608],
        [384, 20195.56, 6950],
        [111, 5837.78, 3592],
        [411, 21615.56, 3344],
        [367, 19301.48, 40783],
        [288, 15146.67, 9329],
        [165, 8677.78, 10390],
        [55, 2892.59, 889],
        [136, 7152.59, 2251],
        [36, 1893.33, 552],
        [114, 5995.56, 2629],
        [148, 7783.7, 11002],
        [181, 9519.26, 7501],
        [41, 2156.3, 936],
        [354, 18617.78, 14401],
        [276, 14515.56, 16195],
        [234, 12306.67, 20286],
        [194, 10202.96, 5247],
        [10, 525.93, 322],
        [82, 4312.59, 1455],
        [8, 420.74, 82],
        [39, 2051.11, 207],
        [98, 5154.07, 1010],
        [124, 6521.48, 2654],
        [343, 18039.26, 12428],
        [87, 4575.56, 3884],
        [253, 13305.93, 16410],
        [220, 11570.37, 14702],
        [130, 6837.04, 5179],
        [235, 12359.26, 16046],
        [95, 4996.3, 14263],
        [393, 20668.89, 30134],
        [614, 32291.85, 32203],
        [97, 5101.48, 1928],
        [244, 12832.59, 9274],
        [96, 5048.89, 3820],
        [50, 2629.63, 1159],
        [599, 31502.96, 34958],
        [53, 2787.41, 1009],
        [298, 15672.59, 8922],
        [134, 7047.41, 2647],
        [70, 3681.48, 2743],
        [110, 5785.19, 11753],
        [178, 9361.48, 4281],
        [306, 16093.33, 9116],
        [22, 1157.04, 754],
        [166, 8730.37, 4251],
        [145, 7625.93, 7333],
        [119, 6258.52, 6011],
        [103, 5417.04, 4973],
        [47, 2471.85, 2791],
        [152, 7994.07, 5442],
        [77, 4049.63, 1616],
        [275, 14462.96, 8638],
        [85, 4470.37, 1991],
        [92, 4838.52, 2198],
        [464, 24402.96, 33590],
        [363, 19091.11, 77337],
        [144, 7573.33, 11235],
        [167, 8782.96, 2227],
        [179, 9414.07, 2452],
        [168, 8835.56, 11712],
        [155, 8151.85, 5787],
        [171, 8993.33, 9828],
        [91, 4785.93, 4704],
        [117, 6153.33, 2272],
        [229, 12043.7, 4733],
        [230, 12096.3, 8872],
        [33, 1735.56, 1036],
        [94, 4943.7, 5268],
        [162, 8520.0, 13226],
        [126, 6626.67, 4376],
        [149, 7836.3, 19742],
        [196, 10308.15, 8401],
        [54, 2840.0, 5362],
        [158, 8309.63, 12692],
        [133, 6994.82, 4330],
        [680, 35762.96, 49615],
        [84, 4417.78, 2131],
        [100, 5259.26, 4695],
        [88, 4628.15, 2049],
        [314, 16514.07, 24229],
        [101, 5311.85, 3203],
        [223, 11728.15, 7259],
        [258, 13568.89, 11710],
        [209, 10991.85, 7751],
        [368, 19354.07, 18226],
        [269, 14147.41, 16615],
        [35, 1840.74, 507],
        [454, 23877.04, 27379],
        [75, 3944.44, 3002],
        [187, 9834.82, 6810],
        [1299, 68317.78, 20674],
        [106, 5574.82, 1166],
        [283, 14883.7, 14578],
        [74, 3891.85, 1801],
        [214, 11254.82, 6472],
        [267, 14042.22, 13859],
        [131, 6889.63, 11894],
        [67, 3523.7, 11713],
        [189, 9940.0, 5339],
        [206, 10834.07, 4856],
        [62, 3260.74, 2491],
        [321, 16882.22, 29126],
        [349, 18354.82, 34618],
        [195, 10255.56, 4682],
        [359, 18880.74, 19528],
        [93, 4891.11, 5766],
        [236, 12411.85, 6602],
        [217, 11412.59, 7749],
        [125, 6574.07, 7470],
        [227, 11938.52, 5689],
        [104, 5469.63, 3925],
        [128, 6731.85, 4972],
        [226, 11885.93, 8528],
        [64, 3365.93, 6455],
        [271, 14252.59, 66797],
        [135, 7100.0, 8821],
        [518, 27242.96, 20007],
        [233, 12254.07, 16732],
        [679, 35710.37, 43704],
        [335, 17618.52, 16256],
        [113, 5942.96, 4002],
        [386, 20300.74, 57656],
        [1114, 58588.15, 54786],
        [379, 19932.59, 27541],
        [89, 4680.74, 1736],
        [667, 35079.26, 73760],
        [146, 7678.52, 5105],
        [138, 7257.78, 2502],
        [122, 6416.3, 7839],
        [268, 14094.82, 9152],
        [608, 31976.3, 35734],
        [121, 6363.7, 11717],
        [52, 2734.81, 2072],
        [205, 10781.48, 8796],
        [192, 10097.78, 13240],
        [241, 12674.82, 18803],
        [495, 26033.33, 24324],
        [170, 8940.74, 16822],
        [188, 9887.41, 10630],
        [201, 10571.11, 27925],
        [141, 7415.56, 6184],
        [378, 19880.0, 32652],
        [307, 16145.93, 15918],
        [261, 13726.67, 13379],
        [280, 14725.93, 62301],
        [313, 16461.48, 41695],
        [182, 9571.85, 3334],
        [319, 16777.04, 53586],
        [231, 12148.89, 18076],
        [224, 11780.74, 39506],
        [303, 15935.56, 6705],
        [120, 6311.11, 909],
        [123, 6468.89, 23525],
        [246, 12937.78, 7349],
        [129, 6784.44, 1050],
        [249, 13095.56, 8295],
      ];
      resolve(overview);
    });
  onChangeTextOption = (event, value) => {
    this.setState({ search: value });
  };
  onChangeText = (event) => {
    const { value } = event.target;
    this.setState({ search: value });
  };
  onChangeTextFilter = (event, key) => {
    const { value } = event.target;
    const { filter } = this.state;
    filter[key] = value;
    this.setState({ filter });
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
      },
      callback
    );
  onClickHistory = (state) => {
    this.setState(state);
  };
  saveHistory = (search) => {
    const { mode, history } = this.state;
    history.push({
      key: [mode, search].join(" - "),
      state: { ...this.state, loading: false },
    });
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
  onFilter = () => {};
  onChangeYearFilter = (event, newValue) =>
    this.setState({ yearFilter: newValue });
  processAuthorField = async () => {
    const { search } = this.state;
    if (!this.state.searchOption.includes(search)) {
      this.setState({
        loading: false,
        openModalAlert: true,
        txtModalAlert: "Author Not Found.",
      });
      return;
    }

    console.log("in process author-field");

    const bookNames = await this.getFieldByAuthor(search);
    const chartData = [
      [
        { type: "string", id: "Field" },
        { type: "string", id: "dummy bar label" },
        { type: "string", role: "tooltip", p: { html: true } },
        { type: "date", id: "Start" },
        { type: "date", id: "End" },
      ],
    ];
    const bookData = [["header"]];
    // Object.keys(fields).forEach((field) => {
    //   Object.keys(fields[field]).forEach((yearKey) => {
    //     const { data, freq_genre, freq_reserve } = fields[field][yearKey];
    //     const [start, end] = yearKey.split("-");
    //     chartData.push([field, new Date(start, 0, 0), new Date(end, 0, 0)]);
    //     bookData.push(data);
    //   });
    // });

    Object.keys(bookNames).forEach((name) => {
      const { yearKey, fieldNames } = bookNames[name];
      const [start, end] = yearKey.split("-");
      console.log(yearKey, start, end);
      bookData.push(fieldNames);
      chartData.push([
        name,
        null,
        `<div id="treemap-tooltip"><b>fields:</b> - ${fieldNames.join(
          "<br/>&emsp;&emsp;&emsp;- "
        )}<br/><b>years:</b> ${start == end ? start : yearKey}</div>`,
        new Date(start, 0, 1),
        new Date(end, 0, 2),
      ]);
    });

    this.setState({ chartData, bookData }, () => this.saveHistory(search));
  };
  getYear = (candidate) => {
    const selected = [];
    candidate.forEach((item) => {
      if (item.length > 5) {
        // code block
      } else {
        let digit = item.replace(/[-]/g, "");
        switch (digit.length) {
          case 2:
            selected.push(parseInt(digit + "00"));
            selected.push(parseInt(digit + "99"));
            break;
          case 3:
            selected.push(parseInt(digit + "0"));
            selected.push(parseInt(digit + "9"));
            break;
          case 4:
            selected.push(parseInt(digit));
            break;
        }
      }
    });
    return selected;
  };
  getYearKey = (year) => {
    const delimiter = [",", " "];

    let splited = [year];
    delimiter.forEach((d) => {
      splited = [].concat.apply(
        [],
        splited.map((item) => item.split(d))
      );
    });

    console.log("split", splited);

    let candidate = [];
    const copyRightSet = [];
    splited.forEach((item) => {
      const temp_item = item
        .replace(/[_?]/g, "-")
        .replace(/[^\d-©]/g, "")
        .trim();
      if (temp_item != "") {
        if (temp_item.slice(0, 1) == "©") {
          copyRightSet.push(temp_item.slice(1));
        } else {
          candidate.push(temp_item);
        }
      }
    });

    console.log("split cc", candidate, copyRightSet);

    let selected = this.getYear(candidate);

    console.log("selected", selected);

    if (selected.length == 0) {
      selected = this.getYear(copyRightSet);
    }

    console.log("selected", selected);
    let min_year = Math.min(...selected).toString();
    let max_year = Math.max(...selected).toString();

    min_year =
      parseInt(min_year.substring(0, 2)) > 21
        ? (parseInt(min_year) - 543).toString()
        : min_year;
    max_year =
      parseInt(max_year.substring(0, 2)) > 21
        ? (parseInt(max_year) - 543).toString()
        : max_year;

    min_year = Math.min(parseInt(min_year), 2020).toString();
    max_year = Math.min(parseInt(max_year), 2020).toString();

    return [min_year, max_year].join("-");
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
              loading: false,
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
            const bookName =
              "marc" in data && "245" in data["marc"]
                ? data["marc"]["245"][0]
                : "-";

            if (!data["years"]) {
              return;
            }

            const fieldNames =
              "marc" in data && "650" in data["marc"]
                ? data["marc"]["650"] || []
                : [];
            // const bookName =
            //   "marc" in data && "245" in data["marc"]
            //     ? data["marc"]["245"][0]
            //     : "-";

            if (fieldNames.length == 0) {
              // this.setState({
              //   loading: false,
              //   openModalAlert: true,
              //   txtModalAlert: "Field Not Found.",
              // });
              return;
            }

            console.log("year", data["years"]);
            const yearKey = this.getYearKey(data["years"]);
            console.log("year", yearKey);

            const sumCount =
              doc.data()["checkout"] +
              doc.data()["renew"] +
              doc.data()["internal"];

            // fieldNames.forEach((fieldName) => {
            //   if (!Object.keys(result).includes(fieldName)) {
            //     result[fieldName] = {};
            //   }
            //   if (!Object.keys(result[fieldName]).includes(yearKey)) {
            //     result[fieldName][yearKey] = {
            //       data: [],
            //       freq_genre: 0,
            //       freq_reserve: 0,
            //     };
            //   }
            //   result[fieldName][yearKey]["data"].push(data);
            //   result[fieldName][yearKey]["freq_genre"] += 1;
            //   result[fieldName][yearKey]["freq_reserve"] += sumCount;
            // });
            result[bookName] = {
              yearKey,
              fieldNames,
            };
          });
          resolve(result);
        })
        .catch((err) => {
          this.setState({
            loading: false,
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
    const bookData = [["a header " + search]];
    Object.keys(field_author).forEach((field) => {
      const { n_book, books_id, freq_reserve, authors } = field_author[field];
      chartData.push([field, search + " header", n_book, freq_reserve]);
      bookData.push(["a field " + field]);
      Object.keys(authors).forEach((author) => {
        const { n_book, freq_reserve, data } = field_author[field]["authors"][
          author
        ];
        chartData.push([
          { v: author + field, f: author },
          field,
          n_book,
          freq_reserve,
        ]);
        bookData.push(data);
      });
    });

    this.setState({ chartData, bookData }, () => this.saveHistory(search));
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
              loading: false,
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
                  field_author[field]["authors"][author] = {
                    data: [],
                    n_book: 0,
                    freq_reserve: 0,
                  };
                }
                field_author[field]["authors"][author]["data"].push(data);
                field_author[field]["authors"][author]["n_book"] += 1;
                field_author[field]["authors"][author][
                  "freq_reserve"
                ] += sumCount;
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
    const bookData = [["a header " + search]];
    Object.keys(author_field).forEach((author) => {
      const { n_book, freq_reserve, fields } = author_field[author];
      chartData.push([author, search + " header", n_book, freq_reserve]);
      bookData.push(["a field " + author]);
      Object.keys(fields).forEach((field) => {
        const { n_book, freq_reserve, data } = author_field[author]["fields"][
          field
        ];
        chartData.push([
          { v: field + author, f: field },
          author,
          n_book,
          freq_reserve,
        ]);
        bookData.push(data);
      });
    });

    this.setState({ chartData, bookData }, () => this.saveHistory(search));
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
              loading: false,
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

          Promise.all(promisefields).then((snapshots) => {
            console.log(snapshots);
            if (snapshots.every((snapshot) => snapshot.empty)) {
              this.setState({
                loading: false,
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
              // const authorFields = dataByField["marc"]["650"];
              const authorFields = dataByField["marc"]["650"].filter((d) =>
                fields.includes(d)
              );
              if (authorFields.length == 0) {
                return;
              }
              const sumCount =
                dataByField["checkout"] +
                dataByField["renew"] +
                dataByField["internal"];
              authorNames.forEach((author) => {
                if (!(author in result)) {
                  result[author] = {
                    n_book: 0,
                    freq_reserve: 0,
                    fields: {},
                  };
                }
                result[author]["n_book"] += 1;
                result[author]["freq_reserve"] += sumCount;

                authorFields.forEach((field) => {
                  if (!(field in result[author]["fields"])) {
                    result[author]["fields"][field] = {
                      data: [],
                      n_book: 0,
                      freq_reserve: 0,
                    };
                  }
                  result[author]["fields"][field]["data"].push(dataByField);
                  result[author]["fields"][field]["n_book"] += 1;
                  result[author]["fields"][field]["freq_reserve"] += sumCount;
                  if (field == "เด็ก") {
                    console.log("dd", dataByField);
                  }
                });
              });
            });
            resolve(result);
          });
        })
        .catch((err) => {
          this.setState({
            loading: false,
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
        filterOptions={filterOptions}
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
        filterOptions={filterOptions}
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
    const { overviewData, mode, chartData, bookData } = this.state;
    console.log("data", chartData);
    console.log("overview", overviewData);
    return chartData.length == 0 && mode != "Overview" ? null : mode ==
      "Overview" ? (
      <Chart
        id="chart"
        height={"100vh"}
        chartType="ComboChart"
        loader={<div>Loading Chart</div>}
        data={overviewData}
        rootProps={{ "data-testid": "1" }}
        options={{
          seriesType: "scatter",
          series: {
            1: {
              type: "line",
            },
          },
          legend: "none",
          explorer: {
            axis: "horizontal",
            keepInBounds: false,
            maxZoomIn: 1000,
            zoomDelta: 0.9,
          },
        }}
      />
    ) : mode == "Author-Field" ? (
      // <Chart
      //   id="chart"
      //   // width={"600px"}
      //   height={"100vh"}
      //   chartType="ScatterChart"
      //   loader={<div>Loading Chart</div>}
      //   data={chartData}
      //   options={{
      //     title: chartTitle,
      //     hAxis: {
      //       title: chartTitleX,
      //       maxValue: Math.max(...chartData.slice(1).map((d) => d[0])) + 1,
      //     },
      //     vAxis: {
      //       title: chartTitleY,
      //       maxValue: Math.max(...chartData.slice(1).map((d) => d[1])) + 1,
      //       minValue: Math.min(...chartData.slice(1).map((d) => d[1])) - 1,
      //     },
      //     explorer: {
      //       axis: "horizontal",
      //       keepInBounds: false,
      //       maxZoomIn: 1000,
      //       zoomDelta: 0.9,
      //     },
      //     legend: "none",
      //   }}
      //   rootProps={{ "data-testid": "1" }}
      //   chartEvents={[
      //     {
      //       eventName: "select",
      //       callback: ({ chartWrapper }) => {
      //         const chart = chartWrapper.getChart();
      //         const selection = chart.getSelection();
      //         if (selection.length === 1) {
      //           const { search } = this.state;
      //           const [selectedItem] = selection;
      //           const dataTable = chartWrapper.getDataTable();
      //           const { setBookData, setPreviousState } = this.props;
      //           setBookData(bookData[selectedItem["row"]]);
      //           // setAuthor(search);
      //           // setField(chartData[selectedItem["row"] + 1][3]);
      //           // console.log(this.props.history);
      //           setPreviousState(this.state);
      //           this.props.history.push("/table");
      //         }
      //         console.log(selection);
      //       },
      //     },
      //   ]}
      // />
      <Chart
        id="chart"
        height={"100vh"}
        chartType="Timeline"
        loader={<div>Loading Chart</div>}
        data={chartData}
        rootProps={{ "data-testid": "1" }}
        options={{
          hAxis: {
            minValue: new Date(1900, 0, 1),
            maxValue: new Date(2021, 0, 1),
          },
        }}
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
          generateTooltip: (row) => {
            const target = chartData[row + 1];
            const n = target[2];
            const c = target[3];
            return typeof target[0] === "object"
              ? `<div id="treemap-tooltip"><b>author:</b> ${target[0]["f"]}<br/>number of book: ${n}<br/><b>freq of reserve:</b> ${c}</div>`
              : `<div id="treemap-tooltip"><b>field:</b> ${target[0]}<br/>number of book: ${n}<br/><b>freq of reserve:</b> ${c}</div>`;
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
                // const author = target[0]["f"];
                // const field = target[1];
                const { setBookData, setPreviousState } = this.props;
                setBookData(bookData[selectedItem["row"]]);
                // setAuthor(author);
                // setField(field);
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
          generateTooltip: (row) => {
            const target = chartData[row + 1];
            const n = target[2];
            const c = target[3];
            return typeof target[0] === "object"
              ? `<div id="treemap-tooltip"><b>field:</b> ${target[0]["f"]}<br/>number of book: ${n}<br/><b>freq of reserve:</b> ${c}</div>`
              : `<div id="treemap-tooltip"><b>author:</b> ${target[1]}<br/>number of book: ${n}<br/><b>freq of reserve:</b> ${c}</div>`;
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
                // const author = target[1];
                // const field = target[0]["f"];
                const { setBookData, setPreviousState } = this.props;
                setBookData(bookData[selectedItem["row"]]);
                // setAuthor(author);
                // setField(field);
                setPreviousState(this.state);
                this.props.history.push("/table");
              }
            },
          },
        ]}
      />
    );
  };
  renderFilter = (key) => {
    const { filter } = this.state;
    const key_min = key + "_min";
    const key_max = key + "_max";
    return (
      <div id="number-filter">
        <TextField
          id="txt-number-filter"
          value={filter[key_min]}
          onChange={(event) => this.onChangeTextFilter(event, key_min)}
          label={"min " + key}
        />
        <TextField
          id="txt-number-filter"
          value={filter[key_max]}
          onChange={(event) => this.onChangeTextFilter(event, key_max)}
          label={"max " + key}
        />
      </div>
    );
  };
  renderRight = () => {
    const { mode, result } = this.state;
    return mode == "Overview" ? (
      <div id="right">
        {this.renderFilter("n_book")}
        {this.renderFilter("rent")}
        {this.renderFilter("copy")}
        {this.renderFilter("renew")}
        <Button
          ref="submit"
          variant="outlined"
          id="submit-btn"
          // onClick={() =>
          //   this.getByKeyword("cc").then((r) => console.log("fini"))
          // }
          onClick={this.onFilter}
        >
          Filter
        </Button>
      </div>
    ) : (
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
    );
  };
  render() {
    const {
      mode,
      history,
      openModalAlert,
      txtModalAlert,
      yearFilter,
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
                  value="Overview"
                  control={<Radio />}
                  label="Overview"
                />
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
        <div id="center">
          {this.renderChart()}
          {mode === "Overview" && (
            <Slider
              id="year-filter"
              value={yearFilter}
              min={1500}
              step={1}
              max={2020}
              onChange={this.onChangeYearFilter}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              // getAriaValueText={valuetext}
            />
          )}
        </div>
        {this.renderRight()}
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
