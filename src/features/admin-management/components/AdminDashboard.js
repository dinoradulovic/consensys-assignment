import React, { Component } from 'react'

import Form from '../../helpers/components/Form';
import OrderedList from '../../helpers/components/OrderedList';

export default class AdminDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adminsAddresses: [],
      storeOwnersAddresses: []
    }
  }

  async componentDidMount() {
    await this.getDataFromLogs();
  }

  getDataFromLogs() {
    const allEvents = this.props.authContract.allEvents({ fromBlock: 0, toBlock: 'latest' });

    return new Promise((resolve, reject) => {
      allEvents.get((error, logs) => {
        if (error) {
          console.error(error);
          return;
        }

        const adminAddresses = new Set();
        const storeOwnerAddresses = new Set();

        logs.forEach((log) => {
          if (log.event === "AdminAdded") {
            adminAddresses.add(log.args.addr);
          } else if (log.event === "AdminRemoved") {
            adminAddresses.delete(log.args.addr);
          } else if (log.event === "StoreOwnerAdded") {
            storeOwnerAddresses.add(log.args.addr);
          } else if (log.event === "StoreOwnerRemoved") {
            storeOwnerAddresses.delete(log.args.addr);
          }
        });

        this.setState({
          adminsAddresses: Array.from(adminAddresses),
          storeOwnersAddresses: Array.from(storeOwnerAddresses),
        }, () => {
          resolve()
        });
      })
    });
  }

  handleAddAdmin(address) {
    let authContract = this.props.authContract;
    let account = this.props.account;

    authContract
      .addAdmin(address, {from: account})
      .then((result) => {
        let adminsAddresses = this.state.adminsAddresses.concat(result.logs[0].args.addr);
        this.setState({
          adminsAddresses
        })

      });
  }

  handleRemoveAdmin(address) {
    let authContract = this.props.authContract;
    let account = this.props.account;

    authContract
      .removeAdmin(address, {from: account, gas: 4600000})
      .then((result) => {
        this.setState({
          adminsAddresses: this.state.adminsAddresses.filter((address) => {
            return address !== result.logs[0].args.addr;
          })
        })
      });
  }

  handleAddStoreOwner(address) {
    let authContract = this.props.authContract;
    let account = this.props.account;

    authContract
      .addStoreOwner(address, {from: account})
      .then((result) => {
        let storeOwnersAddresses = this.state.storeOwnersAddresses.concat(result.logs[0].args.addr);
        this.setState({
          storeOwnersAddresses
        })

      });
  }

  handleRemoveStoreOwner(address) {
    let authContract = this.props.authContract;
    let account = this.props.account;

    authContract
      .removeStoreOwner(address, {from: account, gas: 4600000})
      .then((result) => {
        this.setState({
          storeOwnersAddresses: this.state.storeOwnersAddresses.filter((address) => {
            return address !== result.logs[0].args.addr;
          })
        })
      });
  }

  render() {
    return (
      <div className="auth-management">
        <div className="admin-management">
          <h2>Admins List</h2>
          <div className="admins-form">
            <Form
              onSubmitForm={(e) => this.handleAddAdmin(e)}
              submitButtonText="Add Admin"
            />
          </div>
          <div className="admins-addresses-list">
            <OrderedList list={this.state.adminsAddresses} onRemoveItem={(e) => this.handleRemoveAdmin(e)}/>
          </div>
        </div>
        <div className="store-owners-management">
          <h2>Store Owners List</h2>
          <div className="store-owners-form">
            <Form
              onSubmitForm={(e) => this.handleAddStoreOwner(e)}
              submitButtonText="Add Store Owner"/>
          </div>
          <div className="store-owners-list">
            <OrderedList list={this.state.storeOwnersAddresses} onRemoveItem={(e) => this.handleRemoveStoreOwner(e)}/>
          </div>
        </div>
      </div>
    );

  }
}