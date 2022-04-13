import React, { Component, useState } from "react";
import Web3 from "web3";

class CoinToss extends Component {
  state = {};
  constructor() {
    super();
    this.state = {
      walletAddress: "none",
    };
    this.setWalletAddress = this.setWalletAddress.bind(this);
  }

  setWalletAddress(address) {
    this.setState({ walletAddress: address });
  }

  async requestAccount() {
    if (window.ethereum) {
      console.log("Metamask detected");

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        this.setWalletAddress("2");

        console.log(accounts[0]);
      } catch (error) {
        console.log("Error Connecting");
      }
    } else {
      console.log("No Metamask is installed");
    }
  }

  render() {
    return (
      <div>
        <div className="navbar">
          <button className="connect-wallet-btn" onClick={this.requestAccount}>
            Connect Wallet
          </button>
        </div>
        <div className="content">
          <div className="status">
            <div className="status-cols">
              <div className="pool-status-col">a</div>
              <div className="wallet-status-col">
                <h3>Wallet address {this.state.walletAddress}</h3>
              </div>
            </div>
          </div>
          <div className="contract">
            <h2>Flip a Coin</h2>
            <div className="contract-ui"></div>
          </div>
          <div className="contract-history">
            <h2>Past Games</h2>
            <div className="contract-past-games"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default CoinToss;
