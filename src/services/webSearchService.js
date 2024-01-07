const axios = require('axios');

class WebSearchService {

    /// @param {string} apiKey - serper api key
    /// @param {string} siteFilter - results will be filtered to this site, should be sent as a domain name "amazon.com"
    constructor(apiKey, siteFilter = undefined, searchType = "search") {
        this.key = apiKey;
        this.filter = siteFilter;

        this.type = this.#isValidSearchType(searchType) ? searchType : "search";
    }

    get apiKey() { return this.key };
    set apiKey(newApiKey) { this.key = newApiKey; }

    get siteFilter() { return this.filter; }
    set siteFilter(newFilter) { this.filter = newFilter; }

    get searchType() { return this.type; }
    set searchType(newSearchType) {
        if (!this.#isValidSearchType(newSearchType)) throw new Error("Invalid search type: " + newSearchType);
        this.type = newSearchType;
    }

    #isValidSearchType(searchType) {
        let availableTypes = ["search", "images", "videos", "news", "shopping", "places"];
        return availableTypes.includes(searchType);
    }

    #getSearchConfig(query, site, type = "search") {
        let availableTypes = ["search", "images", "videos", "news", "shopping", "places"];
        if (!availableTypes.includes(type)) throw new Error("Invalid type: " + type);

        let q = `site:${site} ${query}`

        let data = JSON.stringify({
            q,
            gl: "us",
            autocorrect: false,
        });

        let config = {
            method: 'post',
            url: `https://google.serper.dev/${type}`,
            headers: {
                'X-API-KEY': this.key,
                'Content-Type': 'application/json'
            },
            data: data
        };

        return config;
    }

    async search(query) {
        let config = this.#getSearchConfig(query, this.siteFilter, this.type);
        try {
            let response = await axios(config);

            let t = this.type == "search" ? "organic" : this.type;
            let results = response.data[t];
            return results;
        }
        catch (error) {
            console.log(error);
        }
    }
}

module.exports = WebSearchService;