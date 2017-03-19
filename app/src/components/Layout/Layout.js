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
    const isLoggedIn = false;
    return (
      <div>
        <Header />
        {isLoggedIn ? 
        <button onClick={this.logOut}> Logout </button>
        : <button onClick={this.logIn}> Login </button> }
        <Footer />
      </div>
    );
  }
}

export default withStyles(s)(Layout);
