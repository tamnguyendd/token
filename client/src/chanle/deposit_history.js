import React from 'react';
import { Table, Modal, Button, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { mm_util } from '../metamask_components/metamask_utility.js';
import NumberFormat from "react-number-format";
import loading_img from "../loading.gif";
import { sk } from '../socket/socket_uti.js';

class Deposit_History extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            datalist: [],
        };
    }

    async componentDidMount() {
        await this.getList();
    }

    async getList() {
        this.setState({isLoading: true});
        var senderAddress = await mm_util.GetCurrentMM_Address();
        // 1) save to Mongo DB to get payment ID
        var mgoResponse = await fetch(`${process.env.REACT_APP_API_URL}game/deposit_history`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fromAddress: senderAddress
            }),
        });
        var data = await mgoResponse.json();

        if (data && data.length >0 ) {
            this.setState({ datalist: data });
        }

        this.setState({isLoading: false});
    };

    render() {
        var renderContent = <></>;
        if (this.state.isLoading === true) {
            renderContent = <>Please wait!</>
        } else {
            const items = [];
            for (const [index, value] of this.state.datalist.entries()) {
                items.push(
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{value.id}</td>
                        <td>{value.token_symbol}</td>
                        <td className='text-end'>{value.amount}</td>
                        <td>{value.deposit_done ? "○" : "x"}</td>
                        <td>{value.deposit_token_symbol}</td>
                        <td className='text-end'>{value.deposit_amount}</td>
                        <td>{value.deposit_dt}</td>
                    </tr>);
            }

            renderContent =
                <>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>token_order</th>
                                <th>amount</th>
                                <th>deposit_done</th>
                                <th>deposit_token_order</th>
                                <th>deposit_amount</th>
                                <th>deposit_dt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items}
                        </tbody>
                    </Table>
                </>
        }
        return (
            <>
                <h1>Lịch sử nạp tiền</h1>
                {renderContent}
            </>
        );
    }
};


export default Deposit_History