import React, { Component } from 'react'
import { Link } from 'react-router-dom';

import RenderIf from '../../helpers/components/RenderIf';

import '../styles/StoreOwnerDashboard.css'


export default class StoreOwnerDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stores: []
    }
  }

  componentDidMount() {
    if (this.props.accountType === 'shopper') {
      this.getAllStores();
    } else {
      this.getAllStoreOwnerStores();
    }
  }

  async getAllStores() {
    const { marketplaceContract } = this.props;
    const stores = await marketplaceContract.getAllStores(this.props.account);

    const storeFronts = this.prettyStoresAll(stores);

    this.setState({
      stores: storeFronts
    })
  }

  async getAllStoreOwnerStores() {
    const { marketplaceContract } = this.props;
    const stores = await marketplaceContract.getAllStoreOwnerStores(this.props.account);

    const storeFronts = this.prettyStores(stores);

    this.setState({
      stores: storeFronts
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.account !== this.props.account && this.props.accountType !== 'admin') {
      window.location.reload();
    }
  }

  prettyStoresAll(stores) {
    const storeIds = stores;
    const storesCount = storeIds.length;

    let storeFronts = [];

    for (let i = 0; i < storesCount; i++) {

      const storeId = storeIds[i];
      const store = {
        storeId: storeId.toNumber()
      };

      storeFronts.push(store);
    }

    return storeFronts
  }

  prettyStores(stores) {
    const storeIds = stores[0];
    let storeBalances;

    if (stores[1]) {
      storeBalances = stores[1];
    }


    const storesCount = storeIds.length;

    let storeFronts = [];

    for (let i = 0; i < storesCount; i++) {
      const store = {
        storeId: storeIds[i].toNumber()
      };

      if (storeBalances) {
        store.storeBalance = storeBalances[i].toNumber();
      }

      storeFronts.push(store);
    }

    return storeFronts
  }

  handleAddNewStore(val) {
    const { marketplaceContract , account } = this.props;

    marketplaceContract
      .addStore({from: account})
      .then((result) => {
        const stores = this.state.stores;
        this.setState({
          stores: stores.concat({
            storeId: result.logs[0].args.id.c[0],
            storeBalance: 0
          })
        });
      });
  }

  render() {
    const { accountType} = this.props;

    return (
      <div className="store-owner-dashboard">
        <RenderIf if={accountType === "store-owner"}>
          <h2>Welcome Shop Owner!</h2>
        </RenderIf>
        <RenderIf if={accountType === "shopper"}>
          <h2>Pick one of the shops to view the products!</h2>
        </RenderIf>
        <div>
          <RenderIf if={accountType === "store-owner"}>
            <h3>These are your stores:</h3>
          </RenderIf>
          <StoresList
            stores={this.state.stores}
            web3={this.props.web3}
            accountType={this.props.accountType}
          />
        </div>
        <RenderIf if={accountType === "store-owner"}>
          <div>
            <h3>Add a new store</h3>
            <button onClick={(e) => this.handleAddNewStore(e)}>Add new Store</button>
          </div>
        </RenderIf>

      </div>
    )
  }
}



class StoresList extends Component {
  render() {
    const { stores, web3, accountType} = this.props;



    if (stores && stores.length) {
      const storesContent = stores.map((store, i) => {
        return (
          <Link to={{pathname: `/store-management/${store.storeId}`}} key={i} className="store">
            <div>
              <div className="store-id">Store: {store.storeId}</div>
              <RenderIf if={accountType === "store-owner"}>
                <div className="store-balance">Balance: {web3.fromWei(store.storeBalance, 'ether')}eth</div>
              </RenderIf>
            </div>
          </Link>
        )
      });

      return <div className="stores-list">{storesContent}</div>;
    }

    return null;
  }
}