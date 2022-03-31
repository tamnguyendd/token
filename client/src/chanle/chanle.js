import React from 'react';
import { Table, Modal, Button, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { mm_util } from '../metamask_components/metamask_utility.js';
import NumberFormat from "react-number-format";
import loading_img from "../loading.gif";
import { sk } from '../socket/socket_uti.js';



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
            }
        };

        sk.Get_socket_obj().on("receive_message", (data) => {
            console.log(data);
            this.updateScreen();
        });
    }

    updateScreen(){
        console.log("updateScreen");
    };

    //1) Deposit Modal(Send to SM)
    async closeDepositModal() {
        await this.setState({ isShowDepositModal: false });
    };

    async ShowDepositModal() {
        var crToken = {};
        crToken._Amount = 0;

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
        this.setState({ currentDepositToken: crData });
    }

    async DepositToken() {
        try {
            this.setState({ isSaving: true });

            var token = this.state.currentDepositToken;

            var senderAddress = await mm_util.GetCurrentMM_Address();
            var weiAmount = mm_util.GetToWei(token._Amount);

            // 1) save to Mongo DB to get payment ID
            var mgoResponse = await fetch(`${process.env.REACT_APP_API_URL}game/naptien`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fromAddress: senderAddress,
                    amount: token._Amount
                }),
            });

            if (!mgoResponse.ok) {
                this.showToast(false);
                console.log(mgoResponse.statusText);
                return;
            }

            var _id = await mgoResponse.json();
            console.log(_id);

            // // 2) metamask approval ( Trong truong hop voi Token)
            // var approve = await GetTokenContract(token._token).methods.approve(SM_PAYMENT_ADDRESS, weiAmount)
            //     .send({
            //         from: senderAddress
            //     });

            // console.log(approve);

            // 3) call smart contract
            var rs = await mm_util.ContractMM.methods.nap_tien(
                _id
            ).send(
                {
                    from: senderAddress,
                    value: weiAmount
                }
            );

            //reload list
            //await this.getListToken();

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

        return (
            <>
                <Button variant="primary" onClick={async () => await this.ShowDepositModal()}>Nạp Tiền {sk.Get_socket_id()}</Button>
                {/* <Card>
                    <Card.Body>
                        <Card.Title>Coin {this.props.number}</Card.Title>
                        <Card.Text>
                            Price: <strong>{this.props.price} ETH</strong> {process.env.REACT_APP_API_KEY}
                        </Card.Text>
                        <div className='text-center'>
                            <Button variant="primary" >Buy Now</Button>
                        </div>
                    </Card.Body>
                </Card> */}

                {/* Modal Send to SM */}
                <Modal show={this.state.isShowDepositModal}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    onHide={async () => await this.closeDepositModal()}
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Nạp Tiền</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={2}>
                                    Số lượng
                                </Form.Label>
                                <Col sm={3}>
                                    <Form.Control style={{ "textAlign": "right" }}
                                        type="number"
                                        value={this.state.currentDepositToken._Amount}
                                        ref={(_AmountFocus) => { this._AmountFocus = _AmountFocus; }}
                                        onChange={(e) => this.changeDepositForm("_Amount", e.target.value)} />
                                </Col>
                            </Form.Group>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer className='text-center'>
                        <Button variant="secondary" onClick={async () => this.closeDepositModal()}>
                            Thoát
                        </Button>

                        {
                            this.state.isSaving ?
                                <img src={loading_img} className="loading_img" alt="loading..." /> :
                                <Button variant="primary" onClick={() => this.DepositToken()}>
                                    Tiếp tục
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