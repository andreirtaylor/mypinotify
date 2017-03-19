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
import logo from '../../../public/logo.png';

let userToken = null;

class DeviceList extends React.Component {
  state = {
    devices: []
  }
  componentDidMount() {
    var xmlHttp = new XMLHttpRequest();
    const timeout = setInterval(() => {
      xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          this.setState({ devices: xmlHttp.responseText.split(",") });
          //push the file to the user
        }
      }
      xmlHttp.open("GET", '/api/getdevices', true); // true for asynchronous 
      xmlHttp.send(null); // send data HERE!
    }, 1000);
  }
  render() {
    return (
      <div> devices
        <div> {this.state.devices.map((elem) => {
          return (<div>{elem}</div>);
        })}
        </div>
      </div>
    );
  }
}

class EventList extends React.Component {
  state = {
    eventList: [],
  }
  componentDidMount() {
    const timeout = setInterval(() => {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = () => {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            if (xmlHttp.responseText.indexOf("20") > -1) {
              clearTimeout(timeout);
            }
            console.log(xmlHttp.responseText);
            //this.setState({ eventList: [xmlHttp.responseText].concat(this.state.eventList) });
            //push the file to the user
          }
      }
<<<<<<< Updated upstream
      xmlHttp.open("GET", '/api/getlatestevent', true); // true for asynchronous
=======
      xmlHttp.open("GET", '/api/getmyevents', true); // true for asynchronous 
>>>>>>> Stashed changes
      xmlHttp.send(null); // send data HERE!
      // fetch('/api/getlatestevent', {
      //   method: "post",
      //   body: userToken
      // }).then(function(response) {
      //   this.setState({ eventList: this.state.eventList.concat([response]) }).bind(this);
      // });
    }, 1000);
  }
  render() {
    return (
      <div>
        {this.state.eventList.map((elem) => {
          return (<div>{elem}</div>);
        })}
      </div>
    );
  }
}

class GenerateForm extends React.Component {
  state = {
    generating: false,
    username: "",
    password: "",
  }
  generateRaspbian = () => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          //console.log(xmlHttp.responseText);
        }
    }
    xmlHttp.open("POST", '/api/generateimage', true); // true for asynchronous 
    xmlHttp.send(`user=${this.state.username}&pass=${this.state.password}`); // send data HERE!
  }
  render() {
    return (
      <div>
        <input value={this.state.username} placeholder="SSID" onChange={event => this.setState({ username: event.target.value })} />
        <input value={this.state.password} placeholder="Password" onChange={event => this.setState({ password: event.target.value })} />
        <button onClick={this.generateRaspbian}> {this.state.generating ? "<Loading>" : "Generate Raspbian Image"}</button>
      </div>
    );
  }
}

class Layout extends React.Component {
  componentDidMount() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            userToken = xmlHttp.responseText;
            this.setState({isLoggedIn: xmlHttp.responseText !== ""});
        }
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
            <EventList />
          </div>
        : <button className={s.logIn} onClick={this.logIn}> Login! </button>
          }
        <Footer />
      </div>
    );
  }
}

export default withStyles(s)(Layout);
