import React, { Component } from 'react';

export default class AddAdminForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: ''
    }
  }

  handleSubmitForm(event) {
    event.preventDefault();

    this.props.onSubmitForm(this.state.input)
    this.setState({
      input: ''
    })
  }

  handleOnchangeInput(e) {
    this.setState({
      input: e.target.value
    })
  }

  render() {
    return (
      <form onSubmit={(e) => this.handleSubmitForm(e)}>
        <label>
          <input
            type="text"
            name="address"
            placeholder="address"
            onChange={(e) => this.handleOnchangeInput(e)}
            value={this.state.input} />
        </label>
        <input type="submit" value={this.props.submitButtonText} />
      </form>
    )
  }
}
