import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./Home";
import AddData from "./AddData";
// import Test from "./test";
import Table from "./TablePage";
import "./index.css";

export default class App extends React.Component {
  state = {
    author: "",
    feild: "",
    bookData: [],
    previousState: {},
  };
  setAuthor = (author) => {
    this.setState({ author });
  };
  setField = (feild) => {
    this.setState({ feild });
  };
  setBookData = (bookData) => {
    this.setState({ bookData });
  };
  setPreviousState = (previousState) => {
    this.setState({ previousState });
  };
  render() {
    const { author, feild, bookData, previousState } = this.state;
    return (
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            component={(props) => (
              <Home
                {...props}
                setAuthor={this.setAuthor}
                setField={this.setField}
                setBookData={this.setBookData}
                previousState={previousState}
                setPreviousState={this.setPreviousState}
              />
            )}
          />
          {/* exact เป็นการกันการชนของ path */}
          <Route exact path="/add" component={AddData} />
          {/* <Route exact path="/" component={Test} /> */}
          <Route
            exact
            path="/table"
            component={(props) => (
              <Table
                {...props}
                author={author}
                feild={feild}
                bookData={bookData}
              />
            )}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}
