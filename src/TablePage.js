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

const db = firebase.firestore();

export default class TablePage extends React.Component {
  state = {
    table: [],
  };
  componentDidMount = async () => {
    const { author, feild } = this.props;
    console.log(this.props);
    console.log(author, feild);
    const table = await this.getBookByAuthorAndFeild(author, feild);
    this.setState({ table });
  };
  getBookByAuthorAndFeild = (author, feild) =>
    new Promise((resolve, reject) => {
      const marc_tags = [
        "marc_tag.100",
        "marc_tag.110",
        "marc_tag.700",
        "marc_tag.710",
      ];

      const dbWithFeild = db
        .collection("AuthorXContentXReserve")
        .where("marc.650", "==", feild); // array-contains

      dbWithFeild.get().then((s) => {
        s.forEach((ss) => console.log(ss.data()));
      });

      const promises = marc_tags.map((marc_tag) =>
        dbWithFeild
          .where(marc_tag, "==", author) // array-contains
          .get()
      );

      Promise.all(promises)
        .then((snapshots) => {
          console.log(snapshots.map((snapshot) => snapshot.empty));
          if (snapshots.every((snapshot) => snapshot.empty)) {
            console.log("No matching documents.");
            return;
          }

          const result = [];
          const doc_objs = {};

          snapshots.forEach((snapshot) => {
            snapshot.forEach((doc) => {
              doc_objs[doc.id] = doc;
            });
          });

          Object.values(doc_objs).forEach((doc) => {
            const bookName = doc.data()["marc_tag"]["245"];
            const MainPersonal = doc.data()["marc_tag"]["100"];
            const MainCorp = doc.data()["marc_tag"]["110"];
            const AddedPersonal = doc.data()["marc_tag"]["700"];
            const AddedCorp = doc.data()["marc_tag"]["710"];

            const sumCount =
              doc.data()["checkout"] +
              doc.data()["renew"] +
              doc.data()["internal"];

            result.push({
              bookName,
              sumCount,
              MainPersonal,
              MainCorp,
              AddedPersonal,
              AddedCorp,
            });
          });

          result.sort((a, b) => b["sumCount"] - a["sumCount"]);

          resolve(result);
        })
        .catch((err) => {
          console.log("Error getting documents", err);
        });
    });
  defaultWithBlank = (txt) => (txt ? txt : "-");
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
              </TableRow>
            </TableHead>
            <TableBody>
              {table.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{row["bookName"]}</TableCell>
                  <TableCell align="center">{row["sumCount"]}</TableCell>
                  <TableCell align="center">
                    {this.defaultWithBlank(row["MainPersonal"])}
                  </TableCell>
                  <TableCell align="center">
                    {this.defaultWithBlank(row["MainCorp"])}
                  </TableCell>
                  <TableCell align="center">
                    {this.defaultWithBlank(row["AddedPersonal"])}
                  </TableCell>
                  <TableCell align="center">
                    {this.defaultWithBlank(row["AddedCorp"])}
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
