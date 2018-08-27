import React, { Component } from 'react'

import '../styles/user-profile.css';

export default class UserProfile extends Component {
  render() {
    const { account, accountType } = this.props;

    return (
      <div className="user-profile">
        <div className="address-container">
          <p>Your address:</p>
          <span>{account}</span>
        </div>
        <div className="account-type-container">
          <p>Account type:</p>
          <span>{accountType}</span>
        </div>
      </div>
    )
  }
}
