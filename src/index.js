const express = require('express');
const uuid = require('uuid/v4');
const bodyParser = require('body-parser')
const app = express();

const database = {
    users: {},
    transactions: [],
    logins: {},
    mugshots: {},
};


function createUser(name, mugshotHash, fbuid) {
    if (database.users.hasOwnProperty(fbuid)) {
        return [false, 'User already exists!'];
    }

    const user = {
        name, mugshots: [mugshotHash], fbuid
    };

    database.users[fbuid] = user;

    database.mugshots[mugshotHash] = fbuid;

    return [true, user];
}

function createNewLoginRequest() {
    const token = uuid().replace(/-/g, '');

    const request = {
        token,
        authenticated: false,
        user: null,
    };

    database.logins[token] = request;
    
    return [true, request];
}

function addMugshot(user, mugshotHash) {

}

function completeLoginRequest(token, mugshotHash) {
    if (database.mugshots.hasOwnProperty(mugshotHash) && database.logins.hasOwnProperty(token)) {
        const user = database.users[database.mugshots[mugshotHash]];
        database.logins[token] = {
            authenticated: true,
            user: user,
            token: token,
        }
        return [true, user];
    }

    console.log('mugshot hash is', mugshotHash, database.mugshots);
    return [false, 'auth failed'];
}

function sendOperation(operation) {
    if (operation[0]) {
        return {
            success: true,
            payload: operation[1],
        };
    }

    return {
        success: false,
        error: operation[1],
    };
}

app.use(bodyParser.json());

app.post('/api/users', ({ body: { name, mugshotHash, fbuid }}, res) => {
    console.log({ name, mugshotHash, fbuid })
    const operation = createUser(name, mugshotHash, fbuid);
    res.json(sendOperation(operation));
});

app.get('/api/users', (req, res) => {
    res.json(sendOperation([true, database.users]));
});

app.post('/api/mugshot/:mugshotHash', (req, res) => {

})

app.post('/api/login', (req, res) => {
    res.json(sendOperation(createNewLoginRequest()));
})

app.get('/login', (req, res) => {
    const [success, data] = createNewLoginRequest();
    res.redirect(`https://docs.google.com/forms/d/e/1FAIpQLSe5li5aceFZb50B43zMds1bTdn0ky86OTgIsgIYypgiUAv2rQ/viewform?usp=pp_url&entry.853054898=${data.token}`);
})

app.get('/api/login', (req, res) => {
    res.json(sendOperation([true, database.logins]));
})

app.post('/api/login/:token', (req, res) => {
    const token = req.params.token;
    console.log(req.body);
    res.json(sendOperation(completeLoginRequest(token, req.body.mugshotHash)));
})

app.listen(9909);