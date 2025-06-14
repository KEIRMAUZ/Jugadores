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
                 const segundaNacionalidadEtiqueta = jugador.querySelector('tbody>tr>td>img.flaggenrahmen:nth-child(3)')
                 console.log(nacionalidadEtiqueta)
                 const nacionalidad = nacionalidadEtiqueta?.getAttribute('title');
                 const nacionalidad2 = segundaNacionalidadEtiqueta?.getAttribute('title') || "No tiene una segunda nacionalidad";
                 
                 const edad = jugador.querySelector('tbody>tr>td:nth-child(4)')?.innerText;

                 const clubEtiqueta = jugador.querySelector("tr>td:nth-child(5)>a")
                 const club = clubEtiqueta?.title

                 return{
                    nombreJugador,
                    nacionalidades:{
                        nacionalidad,
                        nacionalidad2
                    },
                    edad,
                    club
                 };
            });
            //Arriba acaba el return
        })//Acaba jugadores españoles optenidos
        jugadores = [...jugadores,...jugadoresEspañolesOptenidos];

        btnPaginaSiguiente = await pagina.evaluate(()=>{
            //<li class="tm-pagination__list-item tm-pagination__list-item--icon-next-page"><a href="/laliga/marktwerte/pokalwettbewerb/ES1/ajax/yw1/pos//detailpos/0/altersklasse/alle/plus/1/page/2" title="A la página siguiente" class="tm-pagination__link">&nbsp;&nbsp;</a></li>
            const btnSiguiente = document.querySelector("div>ul>li.a.tm-pagination__link");
            console.log(btnSiguiente)
            if(btnSiguiente==true || btnSiguiente != null){
                console.log("Holaaaaaaaaaa")
                btnSiguiente.click();
                
                return true;
            }
            console.log("Esta en el else fuera del IF")
            return false
        });

        await new Promise((resolve)=>setTimeout(resolve,2000));
    }
    console.log('Jugadores: ', jugadores);
    await navegador.close();
    console.log("Termino el scraping")
})();