// This will help us connect to the database
const dbo = require("../db/conn");
const MetamaskUtil = require("../metamask/metamask_utility");

module.exports = {
    Get_game_do_NOT_deposit_YET: async function () {
        const dbIds = await this.Get_ID_NOT_deposit_YET();
        const deposit_by_default_logIds = await MetamaskUtil.ChuBaoVe_Get_event_deposit_by_default_log(dbIds);
        const deposit_by_token_logIds = await MetamaskUtil.ChuBaoVe_Get_event_deposit_by_token_log(dbIds);

        let depositdata = deposit_by_default_logIds.concat(deposit_by_token_logIds);
        // console.log("deposit_by_default_logIds");
        // console.log(dbIds);
        // console.log(deposit_by_default_logIds);
        // console.log(deposit_by_token_logIds);
        await this.Update_deposit_Done(depositdata);
    },

    Get_ID_NOT_deposit_YET: async function () {
        const db_connect = dbo.getDb();
        const rs = await db_connect
            .collection("game_deposit")
            .find({
                "deposit_history": {
                    $exists: true,
                    $ne: [],
                    //$elemMatch: { "value": { $exists: false } }
                    $elemMatch: {
                        $or: [{ "deposit_done": { $exists: false } },
                        { "deposit_done": { $exists: true, $ne: true } }]
                    }
                }
            })
            .toArray();

        const ids = [];
        //console.log(rs);
        for (var idx = 0; idx < rs.length; idx++) {
            var doc = rs[idx];
            if (doc.deposit_history) {
                //console.log(doc.deposit_history[1]);
                for (var ntidx = 0; ntidx < doc.deposit_history.length; ntidx++) {
                    var history = doc.deposit_history[ntidx];
                    if (!history.deposit_done) {
                        ids.push(history.id);
                    }
                }
            }
        }

        return ids;
    },

    Update_deposit_Done: async function (depositdata) {
        if (depositdata && depositdata.length > 0) {
            var db_connect = dbo.getDb();
            await db_connect
                .collection("game_deposit")
                .find({
                    "deposit_history": {
                        $exists: true,
                        $ne: [],
                        //$elemMatch: { "value": { $exists: false } }
                        $elemMatch: {
                            $or: [{ "deposit_done": { $exists: false } },
                            { "deposit_done": { $exists: true, $ne: true } }]
                        }
                    }
                })
                .forEach(async function (doc) {

                    if (doc.deposit_history && doc.deposit_history.length > 0) {
                        for (var nthix = 0; nthix < doc.deposit_history.length; nthix++) {
                            var history = doc.deposit_history[nthix];

                            var dsit_data = depositdata.find(e => e.id == history.id);
                            if (dsit_data) {
                                history.deposit_done = true;
                                history.deposit_token_order = dsit_data.token_order;
                                history.deposit_amount = dsit_data.amount;
                                history.deposit_dt = new Date();
                            }
                        }

                        await db_connect
                            .collection("game_deposit")
                            .updateOne(
                                { _id: doc._id },
                                {
                                    $set: {
                                        deposit_history: doc.deposit_history
                                    },
                                }, function (err, res) {
                                    if (err) throw err;
                                    console.log("1 document updated");
                                    //response.json(res);
                                });
                    }
                });
        }
    }
};
