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
import logo from '../../../public/fullLogoWhite.png';

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
        <div> {this.state.devices.map((elem, index) => {
          return (<div key={index}>{elem}</div>);
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
    const timeout = setInterval(function () {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function () {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            const result = JSON.parse(xmlHttp.responseText);
            if (result.length > 0) {
              this.setState({ eventList: result.concat(this.state.eventList) });
            }
          }
      }.bind(this);
      xmlHttp.open("GET", '/api/getlatestevent', true); // true for asynchronous
      xmlHttp.send(null); // send data HERE!
    }.bind(this), 1000);
  }
  render() {
    return (
      <div>
        {this.state.eventList.map((elem, index) => {
          return (<div key={index}>{elem.message}</div>);
        })}
      </div>
    );
  }
}

class GenerateForm extends React.Component {
  state = {
    generating: false,
    ssid: "",
    password: "",
  }
  generateRaspbian = () => {
    this.setState({ generating: true });
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          this.setState({ generating: false });
          window.location.href = xmlHttp.responseText;
        }
    }
    xmlHttp.open("POST", '/api/generateimage', true); // true for asynchronous
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify({ ssid: this.state.ssid, pass: this.state.password })); // send data HERE!
  }
  render() {
    return (
      <div className={s.inputContainer}>
        <input className={s.input} value={this.state.ssid} placeholder="SSID" onChange={event => this.setState({ ssid: event.target.value })} />
        <input className={s.input} value={this.state.password} placeholder="Password" onChange={event => this.setState({ password: event.target.value })} />
        <button className={s.logIn} onClick={this.generateRaspbian}> {this.state.generating ? "<Loading>" : "Generate Raspbian Image"}</button>
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
        : <div className={s.buttonContainer}>
            <div className={s.padding}>
              <img className={s.imgLogo} src={logo}/>
            </div>
            <div className={s.padding}>
              <span className={s.slangSpan}>An IoT notifications platform.</span>
            </div>
            <div className={s.padding}>
              <button className={s.logIn} onClick={this.logIn}> Login! </button>
            </div>
          </div>
          }
        <Footer />
      </div>
    );
  }
}

export default withStyles(s)(Layout);
