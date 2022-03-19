import React from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
class AddToken extends React.Component {

    render() {

        return (
            <Card>
                <Card.Body>
                    <Card.Title>Coin {this.props.number}</Card.Title>
                    <Card.Text>
                        Price: <strong>{this.props.price} ETH</strong> {process.env.REACT_APP_API_KEY}
                    </Card.Text>
                    <div className='text-center'>
                        <Button variant="primary" >Buy Now</Button>
                    </div>
                </Card.Body>
            </Card>
        );
    }
};


export default AddToken  