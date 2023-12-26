const axios = require('axios');

const apiKey = "e8d2745af676d7499d746da8d971c4c5882312a9"
class WebSearchService {
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
                'X-API-KEY': apiKey,
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

export default WebSearchService;