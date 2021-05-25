import React, { Component } from "react";
import DVideo from "../abis/DVideo.json";
import Navbar from "./Navbar";
import Main from "./Main";
import Web3 from "web3";
import "./App.css";

//Declare IPFS
const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
}); // leaving out the arguments will default to these values

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      window.web3 = new Web3(window.ethereum);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    //Load accounts
    const accounts = await web3.eth.getAccounts();

    //Add first account the the state
    this.setState({ account: accounts[0] });

    //Get network ID
    const networkId = await web3.eth.net.getId();

    //Get network data
    const networkData = DVideo.networks[networkId];

    //Check if net data exists, then
    if (networkData) {
      //Assign dvideo contract to a variable
      const dvideo = new web3.eth.Contract(DVideo.abi, networkData.address);

      //Add dvideo to the state
      this.setState({ dvideo });

      //Check videoAmounts
      const videoAmounts = await dvideo.methods.videoCount().call();

      //Add videoAmounts to the state
      this.setState({ videoAmounts });

      //Iterate throught videos and add them to the state (by newest)
      for (let i = videoAmounts; i >= 1; i--) {
        const video = await dvideo.methods.videos(i).call();
        this.setState({ videos: [...this.state.videos, video] });
      }

      //Set latest video and it's title to view as default
      const latest = await dvideo.methods.videos(videoAmounts).call();
      this.setState({ currentHash: latest.hash, currentTitle: latest.title });

      //Set loading state to false
      this.setState({ loading: false });
    } else {
      //If network data doesn't exisits, log error
      window.alert("DVideo contract not deployed to detected network.");
    }
  }

  //Get video
  captureFile = (event) => {};

  //Upload video
  uploadVideo = (title) => {};

  //Change Video
  changeVideo = (hash, title) => {};

  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      account: "",
      dvideo: null,
      videos: [],
      loading: false,
      currentHash: null,
      currentTitle: null,
    };

    //Bind functions
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
          //states&functions
          />
        )}
      </div>
    );
  }
}

export default App;
