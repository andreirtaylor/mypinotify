/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Layout.css';
import Header from '../Header';
import Footer from '../Footer';

class Layout extends React.Component {
  componentDidMount() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            this.setState({isLoggedIn: xmlHttp.responseText !== ""});
    }
    xmlHttp.open("GET", '/api/token', true); // true for asynchronous 
    xmlHttp.send(null);
  }
  state = {
    isLoggedIn: false
  }
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  logOut = () => {
    console.log("NOT IMPLEMENTED");
  }

  logIn = () => {
    window.location.href = '/login/facebook';
  }

  render() {
    return (
      <div>
        <Header />
        {this.state.isLoggedIn ? 
        <button onClick={this.logOut}> Logout </button>
        : <button onClick={this.logIn}> Login </button> }
        <Footer />
      </div>
    );
  }
}

export default withStyles(s)(Layout);
