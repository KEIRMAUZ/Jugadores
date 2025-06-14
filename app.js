const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'https://www.transfermarkt.mx';
const START_URL = '/laliga/marktwerte/wettbewerb/ES1/pos//detailpos/0/altersklasse/alle/land_id/0/plus/1';
const MAX_PLAYERS = 100;

async function scrape() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let url = BASE_URL + START_URL;
  let players = [];
  let pageNum = 1;
  let playerCount = 1;

  while (url && players.length < MAX_PLAYERS) {
    console.log(`Scrapeando pagina ${pageNum}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const pagePlayers = await page.$$eval('table.items tbody tr', rows =>
      rows.map(row => {
        const tds = row.querySelectorAll('td');
        if (tds.length < 8) return null;

        // Nombre
        const name = tds[1].querySelector('tbody>tr>td.hauptlink>a')?.textContent.trim() || '';

        // Edad 
        const edad = document.querySelector('tr>td:nth-child(4)')?.innerText;
        // Nacionalidad
        const nationality = tds[5]?.querySelector('img')?.title || '';

        // Club
        const club = tds[6]?.querySelector('a')?.title || '';

        // Valor de mercado actual
        const marketValue = tds[8]?.textContent.trim() || '';

        // Valor más alto de la carrera 
        const highestValue = tds[8]?.querySelector('.icons_sprite.icon-werteverlauf')?.getAttribute('onmouseover')?.match(/'([^']+)'/)?.[1] || '';

        // Última actualización 
        const lastUpdate = tds[8]?.querySelector('span')?.getAttribute('title') || '';

        return { name, edad, nationality, club, marketValue, highestValue, lastUpdate };
      }).filter(Boolean)
    );

    const remaining = MAX_PLAYERS - players.length;
    const numberedPlayers = pagePlayers.slice(0, remaining).map(player => ({
      numero: playerCount++,
      ...player
    }));
    players.push(...numberedPlayers);

    if (players.length >= MAX_PLAYERS) break;

    const nextHref = await page.$eval('.tm-pagination__list-item--icon-next-page a', a => a.getAttribute('href')).catch(() => null);
    if (nextHref) {
      url = BASE_URL + nextHref;
      pageNum++;
    } else {
      url = null;
    }
  }

  await browser.close();
  fs.writeFileSync('jugadores.json', JSON.stringify(players, null, 2));
  console.log(`:::Scraping terminado. ${players.length} lista de jugadores creada en jugadores.json:::`);
}

scrape().catch(console.error);
