import React from 'react';
import { Table, Modal, Button, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { mm_util } from '../metamask_components/metamask_utility.js';
import NumberFormat from "react-number-format";
import loading_img from "../loading.gif";

class SmartContractTokenAsset extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,

            isShowWithdrawModal: false,
            currentWithdrawToken: {},

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
            var crMetamaskAddress = await mm_util.GetCurrentMM_Address();

            var tokenList = [];
            tokenList.push({
                _index: -1,
                _token: process.env.REACT_APP_BLOCKCHAIN_NET,
                _Name: process.env.REACT_APP_BLOCKCHAIN_NET,
                _Symbol: process.env.REACT_APP_BLOCKCHAIN_NET,
                _Balance: await mm_util.GetDefaultBalance(mm_util.SM_PAYMENT_ADDRESS)
            });

            for (var i = 0; i < this.state.number_of_token; i++) {
                var token_info = await mm_util.ContractMM.methods.get_token_info(i).call();
                var name = await mm_util.GetTokenContract(token_info[0]).methods.name().call();
                var symbol = await mm_util.GetTokenContract(token_info[0]).methods.symbol().call();
                var balance = await mm_util.GetTokenContract(token_info[0]).methods.balanceOf(mm_util.SM_PAYMENT_ADDRESS).call();
                var token = {
                    _index: i,
                    _token: token_info[0],
                    _Name: name,
                    _Symbol: symbol,
                    _Balance: mm_util.GetToEth(balance),
                    _status_Buy: token_info[1],
                    _status_Sell: token_info[2],
                    _Ratio_Buy: token_info[3],
                    _Ratio_Sell: token_info[4]
                }
                tokenList.push(token);
            }

            this.setState({ TokenList: tokenList });
            this.setState({ isLoading: false });
        } catch (err) {

            console.log(err);
        }
    }

    //1) Withdraw Modal
    async closeWithdrawModal() {
        await this.setState({ isShowWithdrawModal: false });
    };

    async ShowWithdrawModal(token) {
        var crToken = { ...token };
        crToken._All = false;
        crToken._Amount = 0;
        await this.setState({ currentWithdrawToken: crToken });
        await this.setState({ isShowWithdrawModal: true });
    }

    changeWithdrawForm(namestate, value) {
        var crData = this.state.currentWithdrawToken;
        crData[namestate] = value;
        if (namestate === "_All" && value === true) {
            crData._Amount = crData._Balance;
        }
        this.setState({ currentWithdrawToken: crData });
    }

    async WithdrawToken() {
        try {
            this.setState({ isSaving: true });

            var crSelectedData = this.state.currentWithdrawToken;

            var senderAddress = await mm_util.GetCurrentMM_Address();
            var weiAmount = mm_util.GetToWei(crSelectedData._Amount);

            if (crSelectedData._index === -1) { //withdraw default mainnet coin

                // withdraw all
                if (crSelectedData._All == true) {
                    await mm_util.ContractMM.methods.withdraw_default_aLL()
                        .send({ from: senderAddress });
                } else {
                    await mm_util.ContractMM.methods.withdraw_default(weiAmount)
                    .send({ from: senderAddress });
                }
            } else {
                // withdraw token

                // withdraw all tokens
                if (crSelectedData._All == true) {
                    await mm_util.ContractMM.methods.withdraw_token_all(crSelectedData._index)
                        .send({ from: senderAddress });
                }else {
                    await mm_util.ContractMM.methods.withdraw_token(crSelectedData._index, weiAmount)
                    .send({ from: senderAddress });
                }
            }

            //reload list
            await this.getListToken();

            //alert("Add OK!");
            this.showToast(true);

            //close modal
            await this.closeWithdrawModal();
        } catch (err) {
            //alert("Add NOT OK!");
            this.showToast(false);
            console.log(err);
        }

        this.setState({ isSaving: false });
    }
    // The end Withdraw Modal

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

                        <td className='text-end'>
                            <NumberFormat value={value._Balance}
                                decimalSeparator="."
                                displayType="text"
                                type="text"
                                thousandSeparator={true}
                                allowNegative={true} />
                        </td>
                        <td>{value._Symbol}</td>
                        <td>
                            <Button variant="primary" onClick={(e) => this.ShowWithdrawModal(value)}>Withdraw</Button>
                        </td>
                    </tr>);
            }

            renderContent =
                <>
                    <h1>SmartContract Assets</h1>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Balance</th>
                                <th>Symbol</th>
                                <th>withdraw</th>

                            </tr>
                        </thead>
                        <tbody>
                            {items}
                        </tbody>
                    </Table>

                    {/* Modal Withdraw */}
                    <Modal show={this.state.isShowWithdrawModal}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        onHide={() => this.closeWithdrawModal()}
                        backdrop="static"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Withdraw</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>
                                        Amount
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Form.Control style={{ "textAlign": "right" }}
                                            type="number"
                                            value={this.state.currentWithdrawToken._Amount}
                                            onChange={(e) => this.changeWithdrawForm("_Amount", e.target.value)}
                                            disabled={this.state.currentWithdrawToken._All} />

                                    </Col>
                                    <Col sm={2}>
                                        <Form.Check type="checkbox" label="All"
                                            checked={this.state.currentWithdrawToken._All}
                                            onChange={(event) => this.changeWithdrawForm("_All", event.target.checked)} />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer className='text-center'>
                            <Button variant="secondary" onClick={() => this.closeWithdrawModal()}>
                                Close
                            </Button>

                            {
                                this.state.isSaving ?
                                    <img src={loading_img} className="loading_img" alt="loading..." /> :
                                    <Button variant="primary" onClick={() => this.WithdrawToken()}>
                                        Withdraw
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

export default SmartContractTokenAsset