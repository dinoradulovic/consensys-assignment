import React, { Component } from 'react'

export default class RenderIf extends Component {
  render() {

    if (this.props.if) {
      return this.props.children;
    }

    return null;
  }
}
