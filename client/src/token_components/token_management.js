import React from 'react';
import { Table, Modal, Button, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { mm_util } from '../metamask_components/metamask_utility.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faPlus, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import loading_img from "../loading.gif";
import { my_server } from '../common/my_server.js';

class TokenManagement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,

            isShowUpdateModal: false,
            currentUpdateToken: {},

            isShowAddModal: false,
            currentAddToken: {},

            isShowDepositModal: false,
            currentDepositToken: {},

            isSaving: false,

            ToastData: {
                show: false,
                header: "",
                message: "",
                bg: "",
                deplay: 3000
            }
        };
    }

    async componentDidMount() {
        await this.getListToken();
    }

    async getListToken() {
        try {
            // it will wait here untill function a finishes
            var data = await mm_util.ContractMM.methods.number_of_token().call();
            this.setState({ number_of_token: data });

            var tokenList = [];
            for (var i = 0; i < this.state.number_of_token; i++) {
                var token_info = await mm_util.ContractMM.methods.get_token_info(i).call();
                var name = await mm_util.GetTokenContract(token_info[0]).methods.name().call();
                var symbol = await mm_util.GetTokenContract(token_info[0]).methods.symbol().call();

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

            var crAddress = await mm_util.GetCurrentMM_Address();

            var rs = await mm_util.ContractMM.methods.update_token_forpayment(
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

            //alert("Update OK!");
            this.showToast(true);

            console.log(rs);

            //close modal
            this.closeUpdateModal();
        } catch (err) {
            //alert("Update NOT OK!");
            this.showToast(false);
            console.log(err);
            console.log(err.receipt.transactionHash);
            //console.log(await GetTransactionDetail(err.receipt.transactionHash))
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
                    crData._Name = await mm_util.GetTokenContract(value).methods.name().call();
                    crData._Symbol = await mm_util.GetTokenContract(value).methods.symbol().call();
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

            var crAddress = await mm_util.GetCurrentMM_Address();

            var rs = await mm_util.ContractMM.methods.add_new_token_for_payment(
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

            //alert("Add OK!");
            this.showToast(true);

            console.log(rs);

            //close modal
            this.closeAddModal();
        } catch (err) {
            //alert("Add NOT OK!");
            this.showToast(false);
            console.log(err);
        }

        this.setState({ isSaving: false });
    }
    // The End Update Modal

    //3) Deposit Modal
    async closeDepositModal() {
        await this.setState({ isShowDepositModal: false });
        await this.setState({ currentDepositToken: {} });
    };

    async ShowDepositModal(token) {
        var crToken = { ...token };
        crToken._FromAddress = await mm_util.GetCurrentMM_Address();
        crToken._Amount = 0;
        await this.setState({ currentDepositToken: crToken });
        await this.setState({ isShowDepositModal: true });
    }

    changeDepositForm(namestate, value) {
        var crData = this.state.currentDepositToken;
        crData[namestate] = value;
        this.setState({ currentDepositToken: crData });
    }

    async DepositToken() {
        try {
            this.setState({ isSaving: true });

            var token = this.state.currentDepositToken;

            var senderAddress = await mm_util.GetCurrentMM_Address();
            var weiAmount = mm_util.GetToWei(token._Amount, 'ether');

            var approve = await mm_util.GetTokenContract(token._token).methods.approve(mm_util.SM_PAYMENT_ADDRESS, weiAmount)
                .send({
                    from: senderAddress
                });

            console.log(approve);

            var rs = await mm_util.ContractMM.methods.deposit_by_Token(
                token._index,
                token._Amount
            ).send(
                {
                    from: senderAddress
                    //value: web3.utils.toWei($("#txt_Amount").val(), "ether")
                }
            );

            //reload list
            await this.getListToken();

            //alert("Add OK!");
            this.showToast(true);

            console.log(rs);

            //close modal
            this.closeDepositModal();
        } catch (err) {
            //alert("Add NOT OK!");
            this.showToast(false);
            console.log(err);
        }

        this.setState({ isSaving: false });
    }
    // The end Deposit Modal

    async syncListToDB(){

        var mgoResponse = await fetch(`${process.env.REACT_APP_API_URL}token/sync_list_to_db`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                list_tokens: this.state.TokenList
            }),
        });
        var data = await mgoResponse.json();
        console.log(data);
        this.showToast(true);
    }

    closeToast() {
        var toast = this.state.ToastData;
        toast.show = false;
        this.setState({ ToastData: toast });
    }

    showToast(isOK) {
        var toast = this.state.ToastData;
        if (isOK) {
            toast.show = true;
            toast.bg = "info";
            toast.header = "info";
            toast.message = "Susscessfully!";
        } else {
            toast.show = true;
            toast.bg = "danger";
            toast.header = "Error";
            toast.message = "Has some Error!";
        }
        this.setState({ ToastData: toast });
    }

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
                        {/* <td><Button variant="secondary" onClick={async () => await this.ShowDepositModal(value)}>Deposit</Button></td> */}
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
                                {/* <th>Deposit</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {items}
                        </tbody>
                    </Table>

                    <div className='text-center'>
                        <Button onClick={() => this.syncListToDB()}>Sync List To DB<FontAwesomeIcon icon={faArrowsRotate} /></Button>
                    </div>

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

                    {/* Modal Deposit */}
                    <Modal show={this.state.isShowDepositModal}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        onHide={() => this.closeDepositModal()}
                        backdrop="static"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Deposit</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        From
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentDepositToken._FromAddress} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        To
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentDepositToken._token} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Deposit Token
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentDepositToken._Symbol} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Amount
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Form.Control style={{ "textAlign": "right" }}
                                            type="number"
                                            value={this.state.currentDepositToken._Amount}
                                            onChange={(e) => this.changeDepositForm("_Amount", e.target.value)} />
                                    </Col>
                                </Form.Group>

                            </Form>
                        </Modal.Body>
                        <Modal.Footer className='text-center'>
                            <Button variant="secondary" onClick={() => this.closeDepositModal()}>
                                Close
                            </Button>

                            {
                                this.state.isSaving ?
                                    <img src={loading_img} className="loading_img" alt="loading..." /> :
                                    <Button variant="primary" onClick={() => this.DepositToken()}>
                                        Deposit
                                    </Button>
                            }

                        </Modal.Footer>
                    </Modal>

                    <ToastContainer className="p-3" position="top-center" style={{ zIndex: '1100' }} >
                        <Toast bg={this.state.ToastData.bg}
                            show={this.state.ToastData.show}
                            deplay={this.state.ToastData.deplay}
                            autohide
                            onClose={() => this.closeToast()}
                        >
                            <Toast.Header>
                                <strong className="me-auto">{this.state.ToastData.header}</strong>
                            </Toast.Header>
                            <Toast.Body>{this.state.ToastData.message}</Toast.Body>
                        </Toast>
                    </ToastContainer>
                </>
        }
        return (
            <>
                <h1>List Tokens</h1>
                {renderContent}
            </>
        );
    }
};

export default TokenManagement  