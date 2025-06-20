const {Parser} = require('json2csv');
const puppeteer = require('puppeteer');
const fs = require('fs');
const XLSX = require('xlsx');

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
            const resultados = Array.from(document.querySelectorAll('div>div>table>tbody:nth-child(2)>tr'));
            return resultados.map((jugador)=>{
                //Optener las propiedades de los jugadores
                const index = jugador.querySelector("tr>td:nth-child(1)")?.innerText;
                const fotoJugador = jugador.querySelector("tbody>tr>td>img")?.getAttribute("data-src");
                 const nombreJugador = jugador.querySelector('tbody>tr>td.hauptlink>a')?.innerText;
                 const nacionalidadEtiqueta = jugador.querySelector('tbody>tr>td>img.flaggenrahmen') 
                 const segundaNacionalidadEtiqueta = jugador.querySelector('tbody>tr>td>img.flaggenrahmen:nth-child(3)')
                 console.log(nacionalidadEtiqueta)
                 const nacionalidad = nacionalidadEtiqueta?.getAttribute('title');
                 const nacionalidad2 = segundaNacionalidadEtiqueta?.getAttribute('title') || "No tiene una segunda nacionalidad";
                 
                 const edad = jugador.querySelector('tbody>tr>td:nth-child(4)')?.innerText;

                 const clubEtiqueta = jugador.querySelector("tr>td:nth-child(5)>a")
                 const club = clubEtiqueta?.title
                 const valorMasAlto = jugador.querySelector("tr>td:nth-child(6)>span")?.innerText
                 const ultimaRevision = jugador.querySelector("tr>td:nth-child(7)")?.innerText
                 const valorDelMercado = jugador.querySelector("tr>td:nth-child(8)>a")?.innerText

                 return{
                    index,
                    fotoJugador,
                    nombreJugador,
                    nacionalidades:`Sus nacionalidades ${nacionalidad} y ${nacionalidad2}`,
                    edad,
                    club,
                    valorMasAlto,
                    ultimaRevision,
                    valorDelMercado
                 };
            });
            //Arriba acaba el return
        })//Acaba jugadores españoles optenidos
        jugadores = [...jugadores,...jugadoresEspañolesOptenidos];
        jugadoresExel =[...jugadores,...jugadoresEspañolesOptenidos];
        jugadoresExel.nacionalidades

        btnPaginaSiguiente = await pagina.evaluate(()=>{
            const btnSiguiente = document.querySelector("a.tm-pagination__link[title='A la página siguiente']");
            console.log("Este es btn siguiente", btnSiguiente)
            if(btnSiguiente){
                btnSiguiente.click();
                return true;
            }
            
            return false
        });

        await new Promise((resolve)=>setTimeout(resolve,2000));
    }
    console.log('Jugadores: ', jugadores);

    let data = JSON.stringify(jugadores);
    fs.writeFileSync("jugadores.json",data);
    console.log(`Los datos se guardaron en el archivo jugadores.json`); 

    // Crear archivo csv
    const fields = ['index', 'nombreJugador', 'nacionalidades.nacionalidad', 'nacionalidades.nacionalidad2', 'edad', 'club', 'valorMasAlto', 'ultimaRevision', 'valorDelMercado'];
    const json2csvParse = new Parser({
        fields: fields,
        defaultValue: 'No info'
    });
    const csv = json2csvParse.parse(jugadores);
    fs.writeFileSync("./jugadores.csv", csv, "utf-8");
    console.log('Archivo jugadores.csv creado');

    // Crear archivo de excel
    const ws  = XLSX.utils.json_to_sheet(jugadores);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws, "Archivo EXEL");
    XLSX.writeFile(wb, './Archivo_Exel.xlsx');
    console.log("Exel creado con exito")
    
    await navegador.close();
    console.log("Termino el scraping")
})();