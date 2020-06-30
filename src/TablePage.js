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
} from "@material-ui/core";
import firebase from "./config/firebase";

const db_main_table = firebase
  .firestore()
  .collection("AuthorXContentXReserveXYears");

export default class TablePage extends React.Component {
  state = {
    table: [],
  };
  componentDidMount = async () => {
    const { author, feild } = this.props;
    console.log("AUTHOR:", author, "||", "FEILD:", feild);
    const table = await this.getBookByAuthorAndFeild(author, feild);
    // const table = [
    //   {
    //     bookName: "a",
    //     sumCount: "b",
    //     MainPersonal: "c",
    //     MainCorp: "",
    //     AddedPersonal: ["a", "b"],
    //     AddedCorp: "",
    //     Year: "384290",
    //   },
    // ];
    // console.log("table", table);
    this.setState({ table });
  };
  handleArrayToString = (arr) => arr.join("<br/>");
  getBookByAuthorAndFeild = (author, feild) =>
    new Promise((resolve, reject) => {
      const marc_tags = ["100", "110", "700", "710"];

      const dbWithFeild = db_main_table.where(
        "marc.650",
        "array-contains",
        feild
      );

      dbWithFeild.get().then((snapshot) => {
        console.log(snapshot);
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }

        const result = [];
        // s.forEach((ss) => console.log(ss.data()));
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // console.log(data);
          if (
            marc_tags.some(
              (marc_tag) =>
                "marc_tag" in data &&
                marc_tag in data["marc_tag"] &&
                data["marc_tag"][marc_tag].includes(author)
            )
          ) {
            console.log(data);

            const bookName =
              "marc" in data && "245" in data["marc"]
                ? data["marc"]["245"][0]
                : "-";
            const MainPersonal = data["marc_tag"]["100"];
            const MainCorp = data["marc_tag"]["110"];
            const AddedPersonal = data["marc_tag"]["700"];
            const AddedCorp = data["marc_tag"]["710"];
            const Year = data["years"];

            const sumCount =
              data["checkout"] + data["renew"] + data["internal"];

            result.push({
              bookName,
              sumCount,
              MainPersonal,
              MainCorp,
              AddedPersonal,
              AddedCorp,
              Year,
            });
          }
          result.sort((a, b) => b["sumCount"] - a["sumCount"]);

          resolve(result);
        });
      });

      // const promises = marc_tags.map((marc_tag) =>
      //   dbWithFeild.where(marc_tag, "array-contains", author).get()
      // );

      // Promise.all(promises)
      //   .then((snapshots) => {
      //     console.log(snapshots.map((snapshot) => snapshot.empty));
      //     if (snapshots.every((snapshot) => snapshot.empty)) {
      //       console.log("No matching documents.");
      //       return;
      //     }

      //     const result = [];
      //     const doc_objs = {};

      //     snapshots.forEach((snapshot) => {
      //       snapshot.forEach((doc) => {
      //         doc_objs[doc.id] = doc;
      //       });
      //     });

      //     Object.values(doc_objs).forEach((doc) => {
      //       const bookName = doc.data()["marc_tag"]["245"];
      //       const MainPersonal = doc.data()["marc_tag"]["100"];
      //       const MainCorp = doc.data()["marc_tag"]["110"];
      //       const AddedPersonal = doc.data()["marc_tag"]["700"];
      //       const AddedCorp = doc.data()["marc_tag"]["710"];

      //       const sumCount =
      //         doc.data()["checkout"] +
      //         doc.data()["renew"] +
      //         doc.data()["internal"];

      //       result.push({
      //         bookName,
      //         sumCount,
      //         MainPersonal,
      //         MainCorp,
      //         AddedPersonal,
      //         AddedCorp,
      //       });
      //     });

      // })
      // .catch((err) => {
      //   console.log("Error getting documents", err);
      // });
    });
  defaultWithBlank = (input) =>
    input
      ? Array.isArray(input)
        ? [].concat(...input.map((txt) => ["- " + txt, <br />]))
        : input
      : "-";
  render() {
    const { table } = this.state;
    return (
      <div id="container">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell align="center">Title</TableCell>
                <TableCell align="center">Frequency Reserve</TableCell>
                <TableCell align="center">Main Entry - Personal Name</TableCell>
                <TableCell align="center">
                  Main Entry - Corporate Name
                </TableCell>
                <TableCell align="center">
                  Added Entry - Personal Name
                </TableCell>
                <TableCell align="center">
                  Added Entry - Corporate Name
                </TableCell>
                <TableCell align="center">Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {table.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{row["bookName"]}</TableCell>
                  <TableCell align="center">{row["sumCount"]}</TableCell>
                  <TableCell align={row["MainPersonal"] ? "left" : "center"}>
                    {this.defaultWithBlank(row["MainPersonal"])}
                  </TableCell>
                  <TableCell align={row["MainCorp"] ? "left" : "center"}>
                    {this.defaultWithBlank(row["MainCorp"])}
                  </TableCell>
                  <TableCell align={row["AddedPersonal"] ? "left" : "center"}>
                    {this.defaultWithBlank(row["AddedPersonal"])}
                  </TableCell>
                  <TableCell align={row["AddedCorp"] ? "left" : "center"}>
                    {this.defaultWithBlank(row["AddedCorp"])}
                  </TableCell>
                  <TableCell align="center">
                    {this.defaultWithBlank(row["Year"])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}
