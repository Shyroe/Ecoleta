import React from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";

import Home from "./pages/Home";
import CreatePoint from "./pages/CreatePoint";

const Routes = () => {
  return (
    <Router>
      <Route exact path="/" component={Home} />
      <Route path="/create-point" component={CreatePoint} />
    </Router>
  );
};

export default Routes;
