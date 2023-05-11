function ExtractDataFromNode(node) {
    const gameLink = Array.from(node.children)
        .filter(e => e.classList.contains('psw-l-stack-left'))[0]?.querySelector('[data-telemetry-meta]')

    return gameLink ? {
        href: gameLink.href,
        ...JSON.parse(gameLink?.dataset.telemetryMeta),
    } : null
}

function ExtractGameDataFromPage() {

    const gameList = document.querySelectorAll("[data-qa='collection-game-list-product']")

    let processedCount = 0

    for (let game of gameList) {
        let result = ExtractDataFromNode(game)
        if (!result) continue
        // console.log(JSON.stringify(result))
        window.jsonObject.games.push(result)
        processedCount += 1
    }

    chrome.runtime.sendMessage(JSON.stringify(window.jsonObject.games, null, 2));
    return processedCount
}

function GetGames() {

    window.jsonObject = {games: []}

    ExtractGameDataFromPage()
    document.querySelector('[data-qa="pagination#next"]')?.click()

    const myInterval = setInterval(() => {
        if (!(document.querySelector('[data-qa="pagination#next"]')?.click())) {
            return clearInterval(myInterval)
        }
        setTimeout(() => {
            ExtractGameDataFromPage()
        }, 1000)
    }, 3000)

}

