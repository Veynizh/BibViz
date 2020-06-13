import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./Home";
import AddData from "./AddData";
import Table from "./TablePage";
import "./index.css";

export default class App extends React.Component {
  state = {
    author: "",
    feild: "",
  };
  setAuthor = (author) => {
    this.setState({ author });
  };
  setFeild = (feild) => {
    this.setState({ feild });
  };
  render() {
    const { author, feild} = this.state;
    return (
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            component={(props) => (
              <Home {...props} setAuthor={this.setAuthor} setFeild={this.setFeild} />
            )}
          />
          {/* exact เป็นการกันการชนของ path */}
          <Route exact path="/add" component={AddData} />
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
