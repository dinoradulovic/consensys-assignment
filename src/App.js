import React, { Component } from 'react'
import contract from 'truffle-contract';
import { BrowserRouter , Switch, Route, Redirect, Link } from 'react-router-dom';

import getWeb3 from './utils/getWeb3'

import AuthContract from '../build/contracts/Auth.json';
import MarketplaceContract from '../build/contracts/Marketplace.json';

import UserProfile from './features/current-user/components/UserProfile';
import AdminDashboard from './features/admin-management/components/AdminDashboard';
import StoreOwnerDashboard from './features/stores/components/StoreOwnerDashboard';
import Store from './features/stores/components/Store';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      authContract: null,
      marketplaceContract: null,
      account: null,
      accountType: ''
    }
  }

  componentWillMount() {
    this.getWeb3Instance();
  }

  getWeb3Instance() {
    getWeb3
      .then(async results => {
        this.setState({
          web3: results.web3
        });

        await this.instantiateContracts();
        this.setCurrentAccount();
      })
      .catch((err) => {
        console.log('Error finding web3.', err)
      })
  }

  async setCurrentAccount() {
    let account = this.state.web3.eth.accounts[0];
    let accountType = await this.setAccountType(account);

    this.setState({
      account,
      accountType
    });

    this.watchAccountChanges();
  }

  async setAccountType(address) {

    const authContract = this.state.authContract;
    const account = this.state.account;

    const isAdmin = await authContract.admins(address, {from: account});
    const isStoreOwner = await authContract.storeOwners(address, {from: account});

    let accountType;

    if (isAdmin) accountType = 'admin';
    else if (isStoreOwner) accountType = 'store-owner';
    else if (!accountType) accountType = 'shopper';

    return accountType;
  }

  watchAccountChanges() {
    setInterval(async () => {
      if (this.state.web3.eth.accounts[0] !== this.state.account) {
        const newAccount = this.state.web3.eth.accounts[0];
        let accountType = await this.setAccountType(newAccount);

        this.setState({
          account: newAccount,
          accountType
        })
      }
    }, 100);
  }

  async instantiateContracts() {
    const provider = this.state.web3.currentProvider;

    const authContract = contract(AuthContract);
    const marketplaceContract = contract(MarketplaceContract);

    authContract.setProvider(provider);
    marketplaceContract.setProvider(provider);

    const authContractInstance = await authContract.deployed();
    const marketplaceContractInstance = await marketplaceContract.deployed();

    this.setState({
      authContract: authContractInstance,
      marketplaceContract: marketplaceContractInstance
    });
  }

  redirectAccordingToAccountType() {
    const accountType = this.state.accountType;

    if (accountType === 'admin') {
      return <Redirect to="/admin/dashboard"/>
    } else if (accountType === 'store-owner') {
      return <Redirect to="/store-owner/dashboard"/>
    } else if (accountType === 'shopper') {
      return <Redirect to="/shop"/>
    }
  }

  render() {
    const accountType = this.state.accountType;

    return (
      <BrowserRouter>
        <div className="App">
          <nav className="navbar pure-menu pure-menu-horizontal">
            <Link to='/' target="_self" className="pure-menu-heading pure-menu-link">Decentralized Marketplace</Link>
            <div className="user-profile-container">
              <UserProfile account={this.state.account} accountType={accountType}/>
            </div>
          </nav>
          <main className="container">
            <div className="main-content">
              {this.redirectAccordingToAccountType()}
              <Switch>
                <Route exact path='/shop' render={(props) =>
                  this.state.marketplaceContract &&
                  this.state.account &&
                  <StoreOwnerDashboard
                    web3={this.state.web3}
                    marketplaceContract={this.state.marketplaceContract}
                    account={this.state.account}
                    accountType={this.state.accountType}
                  />
                }/>
                <Route exact path='/store-management/:id' render={(props) =>
                  this.state.marketplaceContract &&
                  this.state.account &&
                  <Store
                    {...props}
                    web3={this.state.web3}
                    marketplaceContract={this.state.marketplaceContract}
                    account={this.state.account}
                    accountType={this.state.accountType}
                  />
                }/>
                <Route exact path='/store-owner/dashboard' render={() =>
                  this.state.marketplaceContract &&
                  this.state.account &&
                  this.state.accountType &&
                  <StoreOwnerDashboard
                    web3={this.state.web3}
                    marketplaceContract={this.state.marketplaceContract}
                    account={this.state.account}
                    accountType={this.state.accountType}
                  />
                }/>
                <Route exact path='/admin/dashboard' render={() =>
                  this.state.authContract &&
                  this.state.account &&
                  <AdminDashboard
                    authContract={this.state.authContract}
                    account={this.state.account}/>
                }/>
              </Switch>
            </div>
          </main>
        </div>
      </BrowserRouter>
    );
  }
}

export default App
