import React, { useState } from "react";
// import { web3 } from "web3";
import { ethers } from "ethers";
import CoinToss from "./coinToss.json";

const coinTossAddress = "0x2652B59bC8074dDE7CdaD6355f6bDc67F00d001B";

export const Modal = ({ showModal, setShowModal, uiBid, uiChoice, web3 }) => {
  var abi = CoinToss.abi;
  const [waitingForResult, setWaitingForResult] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [success, setSuccess] = useState("");

  const closeButtonHandler = async () => {
    setShowResult(false);
    setWaitingForResult(false);
    setShowModal(false);
    setSuccess("");
  };

  const yes = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const bid = ethers.utils.parseEther(uiBid);

        const choice =
          uiChoice === "tails"
            ? ethers.utils.parseUnits("1", "wei")
            : ethers.utils.parseUnits("0", "wei");

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coinTossContract = new ethers.Contract(
          coinTossAddress,
          abi,
          signer
        );

        const coinTossWeb3Contract = new web3.eth.Contract(
          abi,
          coinTossAddress
        );

        setWaitingForResult(true);

        const startingNumberOfEvents = (
          await coinTossWeb3Contract.getPastEvents("Result", {
            fromBlock: 0,
          })
        ).length;

        console.log("Flip is initialized");
        let flipTxn = await coinTossContract.flip(choice, {
          value: bid,
        });

        console.log("Waiting for tx");
        await flipTxn.wait();

        console.log(
          `Transaction: https://rinkeby.etherscan.io/tx/${flipTxn.hash}`
        );

        let numberOfEvents = startingNumberOfEvents;
        while (numberOfEvents !== startingNumberOfEvents + 1) {
          numberOfEvents = (
            await coinTossWeb3Contract.getPastEvents("Result", {
              fromBlock: 0,
            })
          ).length;
        }

        const events = await coinTossWeb3Contract.getPastEvents("Result", {
          fromBlock: 0,
        });

        const event = events[events.length - 1];

        const guess_value = event.returnValues["guess_value"];
        const result = event.returnValues["result"];

        console.log(guess_value, result);

        setSuccess(guess_value === result ? "won" : "lost");

        setWaitingForResult(false);
        setShowResult(true);
      } else {
        console.log("Ethereum onbject does not exist");
      }
    } catch (error) {
      console.log(error);
      setWaitingForResult(false);
      setShowResult(false);
    }
  };

  return (
    <div>
      {showModal ? (
        <div className="modal-window">
          <div className="modal-wrapper">
            {!waitingForResult && !showResult ? (
              <div>
                <h2 className="bid-info">Bid information</h2>
                <p>Your bid is {uiBid} ETH</p>
                <p>Your choice is {uiChoice}</p>
                <p>Would you like to flip a coin?</p>
                <div className="modal-buttons-cols">
                  <button className="modal-choice-button" onClick={yes}>
                    Yes
                  </button>
                  <button
                    className="modal-choice-button"
                    onClick={() => setShowModal(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            ) : null}
            {!showResult ? (
              <h2>Waiting for transaction and calculating the result</h2>
            ) : (
              <div>
                <h2>You {`${success}`}</h2>
                <button
                  className="modal-choice-button"
                  onClick={closeButtonHandler}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
