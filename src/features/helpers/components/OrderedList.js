import React, { Component } from 'react';

import '../styles/OrderedList.css';

export default class AdminsList extends Component {
  render() {
    const { list } = this.props;

    let liTags = list.map((address) => {
      return (
        <li>
          {address}
          <span className="remove-btn" onClick={() => this.props.onRemoveItem(address)}>Remove</span>
        </li>
      )
    });

    return (
      <ol>{liTags}</ol>
    );
  }
}
