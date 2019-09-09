const {
    getClientInstance,
    operations: {getPostTitle, getPostsFromListing }
} = require('./reddit');


const subreddits = process.env.subreddits.split(',').map(s => s.trim());
const keywords = process.env.keywords.split(',').map(s => s.trim());


module.exports = {
    invoke: async function () {
        const redditClient = await getClientInstance();

        async function fetchPostsFromEachSubreddit(subreddits) {
            return Promise.all(
                subreddits.map(
                    subreddit => redditClient.fetchNewPosts(subreddit, {limit: 100})))            
            .then(combinePostsFromAllListings);
        }

        function combinePostsFromAllListings(listings) {
            return listings
                .map(getPostsFromListing)
                .reduce((acc, curr) => [...acc, ...curr], [])
        }

        function filterPostsWithKeywordsInTitle(posts) {
            const postHasKeywordInTitle = (post) =>
                keywords.some(keyword =>
                    getPostTitle(post).toLowerCase()
                        .includes(keyword.toLowerCase()))

            return posts.filter(postHasKeywordInTitle);
        }

        async function savePosts(posts) {
            return Promise.all(
                posts.map(post => redditClient.savePost(post))
            ).then(() => posts.map(getPostTitle))
        }

        return Promise.resolve(subreddits)
            .then(fetchPostsFromEachSubreddit)
            .then(filterPostsWithKeywordsInTitle)
            .then(savePosts)
    }
};
