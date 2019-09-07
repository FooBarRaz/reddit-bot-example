const web = require('./webutil');
const qs = require('querystring');

const username = process.env.username;
const password = process.env.password;
const clientId = process.env.client_id;
const clientSecret = process.env.client_secret;
const authEndpoint = 'https://www.reddit.com/api/v1/access_token';
const api = 'https://oauth.reddit.com';

class RedditClient {
    constructor(token){
        this.token = token;
    }

    apiOptions(method) {
        return {
            "method": method,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${this.token}`,
                "cache-control": "no-cache",
                "User-Agent": "BetteridgeBot by betteridge_bot"
            }
        };
    }

    async getFromApi(path, params) {
        let paramString;
        if (params) {
            paramString = qs.stringify(params);
        }

        const url = `${api}/${path}${params ? `?${paramString}` : ''}`;

        return web.promiseToFetchData(url, this.apiOptions("GET"));
    }

    async postToApi(path, body, params) {
        const options = {...this.apiOptions("POST"), body};
        const paramString = params ? `?${qs.stringify(params)}` : '';
        const url = `${api}/${path}${paramString}`;

        return web.promiseToFetchData(url, options);
    }

    async fetchNewPosts(subreddit, params) {
        return this.getFromApi(`r/${subreddit}/new`, null, params);
    }

    async savePost(post) {
        return this.postToApi("api/save", null, {id: post.data.name})
    }

}

async function getAuthToken() {
    const options = {
        "method": "POST",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": web.basicAuth(clientId, clientSecret),
            "cache-control": "no-cache",
        }
    };

    const url = `${authEndpoint}?grant_type=password&username=${username}&password=${password}`;
    return web.promiseToFetchData(url, options).then(data => data.access_token);
}

async function getClientInstance() {
    return getAuthToken().then(token => new RedditClient(token))

}

const operations = {
    getPostsFromListing: listing => listing.data.children,
    getPostTitle: post => post.data.title,
    fullName: listingItem => `${listingItem.kind}_${listingItem.data.id}`,
};

module.exports = {
    getClientInstance,
    operations
};
