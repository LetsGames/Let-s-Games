
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("game-search");
const gameCards = document.querySelectorAll(".game-card");
const noResults = document.getElementById("no-results");

function searchGames() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let visibleGames = 0;

    gameCards.forEach((card) => {
        const gameName = card.dataset.name.toLowerCase();
        const matches = gameName.includes(searchTerm);

        card.hidden = !matches;

        if (matches) {
            visibleGames++;
        }
    });

    noResults.hidden = visibleGames !== 0;
}

searchInput.addEventListener("input", searchGames);

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchGames();
});
