import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';

class Header extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <h1 className={s.bannerTitle}>MyPiNotify</h1>
      </div>
    );
  }
}

export default withStyles(s)(Header);
