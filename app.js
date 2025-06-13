const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const baseUrl = 'https://www.transfermarkt.mx/laliga/marktwerte/wettbewerb/ES1/pos//detailpos/0/altersklasse/alle/land_id/0/plus/1';
    const results = [];

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const url = currentPage === 1 ? baseUrl : `${baseUrl}/page/${currentPage}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector('.items');

        const jugadores = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('responsive-table tbody tr'));
            return rows
                .filter(row => row.querySelector('td.posrela'))
                .map(row => {
                    const nombre = row.querySelector('')?.innerText.trim() || '';
                    const edad = row.querySelector('')?.innerText.trim() || '';
                    const nacionalidad = row.querySelector('td.zentriert img.flaggenrahmen')?.title || '';
                    const club = row.querySelector('td.no-border-links a.vereinprofil_tooltip')?.innerText.trim() || '';
                    const valorCarrera = row.querySelector('td.rechts')?.innerText.trim() || '';
                    const ultimaRevision = row.querySelector('td.rechts:nth-child(6)')?.innerText.trim() || '';
                    const valorMercado = row.querySelector('td.rechts:nth-child(7)')?.innerText.trim() || '';
                    return { nombre, edad, nacionalidad, club, valorCarrera, ultimaRevision, valorMercado };
                });
        });

        results.push(...jugadores);
        console.log(`Página ${currentPage} procesada, jugadores encontrados: ${jugadores.length}`);

        // Detecta si hay una página siguiente
        hasNextPage = await page.evaluate(() => {
            const nextBtn = document.querySelector('.tm-pagination__list-item--icon-next:not(.tm-pagination__list-item--disabled)');
            return !!nextBtn;
        });

        currentPage++;
    }

    await browser.close();

    const outputPath = path.join(__dirname, 'jugadores.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Datos guardados en ${outputPath}`);
})();