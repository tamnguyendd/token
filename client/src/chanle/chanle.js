import React, { Fragment } from 'react';
import { Table, Modal, Button, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { mm_util } from '../metamask_components/metamask_utility.js';
import NumberFormat from "react-number-format";
import loading_img from "../loading.gif";
import { sk } from '../socket/socket_uti.js';
import { my_server } from '../common/my_server.js';

class ChanLe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,

            isShowDepositModal: false,
            currentDepositToken: {},

            isSaving: false,

            ToastData: {
                show: false,
                header: "",
                message: "",
                bg: "",
                deplay: 3000
            },

            balance_points: 0,

            token_ddl_data: []
        };
    }

    async componentDidMount() {
        await this.getDataForTokenDropdown();

        let balance = await my_server.CallServer('game/get_received_points',
            { fromAddress: await mm_util.GetCurrentMM_Address() });

        this.setState({ balance_points: new Intl.NumberFormat().format(balance) });

        sk.Get_socket_obj().on("receive_message", async (data) => {
            await this.updateScreen(data);
        });
    }

    async componentWillUnmount() {
        this.setState({ token_ddl_data: [] });

        this.setState({ balance_points: "" });
    }

    async getDataForTokenDropdown() {
        let data = await my_server.CallServer('token/get_list');
        this.setState({ token_ddl_data: data[0].list_tokens });
    }

    async updateScreen(message) {
        await this.setState({ balance_points: new Intl.NumberFormat().format(message) });
        //console.log(message);
    };

    //1) Deposit Modal(Send to SM)
    async closeDepositModal() {
        await this.setState({ isShowDepositModal: false });
    };

    async ShowDepositModal() {
        var crToken = {};
        crToken._Amount = 0;
        crToken._index = -1;
        crToken._token = {};
        await this.setState({
            currentDepositToken: crToken,
        });

        await this.setState({ isShowDepositModal: true }, () => {
            setTimeout(() => { this._AmountFocus && this._AmountFocus.focus() }, 1); // auto focus
        });

        await sk.Join_Room_Socket(await mm_util.GetCurrentMM_Address());
    }

    changeDepositForm(namestate, value) {
        var crData = this.state.currentDepositToken;
        crData[namestate] = value;
        if (namestate == "_index" && value != -1) {
            crData._token = this.state.token_ddl_data.find(e => e._index == value)._token;
        }
        this.setState({ currentDepositToken: crData });
    }

    async DepositToken() {
        try {
            this.setState({ isSaving: true });

            var token = this.state.currentDepositToken;

            var senderAddress = await mm_util.GetCurrentMM_Address();
            var weiAmount = mm_util.GetToWei(token._Amount);

            // 1) save to Mongo DB to get payment ID
            var mgoResponse = await fetch(`${process.env.REACT_APP_API_URL}game/deposit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fromAddress: senderAddress,
                    amount: parseFloat(token._Amount),
                    token_order: token._index
                }),
            });

            if (!mgoResponse.ok) {
                this.showToast(false);
                console.log(mgoResponse.statusText);
                return;
            }

            var _id = await mgoResponse.json();
            console.log(_id);

            if (token._index == -1) { // nap bang dong mac dinh cua mainnet(BNB / ETH)
                await mm_util.ContractMM.methods.deposit_by_default(
                    _id
                ).send(
                    {
                        from: senderAddress,
                        value: weiAmount
                    }
                );
            } else {
                // nap bang token
                // can appval truoc roi moi gui den SM
                await mm_util.GetTokenContract(token._token).methods.approve(mm_util.SM_PAYMENT_ADDRESS, weiAmount)
                    .send({
                        from: senderAddress
                    });

                //call smart contract
                await mm_util.ContractMM.methods.deposit_by_token(
                    _id,
                    token._index,
                    weiAmount
                ).send(
                    {
                        from: senderAddress
                    }
                );
            }

            //alert("Add OK!");
            this.showToast(true);

            //console.log(rs);

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

        let ddldatahtml = [];
        if (this.state.token_ddl_data) {
            for (const [index, value] of this.state.token_ddl_data.entries()) {
                ddldatahtml.push(<option key={index} value={value._index}>{value._Symbol}</option>);
            }
        }

        return (
            <>
                <Button variant="primary" onClick={async () => await this.ShowDepositModal()}>Deposit</Button>
                <br/><a href='./deposit_history' target={'_blank'}>History</a>
                <div>Balance: {this.state.balance_points} points</div>
                <a href='./deposit_history' target={'_blank'}>Withdraw</a>

                {/* Modal Send to SM */}
                <Modal show={this.state.isShowDepositModal}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    onHide={async () => await this.closeDepositModal()}
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Deposit</Modal.Title>
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
                                        value={this.state.currentDepositToken._Amount}
                                        ref={(_AmountFocus) => { this._AmountFocus = _AmountFocus; }}
                                        onChange={(e) => this.changeDepositForm("_Amount", e.target.value)} />
                                </Col>
                                <Col sm={3}>
                                    <Form.Select onChange={(e) => this.changeDepositForm("_index", e.target.value)}>
                                        {ddldatahtml}
                                    </Form.Select>
                                </Col>
                            </Form.Group>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer className='text-center'>
                        <Button variant="secondary" onClick={async () => this.closeDepositModal()}>
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

                {/* Toast */}
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
        );
    }
};


export default ChanLe  