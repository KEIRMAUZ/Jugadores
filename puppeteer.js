const puppeteer = require('puppeteer');
(async ()=>{
    const URL = `https://www.transfermarkt.mx/laliga/marktwerte/wettbewerb/ES1/pos//detailpos/0/altersklasse/alle/land_id/0/plus/1`;
    console.loh("Dentro de la funcion")

    const navegador = await puppeteer.launch({
        headless:false,
        slowMo:500
    });

    const pagina = await navegador.newPage();

    await pagina.goto(URL,{
        waitUntil:'networkidle2'
    });

    let jugadores = [];
    let btnPaginaSiguiente = true

    while(btnPaginaSiguiente){
        const jugadoresEspañolesOptenidos = await pagina.evaluate(()=>{
            const resultados = Array.from(document.querySelectorAll('table>tbody>tr'));
            return resultados.map((jugador)=>{
                //Optener las propiedades de los jugadores
                
            });
            //Arriba acaba el return
        })//Acaba jugadores españoles optenidos
        btnPaginaSiguiente = await pagina.evaluate(()=>{
            const btnSiguiente = document.getElementById('tm-pagination__list-item tm-pagination__list-item--icon-next-page');
            if(btnSiguiente){
                btnSiguiente.click();
                return true;
            }
            return false
        });
        await new Promise((resolve)=>setTimeout(resolve,2000));
    }
})();