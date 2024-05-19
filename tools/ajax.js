const request = require("sync-request")
const axios = require("axios")

async function getData() {

    const Languages = {
        "en": await getLang("en"),
        "ru": await getLang("ru"),
    }

    async function getLang(lang = "en") {
        const r = await axios.get("https://icx.traineratwot.site/GetIc10?lang=" + lang)
        return r.data
    }

    return {Languages}
}

module.exports = getData
