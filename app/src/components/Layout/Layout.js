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

let userToken = null;

class DeviceList extends React.Component {
  // componentDidMount() {
  //   fetch(window.location.host + '/api/getdevices', {
  //     method: "post",
  //     body: userToken 
  //   })
  // }
  render() {
    return (
      <div> Hello </div>
    )
  }
}

class GenerateForm extends React.Component {
  state = {
    generating: false
  }
  render() {
    return (
      <div>
          <textarea placeholder="SSID" />
          <textarea placeholder="Password"/>
          <button onClick={this.generateRaspbian}> {this.state.generating ? "<Loading>" : "Generate Raspbian Image"}</button>
      </div>
    )
  }
}

class Layout extends React.Component {
  componentDidMount() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            userToken = xmlHttp.responseText;
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

  generateRaspbian = () => {
    this.setState({generating: true})
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          this.setState({generating: false})
          //push the file to the user
        }
    }
    xmlHttp.open("GET", '/generateimage', true); // true for asynchronous 
    xmlHttp.send(null); // send data HERE!
  }

  logIn = () => {
    if (window.location.host.indexOf("localhost") > -1) {
      this.setState({isLoggedIn: true});
      return;
    }
    window.location.href = '/login/facebook';
  }

  render() {
    return (
      <div>
        <Header />
        {this.state.isLoggedIn ? 
          <div>
            <GenerateForm />
            <DeviceList />
          </div>
        : 
          <button onClick={this.logIn}> Login </button>  
          }
        <Footer />
      </div>
    );
  }
}

export default withStyles(s)(Layout);
