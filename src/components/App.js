import { Tabs, Tab } from 'react-bootstrap';
import dBank from '../abis/dBank.json';
import React, { Component } from 'react';
import Token from '../abis/Token.json';
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

class App extends Component {
  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3 = new Web3(window.ethereum);
        const netId = await web3.eth.net.getId();
        console.log('netId: ', netId);
        const accounts = await web3.eth.getAccounts();
        console.log('accounts: ', accounts);
        const [account] = accounts;
        const balance = await web3.eth.getBalance(account);
        console.log('balance: ', balance);
        const etherBalance = await web3.utils.fromWei(balance);
        if (typeof account !== 'undefined') {
          this.setState({ account, balance: etherBalance, web3 });
        } else {
          window.alert('Please login with MetaMask');
        }
        const tokenContract = new web3.eth.Contract(
          Token.abi,
          Token.networks[netId].address,
        );
        const dBankContract = new web3.eth.Contract(
          dBank.abi,
          dBank.networks[netId].address,
        );
        const amountDeposited = await web3.utils.fromWei(
          await dBankContract.methods.etherBalanceOf(account).call(),
        );
        const test = await web3.utils.fromWei(
          await dBankContract.methods.getBlockTime().call(),
        );
        const test2 = await web3.utils.fromWei(
          await dBankContract.methods.depositStart(account).call(),
        );
        console.log({ test, test2 });
        console.log('amountDeposited: ', amountDeposited);
        this.setState({
          token: tokenContract,
          amountDeposited,
          dbank: dBankContract,
          dBankAddress: dBank.networks[netId].address,
        });
        console.log({ web3, netId, account, balance });
      } catch (e) {
        console.log({ e });
        window.alert('Unexpected error :[');
      }
    } else {
      window.alert('You need MetaMask installed to use this demo website');
    }
  }

  async deposit(amount) {
    if (this.state.dbank !== 'undefined') {
      console.log({ amount });
      await this.state.dbank.methods
        .deposit()
        .send({ value: amount.toString(), from: this.state.account });
    }
  }

  async withdraw(e) {
    e.preventDefault();
    if (this.state.dbank !== 'undefined') {
      await this.state.dbank.methods
        .withdraw()
        .send({ from: this.state.account });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      interest: 0,
      amountDeposited: 0,
      dBankAddress: null,
    };
  }

  render() {
    return (
      <div className="text-monospace">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={dbank} className="App-logo" alt="logo" height="32" />
            <b>dBank</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to dBank</h1>
          <p>Your wallet: {this.state.account}</p>
          <h4>{this.state.balance} ETH</h4>
          <h6>
            Earning 10% interest on {this.state.amountDeposited} ETH (paid in
            DBC token)
          </h6>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br></br> How much do you want to deposit?
                      <br></br> (1 deposit is possible at a time)
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.depositAmount.value;
                          amount = amount * 10 ** 18; // convert to wei
                          this.deposit(amount);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br></br>
                          <input
                            id="depositAmount"
                            className="form-control form-control-md"
                            placeholder="enter amount"
                            step="0.01"
                            type="number"
                            required
                            min="0"
                            ref={(input) => {
                              this.depositAmount = input;
                            }}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          DEPOSIT
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <div>
                      <br></br> How much do you want to withdraw (includes
                      interest)?
                      <br></br>
                      <div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          onClick={(e) => this.withdraw(e)}
                        >
                          WITHDRAW
                        </button>
                      </div>
                      <br></br>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
