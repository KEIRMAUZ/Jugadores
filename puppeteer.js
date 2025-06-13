const puppeteer = require('puppeteer');
(async ()=> {
    const URL = `https://www.transfermarkt.mx/laliga/marktwerte/wettbewerb/ES1/pos//detailpos/0/altersklasse/alle/land_id/0/plus/1`;
    console.log("Dentro de la funcion")

    const navegador = await puppeteer.launch({
        headless:false,
        slowMo:500
    });

    const pagina = await navegador.newPage();

    await pagina.goto(URL,{
        waitUntil:'networkidle2'
    });

    let jugadores = [];
    let btnPaginaSiguiente = true;

    while(btnPaginaSiguiente){
        const jugadoresEspañolesOptenidos = await pagina.evaluate(()=>{
            const resultados = Array.from(document.querySelectorAll('div>div>table>tbody>tr'));
            return resultados.map((jugador)=>{
                //Optener las propiedades de los jugadores
                 const nombreJugador = jugador.querySelector('tbody>tr>td.hauptlink>a')?.innerText;
                 const nacionalidadEtiqueta = jugador.querySelector('tbody>tr>td>img.flaggenrahmen')
                 console.log(nacionalidadEtiqueta)
                 const nacionalidad = nacionalidadEtiqueta?.getAttribute('title');
                 //Corregir que es el cuarto TD
                 const edad = document.querySelector('table>tbody>tr>td:4')?.innerText;

                 return{
                    nombreJugador,
                    nacionalidad
                 };
            });
            //Arriba acaba el return
        })//Acaba jugadores españoles optenidos
        jugadores = [...jugadores,...jugadoresEspañolesOptenidos];

        btnPaginaSiguiente = await pagina.evaluate(()=>{
            const btnSiguiente = document.querySelector("div>ul>li.tm-pagination__list-item tm-pagination__list-item--icon-next-page");
            if(btnSiguiente==true){
                btnSiguiente.click();
                return true;
            }
            return false
        });

        await new Promise((resolve)=>setTimeout(resolve,2000));
    }
    console.log('Jugadores: ', jugadores);
    await navegador.close();
    console.log("Termino el scraping")
})();