import React from 'react';
import { Table, Modal, Button, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { mm_util } from '../metamask_components/metamask_utility.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faPlus, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import loading_img from "../loading.gif";
import { my_server } from '../common/my_server.js';

class TokenPointRatio extends React.Component {

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
            this.setState({ isLoading: true });

            let data = await my_server.CallServer('token/get_list');
            let tokenList = data[0].list_tokens;

            let token_point = await my_server.CallServer('token/get_list_tokens_points');

            for (const [index, value] of tokenList.entries()) {
                value._Buy_Points = token_point.find(e => e._index === value._index)?._Buy_Points;
                value._Sell_Points =token_point.find(e => e._index === value._index)?._Sell_Points;
            }
            this.setState({ TokenList: tokenList });
            this.setState({ isLoading: false });
        } catch (err) {
            console.log(err);
        }
    }

    async changedForm(index,namestate, value) {
        var list = this.state.TokenList;
        var crData = list[index];
        crData[namestate] = parseFloat(value);
        this.setState({ TokenList: list });
    }
    
    async SaveToDB() {

        await fetch(`${process.env.REACT_APP_API_URL}token/save_token_point_ratio`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                list_tokens: this.state.TokenList
            }),
        });
        //await mgoResponse.json();

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
                items.push(
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='text-start'>1 {value._Symbol}</td>
                        <td>
                            <Form.Group as={Row}>
                                <Col sm={7}>
                                    <Form.Control type="number" className='text-end'
                                        value={value._Buy_Points} 
                                        onChange={(e) => this.changedForm(index, "_Buy_Points", e.target.value)}/>
                                </Col>
                                <Form.Label column sm={2}>
                                    points
                                </Form.Label>
                            </Form.Group>

                        </td>
                        <td>
                            <Form.Group as={Row}>
                                <Col sm={7}>
                                    <Form.Control type="number" className='text-end' 
                                        value={value._Sell_Points}
                                        onChange={(e) => this.changedForm(index, "_Sell_Points", e.target.value)}/>
                                </Col>
                                <Form.Label column sm={2}>
                                    points
                                </Form.Label>
                            </Form.Group>

                        </td>
                    </tr>);
            }

            renderContent =
                <>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Symbol</th>
                                <th>Buy</th>
                                <th>Sell</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items}
                        </tbody>
                    </Table>

                    <div className='text-center'>
                        <Button onClick={() => this.SaveToDB()}>Save To DB<FontAwesomeIcon icon={faArrowsRotate} /></Button>
                    </div>

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
                <h1>1 Token to xxx Points</h1>
                {renderContent}
            </>
        );
    }
};

export default TokenPointRatio  