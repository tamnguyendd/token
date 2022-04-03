export const my_server = {
    CallServer: async function (url, body_parameter) {
        let bodyData = {empty:''}
        if(body_parameter)
            bodyData = body_parameter;

        var mgoResponse = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
            method: 'POST', //  or GET
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
        });
        return await mgoResponse.json();
    },

}