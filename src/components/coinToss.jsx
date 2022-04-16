import React, { useState, useEffect } from "react";
// import { web3 } from "web3";
import CoinToss from "./coinToss.json";
import { Modal } from "./modal";

const poolAddress = "0x1c02b68310A4673Fc1233C5aC91C11803C626943";
const coinTossAddress = "0x2652B59bC8074dDE7CdaD6355f6bDc67F00d001B";

function CoinTossComponent() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [poolBalance, setPoolBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [uiBid, setBid] = useState(0);
  const [uiChoice, setChoice] = useState(null);
  const [txnList, setTxnList] = useState([
    {
      timestamp: "",
      address: "",
      success: "",
      prize: "",
      timestamp: "",
    },
  ]);

  var Web3 = require("web3");

  var abi = CoinToss.abi;

  var web3 = new Web3(Web3.givenProvider);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getBalance = async () => {
      try {
        const contBal = await web3.eth.getBalance(poolAddress);
        setPoolBalance(Web3.utils.fromWei(contBal, "ether"));
      } catch (error) {
        console.log(error);
      }
    };
    const getAccount = async () => {
      try {
        const { ethereum } = window;
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Found an account! Address: ", accounts[0]);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.log(error);
      }
    };
    const getTxns = async () => {
      const coinTossWeb3Contract = new web3.eth.Contract(abi, coinTossAddress);

      const events = await coinTossWeb3Contract.getPastEvents("Result", {
        fromBlock: 0,
      });

      let txnList = [];
      console.log(events);
      for (const event of events) {
        const guess_value = event.returnValues["guess_value"];
        const result = event.returnValues["result"];
        const bid = Web3.utils.fromWei(event.returnValues["bid"], "ether");
        const address = event.returnValues["player"];
        const timestamp = parseInt(event.returnValues["timestamp"]);
        const date = new Date(timestamp * 1000);

        txnList.push({
          timestamp: `${timestamp}`,
          address: address,
          success: guess_value === result ? "won" : "lost",
          prize: guess_value === result ? `${bid * 2} ETH` : `${bid} ETH`,
          date: `${date.toUTCString()}`,
        });
      }
      setTxnList(txnList.reverse());
    };
    getAccount();
    getBalance();
    checkWalletIsConnected();
    getTxns();
  }, [showModal]);

  const flip = async () => {
    try {
      const { ethereum } = window;

      const bid = document.getElementById("bid-input-field").value;

      const choice = document.getElementById("choice-select").value;

      console.log(`bid is ${bid}, choice is ${choice}`);

      setBid(bid);
      setChoice(choice);

      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="main-app">
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        uiBid={uiBid}
        uiChoice={uiChoice}
        web3={web3}
      />
      <div className="navbar">
        {/* {currentAccount === null ? (
          <button onClick={connectWalletHandler} className="connect-wallet-btn">
            Connect Wallet
          </button>
        ) : null} */}
      </div>
      <div className="content">
        <div className="status">
          <div className="status-cols">
            <div className="pool-status-col">
              <p>Pool Status:</p>
              <p>{poolBalance} ETH</p>
            </div>
            <div className="wallet-status-col">
              <p>Wallet:</p>
              <p>{currentAccount}</p>
            </div>
          </div>
        </div>
        <div className="contract">
          <h2>Flip a Coin</h2>
          <div className="contract-ui">
            <div className="ui-cols">
              <div className="bid-input">
                <div className="input-cols">
                  <p>Your bid is</p>
                  <input
                    className="input-field"
                    type="text"
                    defaultValue="0.001"
                    autoComplete="off"
                    id="bid-input-field"
                  />
                  <p>ETH</p>
                </div>
              </div>
              <div className="choice-input">
                <div className="input-cols">
                  <p>Your choice</p>
                  <select
                    className="select-field"
                    name="choice"
                    id="choice-select"
                  >
                    <option value="tails">tails</option>
                    <option value="heads">heads</option>
                  </select>
                  <p>sds</p>
                </div>
              </div>
            </div>
            <button className="flip-button" onClick={flip}>
              Flip
            </button>
          </div>
        </div>
        <div className="contract-history">
          <h2>Past Games</h2>
          <div className="listbox-area">
            <div>
              <ul id="ss_elem_list" tabIndex="0" role="listbox">
                {txnList.map((txn) => {
                  return (
                    <li id="ss_elem" key={`${txn.timestamp}`}>
                      <div className="li-cols">
                        <div className="li-col">
                          <span className="timestamp">{txn.date}</span>
                          <a
                            className="tx-link"
                            href={`https://rinkeby.etherscan.io/address/${txn.address}`}
                          >
                            {txn.address}
                          </a>
                        </div>
                        <span className="result">{txn.success}</span>
                        <span className="bid-amount">{txn.prize}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinTossComponent;
