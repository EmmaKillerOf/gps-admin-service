const Axios = require('axios')
const axiosRetry = require('axios-retry');

axiosRetry(Axios, { retries: 2 });

const get = async(url, data = {}, options = {}, token = '', tokenType = 'Authorization') => {
    const TOKEN = {
        [tokenType]: token
    }
    const resp = await Axios.get(`${url}`, {
        headers: {
            "Content-Type": "application/json",
            ...TOKEN
        },
        data: JSON.stringify(data)
    }).catch(err => {
        if (err.response) {
            // Request made and server responded
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
        } else if (err.request) {
            // The request was made but no response was received
            console.log(err.request);
        } else {
            // Something happened in setting up the request that triggered an err
            console.log('err', err.message);
        }
        return { error: err.request }
    });
    return resp.data

}

const post = async(url, data = {}, options = {}, token = '', tokenType = 'Authorization') => {

    const TOKEN = {
            [tokenType]: token
        }
        // try {

    const resp = await Axios.post(url, data, {
        headers: {
            "Content-Type": "application/json",
            ...options,
            ...TOKEN,
        }
    }).catch(err => {
        if (err.response) {
            // Request made and server responded
            // console.log(err.response.data);
            // console.log(err.response.status);
            // console.log(err.response.headers);
        } else if (err.request) {
            // The request was made but no response was received
            // console.log(err.request);
        } else {
            // Something happened in setting up the request that triggered an err
            // console.log('err', err.message);
        }
        //console.log(err.response.data);
        //console.log(err);
        // console.log('primero')
        console.log(url, '==========================================================');
        err.response;
        //return err.response.data
    });
    return resp.data
        //return reply.status(200).json({ ok: true, data: resp.data });

    // } catch (err) {
    //     console.log(err);
    //     return reply.status(400).json({ ok: false, err });

    // }
}




module.exports = { post, get }