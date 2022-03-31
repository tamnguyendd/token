import React from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import Web3 from 'web3';

import MetamaskValue from './metamask_components/MetamaskValue.js'

class Item extends React.Component {

    render() {

        const ABI = MetamaskValue.ABI;
        
        const addressMM = MetamaskValue.ADDRESS;

        const buyNow = () => {
            const web3 = new Web3(window.ethereum);
            var contractMM = new web3.eth.Contract(ABI, addressMM);

            if (this.props.MetaMaskAddress != null) {
                contractMM.methods.ThanhToanTien(this.props.number).send(
                    {
                        from: this.props.MetaMaskAddress,
                        value: web3.utils.toWei(this.props.price+"", "ether")
                    });
            } else {
                alert("please login meta mask first, thank you");
            }
        }

        return (
            <Card style={{ width: '18rem' }}>
                <Card.Img variant="top" width={150} height={150} src={`./images/coin.png`} />
                <Card.Body>
                    <Card.Title>Coin {this.props.number}</Card.Title>
                    <Card.Text>
                        Price: <strong>{this.props.price} ETH</strong> {process.env.REACT_APP_API_KEY}
                    </Card.Text>
                    <div className='text-center'>
                        <Button variant="primary" onClick={buyNow}>Buy Now</Button>
                    </div>
                </Card.Body>
            </Card>
        );
    }
};


class ListItems extends React.Component {
    render() {

        var items = [];
        for (var i = 1; i <= 10; i++) {
            items.push(<Item key={i} MetaMaskAddress={this.props.MetaMaskAddress} number={i} price={0.001 * i} />);
        }

        return (
            <Row xs={1} md={4} className="g-4">
                {items.map((item, i) => (
                    <Col key={i}>
                        {item}
                    </Col>
                ))}
            </Row>
        );
    }
};

export default ListItems  