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
    previousState: {},
  };
  setAuthor = (author) => {
    this.setState({ author });
  };
  setField = (feild) => {
    this.setState({ feild });
  };
  setPreviousState = (previousState) => {
    this.setState({ previousState });
  };
  render() {
    const { author, feild, previousState } = this.state;
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
              <Table {...props} author={author} feild={feild} />
            )}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}
