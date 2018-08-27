import React, { Component } from 'react';

import RenderIf from '../../helpers/components/RenderIf';

import '../styles/Store.css';

export default class Store extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      addingProductInputs: {
        productName: '',
        productPrice: ''
      },
      infoText: '',
    }
  }

  async componentDidMount() {
    const { marketplaceContract } = this.props;
    const storeId = this.props.match.params.id;

    const web3 = this.props.web3;
    const products = await marketplaceContract.getProducts(storeId);

    const productIds = products[0];
    const productNames = products[1];
    const productPrices = products[2];
    const productsCount = productIds.length;

    let productsMapped = [];

    for (let i = 0; i < productsCount; i++) {
      const product = {
        productId: productIds[i].toNumber(),
        productName: web3.toAscii(productNames[i]),
        productPrice: productPrices[i].toNumber()
      };

      productsMapped.push(product);
    }

    this.setState({
      products: productsMapped
    });
  }



  handleOnchangeInput(e, input) {
    const addingProductInputs = Object.assign({}, this.state.addingProductInputs);
    addingProductInputs[input] = e.target.value;

    this.setState({ addingProductInputs })
  }

  async handleSubmitForm(e) {
    e.preventDefault();

    const { marketplaceContract, account, web3 } = this.props;

    const storeId = this.props.match.params.id;

    try {
      const transaction = await marketplaceContract.addProductToStore(
        storeId,
        web3.fromAscii(this.state.addingProductInputs.productName),
        web3.toWei(this.state.addingProductInputs.productPrice, "ether"),
        {
          from: account
        }
      );

      this.setState({
        products: this.state.products.concat({
          productId:  transaction.logs[0].args.id.toNumber(),
          productName: web3.toAscii(transaction.logs[0].args.name),
          productPrice: transaction.logs[0].args.price.toNumber(),
        })
      });

    } catch(error) {
      console.log(error);
    }
  }

  async removeProduct(index) {
    const { marketplaceContract, account } = this.props;
    const storeId = this.props.match.params.id;

    await marketplaceContract.removeProductFromStore(
      storeId,
      index,
      {
        from: account,
        gas: 4600000
      }
    );

    this.setState({
      products: this.state.products.filter((product, i) => {
        return index !== i;
      })
    });
  }

  async updateProductPrice(productId) {
    const { marketplaceContract, account } = this.props;
    const storeId = this.props.match.params.id;

    const transaction = await marketplaceContract.updateProductPrice(
      storeId,
      productId,
      parseFloat(this.refs["new-price"].value),
      {
        from: account,
        gas: 4600000
      }
    );


    const products = this.state.products.map((product) => {
      if (product.productId === transaction.logs[0].args.productId.toNumber()) {
        product.productPrice = transaction.logs[0].args.price.toNumber();
      }
      return product;
    });

    this.setState({
      products
    });
  }

  async buyProduct(productId, productPrice, productName) {
    const { marketplaceContract, account, web3 } = this.props;
    const storeId = this.props.match.params.id;

    try {
      await marketplaceContract.buyProduct(
        productId,
        storeId,
        {
          from: account,
          gas: 4600000,
          value: productPrice
        }
      );

      this.setState({
        infoText: `Awesome, you made it! Bought product: ${productName}`
      })
    } catch (err) {
      alert("Something went wrong. Couldn't buy a product.")
    }
  }

  renderProducts() {
    const { accountType } = this.props;

    const products = this.state.products.map((
      {
        productId,
        productName,
        productPrice
      }, i
    ) => {
      return (
        <div className="product" key={i}>
          <div className="product-details">
            <div>
              <span className="product-title">Product ID:</span>
              <span>{productId}</span>
            </div>
            <div>
              <span className="product-title">Product Name:</span>
              <span>{productName}</span>
            </div>
            <div>
              <span className="product-title">Product Price:</span>
              <span>{this.props.web3.fromWei(productPrice, 'ether')}eth</span>
            </div>
          </div>
          <RenderIf if={accountType === "store-owner"}>
            <div className="product-management">
              <button className="remove-product-btn" onClick={() => this.removeProduct(i)}>Remove product</button>
              <div className="change-price">
                <input type="number" placeholder="New price" ref="new-price"/>
                <button onClick={() => this.updateProductPrice(productId)}>Change Price</button>
              </div>
            </div>
          </RenderIf>

          <RenderIf if={accountType === "shopper"}>
            <div className="product-buy">
              <button className="buy-product-btn" onClick={() => this.buyProduct(productId, productPrice, productName)}>Buy product</button>
            </div>
          </RenderIf>
        </div>
      )
    });

    return products;
  }

  render() {
    const { accountType } = this.props;
    return (
      <div>
        <RenderIf if={this.state.infoText}>
          <h1>{this.state.infoText}</h1>
        </RenderIf>
        <h2>Products in this store</h2>
        <div className="products-list">
          {this.renderProducts()}
        </div>
        <RenderIf if={accountType === "store-owner"}>
          <div className="add-product">
            <h2>Add a product</h2>
            <form onSubmit={(e) => this.handleSubmitForm(e)}>
              <label>
                <span>Product name</span>
                <input
                  type="text"
                  name="product-name"
                  placeholder="Product name"
                  onChange={(e) => this.handleOnchangeInput(e, "productName")}
                  value={this.state.productName} />
              </label>
              <label>
                <span>Product price</span>
                <input
                  type="number"
                  name="product-price"
                  placeholder="ether"
                  onChange={(e) => this.handleOnchangeInput(e, "productPrice")}
                  value={this.state.productPrice} />
              </label>
              <input type="submit" value="Add Product" />
            </form>
          </div>
        </RenderIf>
      </div>
    )

  }
}
