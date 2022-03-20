import React from 'react';
import { Table, Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { ContractMM, TokenContract, GetCurrentMM_Address } from '../metamask_components/metamask_utility.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import loading_img from "../loading.gif";

class ListToken extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,

            isShowUpdateModal: false,
            currentUpdateToken: {},

            isShowAddModal: false,
            currentAddToken: {},

            isSaving: false
        };
    }

    async componentDidMount() {
        await this.getListToken();
    }

    async getListToken() {
        try {
            // it will wait here untill function a finishes
            var data = await ContractMM.methods.number_of_token().call();
            this.setState({ number_of_token: data });

            var tokenList = [];
            for (var i = 0; i < this.state.number_of_token; i++) {
                var token_info = await ContractMM.methods.get_token_info(i).call();
                var name = await TokenContract(token_info[0]).methods.name().call();
                var symbol = await TokenContract(token_info[0]).methods.symbol().call();

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

    // 1) Update Modal
    closeUpdateModal() {
        this.setState({ isShowUpdateModal: false });
    };

    showUpdateModal(token) {
        this.setState({ currentUpdateToken: { ...token } });
        this.setState({ isShowUpdateModal: true });
        this.setState({ isSaving: false });
    };

    // These methods will update the state properties.
    changeUpdateForm(namestate, value) {
        var crData = this.state.currentUpdateToken;
        crData[namestate] = value;
        this.setState({ currentUpdateToken: crData });
    }

    async SaveUpdate() {

        this.setState({ isSaving: true });

        try {
            var token = this.state.currentUpdateToken;

            var crAddress = await GetCurrentMM_Address();

            var rs = await ContractMM.methods.update_token_forpayment(
                token._index,
                token._status_Buy,
                token._status_Sell,
                token._Ratio_Buy,
                token._Ratio_Sell
            ).send(
                {
                    from: crAddress
                    //value: web3.utils.toWei($("#txt_Amount").val(), "ether")
                }
            );

            //reload list
            await this.getListToken();

            alert("Update OK!");

            console.log(rs);

            //close modal
            this.closeUpdateModal();
        } catch (err) {
            alert("Update NOT OK!");
            console.log(err);
        }

        this.setState({ isSaving: false });
    };
    // The End Update Modal

    // 2) Add Modal
    closeAddModal() {
        this.setState({ isShowAddModal: false });
    };

    async showAddModal() {

        this.setState({
            currentAddToken: {
                _index: -1,
                _token: "",
                _Name: "",
                _Symbol: "",
                _status_Buy: false,
                _status_Sell: false,
                _Ratio_Buy: 100,
                _Ratio_Sell: 110
            }
        }, () => {
            setTimeout(() => { this._token && this._token.focus() }, 1); // auto focus
        });

        this.setState({ isShowAddModal: true });

        this.setState({ isSaving: false });
    };

    async changeAddForm(namestate, value) {
        var crData = this.state.currentAddToken;
        crData[namestate] = value;

        // get token name, symbol
        if (namestate === "_token") {
            crData._Name = "";
            crData._Symbol = "";

            try {
                if (value) {
                    crData._Name = await TokenContract(value).methods.name().call();
                    crData._Symbol = await TokenContract(value).methods.symbol().call();
                }
            } catch (err) {
                console.log(err);
            }
        }

        this.setState({ currentAddToken: crData });
    }

    async SaveAdd() {
        try {
            this.setState({ isSaving: true });

            var token = this.state.currentAddToken;

            var crAddress = await GetCurrentMM_Address();

            var rs = await ContractMM.methods.add_new_token_for_payment(
                token._token,
                token._status_Buy,
                token._status_Sell,
                token._Ratio_Buy,
                token._Ratio_Sell
            ).send(
                {
                    from: crAddress
                    //value: web3.utils.toWei($("#txt_Amount").val(), "ether")
                }
            );

            //reload list
            await this.getListToken();

            alert("Add OK!");

            console.log(rs);

            //close modal
            this.closeAddModal();
        } catch (err) {
            alert("Add NOT OK!");
            console.log(err);
        }

        this.setState({ isSaving: false });
    }
    // The End Update Modal

    render() {

        var renderContent = <></>;
        if (this.state.isLoading === true) {
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
                        <td>{value._status_Buy === true ? "O" : "X"}</td>
                        <td>{value._status_Sell === true ? "O" : "X"}</td>
                        <td>{value._Ratio_Buy}</td>
                        <td>{value._Ratio_Sell}</td>
                        <td><Button onClick={() => this.showUpdateModal(value)} ><FontAwesomeIcon icon={faPenToSquare} /></Button></td>
                        <td><Button variant="secondary"><FontAwesomeIcon icon={faTrashCan} /></Button></td>
                    </tr>);
            }

            renderContent =
                <>
                    <div className='text-start'>
                        <Button onClick={() => this.showAddModal()}>Add Token <FontAwesomeIcon icon={faPlus} /></Button>
                    </div>

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

                    {/* Modal Update */}
                    <Modal show={this.state.isShowUpdateModal}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        onHide={(() => this.closeUpdateModal())}
                        backdrop="static"
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
                                            onChange={(event) => this.changeUpdateForm("_status_Buy", event.target.checked)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={{ span: 10, offset: 2 }}>
                                        <Form.Check label="Status Sell"
                                            checked={this.state.currentUpdateToken._status_Sell}
                                            onChange={(e) => this.changeUpdateForm("_status_Sell", e.target.checked)} />
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
                                            onChange={(e) => this.changeUpdateForm("_Ratio_Buy", e.target.value)} />
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
                                            onChange={(e) => this.changeUpdateForm("_Ratio_Sell", e.target.value)} />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer className='text-center'>
                            <Button variant="secondary" onClick={() => this.closeUpdateModal()}>
                                Close
                            </Button>

                            {
                                this.state.isSaving ?
                                    <img src={loading_img} className="loading_img" alt="loading..." /> :
                                    <Button variant="primary" onClick={() => this.SaveUpdate()}>
                                        Save Changes
                                    </Button>
                            }

                        </Modal.Footer>
                    </Modal>

                    {/* Modal Add */}
                    <Modal show={this.state.isShowAddModal}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        onHide={() => this.closeAddModal()}
                        backdrop="static"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Add</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Address
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentAddToken._token}
                                            ref={(_token) => { this._token = _token; }}
                                            onChange={(event) => this.changeAddForm("_token", event.target.value)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Name
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentAddToken._Name} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Symbol
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentAddToken._Symbol} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={{ span: 10, offset: 2 }}>
                                        <Form.Check label="Status Buy"
                                            checked={this.state.currentAddToken._status_Buy}
                                            onChange={(event) => this.changeAddForm("_status_Buy", event.target.checked)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Col sm={{ span: 10, offset: 2 }}>
                                        <Form.Check label="Status Sell"
                                            checked={this.state.currentAddToken._status_Sell}
                                            onChange={(e) => this.changeAddForm("_status_Sell", e.target.checked)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Ratio Buy
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Form.Control style={{ "textAlign": "right" }}
                                            type="number"
                                            value={this.state.currentAddToken._Ratio_Buy}
                                            onChange={(e) => this.changeAddForm("_Ratio_Buy", e.target.value)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Ratio Buy
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Form.Control style={{ "textAlign": "right" }}
                                            type="number"
                                            value={this.state.currentAddToken._Ratio_Sell}
                                            onChange={(e) => this.changeAddForm("_Ratio_Sell", e.target.value)} />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer className='text-center'>
                            <Button variant="secondary" onClick={() => this.closeAddModal()}>
                                Close
                            </Button>

                            {
                                this.state.isSaving ?
                                    <img src={loading_img} className="loading_img" alt="loading..." /> :
                                    <Button variant="primary" onClick={() => this.SaveAdd()}>
                                        Save Changes
                                    </Button>
                            }

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