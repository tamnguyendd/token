import React from 'react';
import { Table, Modal, Button, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { SM_PAYMENT_ADDRESS, ContractMM, GetTokenContract, GetCurrentMM_Address, GetToWei, GetToEth } from '../metamask_components/metamask_utility.js';
import NumberFormat from "react-number-format";
import loading_img from "../loading.gif";

class MyTokenAsset extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,

            isShowDepositModal: false,
            currentDepositToken: {},

            isShowTransferModal: false,
            currentTranferToken: {},

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
            var data = await ContractMM.methods.number_of_token().call();
            this.setState({ number_of_token: data });
            var crMetamaskAddress = await GetCurrentMM_Address();

            var tokenList = [];
            for (var i = 0; i < this.state.number_of_token; i++) {
                var token_info = await ContractMM.methods.get_token_info(i).call();
                var name = await GetTokenContract(token_info[0]).methods.name().call();
                var symbol = await GetTokenContract(token_info[0]).methods.symbol().call();
                var balance = await GetTokenContract(token_info[0]).methods.balanceOf(crMetamaskAddress).call();
                var token = {
                    _index: i,
                    _token: token_info[0],
                    _Name: name,
                    _Symbol: symbol,
                    _Balance: GetToEth(balance),
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

    //1) Deposit Modal(Send to SM)
    async closeDepositModal() {
        await this.setState({
            currentDepositToken: {},
            isShowDepositModal: false
        });
        //await this.setState({ isShowDepositModal: false });
    };

    async ShowDepositModal(token) {
        var crToken = { ...token };
        crToken._FromAddress = await GetCurrentMM_Address();
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

            var senderAddress = await GetCurrentMM_Address();
            var toAddress = SM_PAYMENT_ADDRESS;
            var weiAmount = GetToWei(token._Amount);

            // 1) save to Mongo DB to get payment ID
            var mgoResponse = await fetch(`${process.env.REACT_APP_API_URL}token/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fromAddress: senderAddress,
                    toAddress: toAddress,
                    amount: token._Amount
                }),
            });

            if (!mgoResponse.ok) {
                this.showToast(false);
                console.log(mgoResponse.statusText);
                return;
            }

            var paymentID = await mgoResponse.json();
            console.log(paymentID);

            // 2) metamask approval
            var approve = await GetTokenContract(token._token).methods.approve(SM_PAYMENT_ADDRESS, weiAmount)
                .send({
                    from: senderAddress
                });

            console.log(approve);

            // 3) call smart contract
            var rs = await ContractMM.methods.deposit_by_Token(
                paymentID,
                token._index,
                weiAmount
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
            await this.closeDepositModal();
        } catch (err) {
            //alert("Add NOT OK!");
            this.showToast(false);
            console.log(err);
        }

        this.setState({ isSaving: false });
    }
    // The end Deposit Modal

    //2) Transfer
    async closeTransferModal() {
        await this.setState({ isShowTransferModal: false });
        await this.setState({ currentTranferToken: {} });
    }

    async ShowTransferModal(token) {
        var crToken = { ...token };
        crToken._FromAddress = await GetCurrentMM_Address();
        crToken._ToAddress = "";
        crToken._Amount = 0;
        await this.setState({ currentTranferToken: crToken });
        await this.setState({ isShowTransferModal: true });
    }

    async changeTransferForm(namestate, value) {
        var crData = this.state.currentTranferToken;
        crData[namestate] = value;
        await this.setState({ currentTranferToken: crData });
    }

    async TransferToken() {
        try {
            this.setState({ isSaving: true });

            var token = this.state.currentTranferToken;

            var senderAddress = await GetCurrentMM_Address();
            var weiAmount = GetToWei(token._Amount);

            var transfer = await GetTokenContract(token._token).methods.transfer(token._ToAddress, weiAmount)
                .send({
                    from: senderAddress
                });

            console.log(transfer);

            //reload list
            await this.getListToken();

            //alert("Add OK!");
            this.showToast(true);

            //close modal
            await this.closeTransferModal();
        } catch (err) {
            //alert("Add NOT OK!");
            this.showToast(false);
            console.log(err);
        }

        this.setState({ isSaving: false });
    }
    // The end Transfer Modal

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
                        <td>{value._Symbol}</td>
                        <td>
                            <NumberFormat value={value._Balance}
                                decimalSeparator="."
                                displayType="text"
                                type="text"
                                thousandSeparator={true}
                                allowNegative={true} />
                        </td>
                        <td>
                            <Button variant="primary" onClick={async () => await this.ShowDepositModal(value)}>Send to SM</Button>&nbsp;
                            <Button variant="primary" onClick={async () => await this.ShowTransferModal(value)}>Transfer</Button>
                        </td>
                    </tr>);
            }

            renderContent =
                <>
                    <h1>My Assets</h1>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Symbol</th>
                                <th>Balance</th>
                                <th></th>

                            </tr>
                        </thead>
                        <tbody>
                            {items}
                        </tbody>
                    </Table>

                    {/* Modal Send to SM */}
                    <Modal show={this.state.isShowDepositModal}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        onHide={async () => await this.closeDepositModal()}
                        backdrop="static"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Send to SM</Modal.Title>
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
                                        Token
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
                            <Button variant="secondary" onClick={async () => await this.closeDepositModal()}>
                                Close
                            </Button>

                            {
                                this.state.isSaving ?
                                    <img src={loading_img} className="loading_img" alt="loading..." /> :
                                    <Button variant="primary" onClick={() => this.DepositToken()}>
                                        Send
                                    </Button>
                            }

                        </Modal.Footer>
                    </Modal>

                    {/* Modal Transfer */}
                    <Modal show={this.state.isShowTransferModal}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        onHide={() => this.closeTransferModal()}
                        backdrop="static"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Transfer</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        From
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control value={this.state.currentTranferToken._FromAddress} disabled />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        To
                                    </Form.Label>
                                    <Col sm={10}>
                                        <Form.Control
                                            value={this.state.currentTranferToken._ToAddress}
                                            onChange={(e) => this.changeTransferForm("_ToAddress", e.target.value)} />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Amount
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Form.Control style={{ "textAlign": "right" }}
                                            type="number"
                                            value={this.state.currentTranferToken._Amount}
                                            onChange={(e) => this.changeTransferForm("_Amount", e.target.value)} />
                                    </Col>
                                </Form.Group>

                            </Form>
                        </Modal.Body>
                        <Modal.Footer className='text-center'>
                            <Button variant="secondary" onClick={() => this.closeTransferModal()}>
                                Close
                            </Button>

                            {
                                this.state.isSaving ?
                                    <img src={loading_img} className="loading_img" alt="loading..." /> :
                                    <Button variant="primary" onClick={() => this.TransferToken()}>
                                        Transfer
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
                {renderContent}
            </>
        );
    }
};

export default MyTokenAsset  