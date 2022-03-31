import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React from 'react';
import { Button, Form, Navbar, Nav, Container, Card } from 'react-bootstrap';

import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";

/** Components **/
import ListItems from './ListItems'
import LoginPage from './LoginPage'
import RecordList from "./components/recordList";
import Edit from "./components/edit";
import Create from "./components/create";

import ChanLe from './chanle/chanle';

import TokenManagement from './token_components/token_management';
import MyTokenAsset from './token_components/my_token_asset';
import SmartContractTokenAsset from './token_components/smartcontract_token_asset';

import {sk} from './socket/socket_uti.js';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { date: new Date() };
  }

  render() {

    // Similar to componentDidMount and componentDidUpdate:
    window.onload = function () {
      connectMetamask();
    }

    function checkMM() {
      if (typeof window.ethereum !== 'undefined') {
        return true;
      } else {
        return false;
      }
    }

    async function loginMetaMask() {
      try {
        if (checkMM()) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          return accounts;
        } else {
          return null;
        }

      } catch (err) {
        console.log(err);
        return null;
      }
    }

    const connectMetamask = () => {
      try {
        loginMetaMask().then((data) => {
          //console.log(data);
          this.setState({ MetaMaskAddress: data[0] });
        }).catch((err) => {
          this.setState({ MetaMaskAddress: '' });
          alert("MetaMask already processing. Please check Metamask.");
        });

      } catch (err) {
        console.log(err);
      }
    }

    window.ethereum.on("accountsChanged", (data) => {
      //console.log(data.length);
      this.setState({ MetaMaskAddress: data[0] });
      window.location.reload();
    });

    return (
      <>
        <Container className='containter'>

          <Router basename='/S_Coin/'>
            <Card className="text-center">
              <Card.Header className='app-header'>
                <Navbar bg="dark" variant="dark">
                  <Container>
                    <Navbar.Brand  as={Link} to="/home">S-Coin</Navbar.Brand>
                    <Nav className="me-auto">
                      <Nav.Link as={Link} to="/home">Home</Nav.Link>
                      <Nav.Link as={Link} to="/coin">Coin</Nav.Link>
                      <Nav.Link as={Link} to="/token">Token</Nav.Link>
                      <Nav.Link as={Link} to="/my-asset">My Asset</Nav.Link>
                      <Nav.Link as={Link} to="/smartcontract-asset">SM Asset</Nav.Link>
                      <Nav.Link as={Link} to="/chanle">Chan hay Le</Nav.Link>
                      <Nav.Link as={Link} to="/layout2">Features</Nav.Link>
                      {/* 
                  <Nav.Link href="#pricing">Pricing</Nav.Link> */}
                    </Nav>
                    <Form className="d-flex">
                      <div className='text-white'>{this.state.MetaMaskAddress}</div>
                      <Button variant="outline-light" onClick={connectMetamask}><FontAwesomeIcon icon={faWallet} /></Button>
                    </Form>
                  </Container>
                </Navbar>
              </Card.Header>
              <Card.Body className='app-body'>
                <Routes>
                  <Route exact path="/" element={<Navigate replace to="/home" />}> </Route>
                  
                  <Route exact path='/home' element={<ListItems MetaMaskAddress={this.state.MetaMaskAddress} />} />

                  <Route exact path='/coin' element={<RecordList  />} />
                  <Route exact path='/token' element={<TokenManagement  />} />
                  <Route exact path='/my-asset' element={<MyTokenAsset  />} />
                  <Route exact path='/smartcontract-asset' element={<SmartContractTokenAsset  />} />

                  <Route path="/edit/:id" element={<Edit />} />
                  <Route path="/create" element={<Create />} />


                  <Route exact path='/chanle' element={<ChanLe />} />

                  <Route exact path='/layout2' element={<LoginPage />} />

                  <Route path='*' element={<Navigate replace to="/home" />}></Route>
                  {/* <LoginLayoutRoute path="/layout1" component={LoginPage} />   */}
                  {/* <DashboardRoute path="/layout2" component={UserPage} />   */}
                </Routes>
              </Card.Body>
              <Card.Footer className="text-muted">Footer</Card.Footer>
            </Card>

          </Router>
        </Container>
      </>
    );
  }
}

export default App;
