import axios from "axios";
import {XMLParser} from "fast-xml-parser";
// import https from "https";

export type Match = {
    idDivision: string;
    idRencontre: string;
    dateprevue: string;
    datereelle: string;
    equaId: string;
    equa: string;
    equbId: string;
    equb: string;
    libelle: string;
    lien: string;
    scorea: string;
    scoreb: string;
    shortLabel: string;
}

export type DIVISION = {
    id: string;
    name: string;
}

export const DIVISIONS: DIVISION[] = [
    {id: '189985', name: 'PRO A Messieurs'},
    {id: '189987', name: 'PRO A Dames'},
    {id: '189986', name: 'PRO B Messieurs',},
    {id: '189988', name: 'PRO B Dames'}];

class MatchsLoader {

    // TODO handle errors

    list: Match[] | null = null;

    async getMatchs() {
        if (!this.list) {
            await this.pull();
        }

        return this.list;
    }

    private async pull() {
        const matchs: Match[] = [];

        for (const division of DIVISIONS) {
            const url = `https://fftt.dafunker.com//v1/proxy/xml_result_equ.php?force=1&D1=${division.id}`;
            const res = await axios.get(url, {
                // httpsAgent: new https.Agent({
                //     rejectUnauthorized: false
                // })
            });
            const data = res?.data;

            if (data) {
                const json = new XMLParser().parse(data);

                if (json?.liste?.tour) {
                    for (const rencontre of json.liste.tour) {
                        rencontre.equaId = rencontre.lien.split('clubnum_1=')[1].split('&')[0];
                        rencontre.equbId = rencontre.lien.split('clubnum_2=')[1].split('&')[0];
                        rencontre.idDivision = division.id;
                        rencontre.idRencontre = rencontre.lien.split('renc_id=')[1].split('&')[0];

                        const tour = rencontre.libelle.match(/tour n°(\d+)/);
                        const date = rencontre.libelle.match(/(\d{2}\/\d{2}\/\d{4})/);

                        rencontre.shortLabel = `Tour ${tour[1]} (${date[1]}) ${rencontre.equb}`;

                        matchs.push(rencontre);
                    }
                }
            }
        }

        this.list = matchs;

        console.log(`${matchs.length} matchs loaded`);
    };

    async getMatch(id: string) {
        const matchs = await this.getMatchs();
        if(!matchs) {
            return null;
        }
        return matchs.find(m => m.idRencontre === id) || null;
    }
}

export default new MatchsLoader();