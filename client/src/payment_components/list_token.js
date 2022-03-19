import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Form, Card, Row, Col } from 'react-bootstrap';
import { ContractMM, TokenContract } from '../metamask_components/metamask_utility.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

class ListToken extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isShowModel: false,
            currentUpdateToken: {}
        };
    }

    async componentDidMount() {
        try {
            // it will wait here untill function a finishes
            var data = await ContractMM.methods.number_of_token().call();
            this.setState({ number_of_token: data });

            var tokenList = [];
            for (var i = 0; i < this.state.number_of_token; i++) {
                var token_info = await ContractMM.methods.get_token_info(i).call();
                var symbol = await TokenContract(token_info[0]).methods.symbol().call();
                var name = await TokenContract(token_info[0]).methods.name().call();

                var token = {
                    _index: i,
                    _token: token_info[0],
                    _Name: name,
                    _Symbol: symbol,
                    _status_Buy: token_info[1],
                    _status_Sell: token_info[2],
                    _Ratio_Buy: token_info[3],
                    _Ratio_Sell: token_info[4]
                }
                tokenList.push(token);
                // console.log(token_info);
                // console.log(symbol);
            }

            this.setState({ TokenList: tokenList });
            this.setState({ isLoading: false });
        } catch (err) {

            console.log(err);
        }
    }

    render() {

        const closeModal = () => {
            this.setState({ isShowModel: false });
        };

        const showModal = (token) => {
            this.setState({ currentUpdateToken: { ...token } });
            this.setState({ isShowModel: true });
        };

        // These methods will update the state properties.
        const updateForm = (namestate, value) => {
            var crData = this.state.currentUpdateToken;
            crData[namestate] = value;
            this.setState({ currentUpdateToken: crData });
        }

        var renderContent = <></>;
        if (this.state.isLoading == true) {
            renderContent = <>Please wait!</>
        } else {
            const items = [];
            for (const [index, value] of this.state.TokenList.entries()) {
                //items.push(<div key={index}>{value._token} / {value._Name} / {value._Symbol}</div>)
                items.push(
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{value._token}</td>
                        <td>{value._Name}</td>
                        <td>{value._Symbol}</td>
                        <td>{value._status_Buy == true ? "O" : "X"}</td>
                        <td>{value._status_Sell == true ? "O" : "X"}</td>
                        <td>{value._Ratio_Buy}</td>
                        <td>{value._Ratio_Sell}</td>
                        <td><Button onClick={() => showModal(value)} ><FontAwesomeIcon icon={faPenToSquare} /></Button></td>
                        <td><Button variant="secondary"><FontAwesomeIcon icon={faTrashCan} /></Button></td>
                    </tr>);
            }

            renderContent =
                <>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Address</th>
                                <th>Name</th>
                                <th>Symbol</th>
                                <th>Status Buy</th>
                                <th>Status Sell</th>
                                <th>Ratio Buy</th>
                                <th>Ratio Sell</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items}
                        </tbody>
                    </Table>

                    <Modal show={this.state.isShowModel} 
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Update</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Address
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentUpdateToken._token} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Name
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentUpdateToken._Name} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Symbol
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentUpdateToken._Symbol} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={{ span: 10, offset: 2 }}>
                                        <Form.Check label="Status Buy"
                                            checked={this.state.currentUpdateToken._status_Buy}
                                            onChange={(event) => updateForm("_status_Buy", event.target.checked)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={{ span: 10, offset: 2 }}>
                                        <Form.Check label="Status Sell"
                                            checked={this.state.currentUpdateToken._status_Sell}
                                            onChange={(e) => updateForm("_status_Sell", e.target.checked)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Ratio Buy
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Form.Control style={{ "textAlign": "right" }}
                                            type="number"
                                            value={this.state.currentUpdateToken._Ratio_Buy}
                                            onChange={(e) => updateForm("_Ratio_Buy", e.target.value)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Ratio Buy
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Form.Control style={{ "textAlign": "right" }}
                                            type="number"
                                            value={this.state.currentUpdateToken._Ratio_Sell}
                                            onChange={(e) => updateForm("_Ratio_Sell", e.target.value)} />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer className='text-center'>
                            <Button variant="secondary" onClick={closeModal}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={closeModal}>
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
        }
        return (
            <>
                {renderContent}
            </>
        );
    }
};


export default ListToken  