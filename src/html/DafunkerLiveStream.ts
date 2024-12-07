import {io, Socket} from "socket.io-client";
import MatchsLoader from "../MatchsLoader";
import {formatTeamName, getPlayer, getServer} from "../Utils";

type DafunkerMainStreamState = {
    idRencontre?: string;
    isMale?: boolean;
    screen?: string;
    shortnameEquipe1?: string;
    shortnameEquipe2?: string;
    displayGlobalScore?: boolean;
    displayScreen?: boolean;
    divisionName?: string;
}

type DafunkerLiveStreamPlayer = {
    licence: string;
    prenom: string;
    nom: string;
    classement: string;
    country: string;
    country_code: string;
    photo: string;
}

type DafunkerLiveStreamTeamAPlayers = {
    JA1: DafunkerLiveStreamPlayer | null,
    JA2: DafunkerLiveStreamPlayer | null,
    JA3: DafunkerLiveStreamPlayer | null,
    JA4: DafunkerLiveStreamPlayer | null
}

type DafunkerLiveStreamEvenBPlayers = {
    JB1: DafunkerLiveStreamPlayer | null,
    JB2: DafunkerLiveStreamPlayer | null
    JB3: DafunkerLiveStreamPlayer | null
    JB4: DafunkerLiveStreamPlayer | null
}

type DafunkerLiveStreamTeam<AB extends DafunkerLiveStreamTeamAPlayers | DafunkerLiveStreamEvenBPlayers = any> = {
    score: number;
    clubnum: string;
    nom: string;
    joueurs: AB;
}

type DafunkerLiveStreamMatch = {
    id: string;
    joueur1?: {
        slotId: string;
    },
    joueur2?: {
        slotId: string;
    },
    premier_serveur: "JA" | "JB",
    livescorer: string;
    score: [number, number][],
    status: 'victoire_JA' | 'victoire_JB' | 'en_cours'
    score_history: (1 | -1)[],
}

type DafunkerLiveStreamState = {
    id: string;
    status: string | "termine" | "bientot",
    equipe1: DafunkerLiveStreamTeam<DafunkerLiveStreamTeamAPlayers>
    equipe2: DafunkerLiveStreamTeam<DafunkerLiveStreamEvenBPlayers>
    parties: DafunkerLiveStreamMatch[],
    headers: {
        num_specs: number;
        heure_debut: string;
    }
    date: string,
}


export type LiveStreamStatePlayer = {
    lastname?: string | null;
    firstname?: string | null;
    countryCode?: string | null;
    classement?: string | null;
}

type LiveStreamStateMatch = {
    id: string;
    status: 'finished' | 'in_progress' | 'not_started';
    server: 1 | 2 | null;
    player1: LiveStreamStatePlayer;
    player2: LiveStreamStatePlayer;
    score: [number, number];
    sets: [number, number][];
}

export type LiveStreamState = {
    league: string | null;
    isTerminated: boolean;
    teams: {
        name?: string;
        score?: number;
    }[],
    currentMatch: LiveStreamStateMatch | null;
}

class DafunkerLiveStream extends EventTarget{
    private currentConfig: DafunkerMainStreamState | null = null;
    private currentMatchId: string | null = null;
    private leagueName: string | null = null;

    private matchSocket: null | Socket = null;
    private configSocket: null | Socket = null;

    constructor() {
        super();
        this.initConfigSocket();
    }


    set config(config: DafunkerMainStreamState) {

        console.log("Setting config", config);

        this.currentConfig = config;

        if (config.idRencontre) {
            const needReconnect = this.currentMatchId !== config.idRencontre;
            this.currentMatchId = config.idRencontre;
            if (needReconnect) {
                this.initMatchSocket().catch(console.error);
            }
        }

        if (config.divisionName) {
            this.leagueName = config.divisionName;
        }
    }

    private initConfigSocket() {
        const socket = io("https://fftt.dafunker.com:3000/livestream_zqsf-ygrz-b0d4-uv5z-bsbm", {
            transports: ["websocket"],
            rejectUnauthorized: false
        });


        socket.on("connect", () => {
            console.log("Config socket connected");
        });

        socket.on("disconnect", () => {
            console.log("Config socket disconnected");
        });

        socket.on("update", (config: DafunkerMainStreamState) => {
            this.config = config;
        });

        this.configSocket = socket;
    }


    private async initMatchSocket() {

        if (!this.currentMatchId) {
            return;
        }

        const socketURL = `https://fftt.dafunker.com:3000/livescore_${this.currentMatchId}`;
        const match = await MatchsLoader.getMatch(this.currentMatchId);


        if (!match) {
            console.error("Match not found");
            return;
        }

        const auth = {
            equip_1: match.equa,
            equip_2: match.equb,
            clubnum_1: match.equaId,
            clubnum_2: match.equbId
        };
        const socket = io(socketURL, {
            auth,
            transports: ["websocket"],
            rejectUnauthorized: false
        });

        socket.on("connect", () => {
            console.log("Connected to match", this.currentMatchId);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from match", this.currentMatchId);
        });

        socket.on("message", (message) => {
            console.log("Message", message);
        });

        socket.on('update_global', (state: DafunkerLiveStreamState) => {
            console.log("Update from dafunker stream");
            const newState = this.parseUpdateGlobal(state);
            console.log("New state", JSON.stringify(newState, null, 2));
            this.dispatchEvent(new CustomEvent('state', {
                detail: newState
            }));
        });

        this.matchSocket = socket;
    }

    private parseUpdateGlobal(config: DafunkerLiveStreamState) {
        const validMatchs = config.parties.filter((partie) => {
            if (!partie.joueur1?.slotId || !partie.joueur2?.slotId) {
                return false;
            }
            return true;
        })

        // sort by id
        validMatchs.sort((a, b) => {
            return a.id < b.id ? -1 : 1;
        });

        const lastMatch = validMatchs[validMatchs.length - 1]

        let currentMatch: LiveStreamStateMatch | null = null;

        if (lastMatch) {

            const player1 = getPlayer(1, lastMatch, config);
            const player2 = getPlayer(2, lastMatch, config);

            let status: 'finished' | 'in_progress' | 'not_started' = 'not_started';
            if(lastMatch.status === 'victoire_JA' || lastMatch.status === 'victoire_JB') {
                status = 'finished';
            } else if(lastMatch.status === 'en_cours') {
                status = 'in_progress'
            }

            const sets = lastMatch.score;

            let scoreA = 0;
            let scoreB = 0;

            for (const set of sets)
            {
                if (set[0] >= 11 && set[0] > set[1] && set[0] - set[1] >= 2) scoreA++;
                else if (set[1] >= 11 && set[1] > set[0] && set[1] - set[0] >= 2) scoreB++;
            }


            currentMatch = {
                id: lastMatch.id,
                status,
                score: [scoreA, scoreB],
                server: getServer(lastMatch),
                player1: {
                    firstname: player1?.prenom,
                    lastname: player1?.nom,
                    countryCode: player1?.country_code,
                    classement: player1?.classement ? player1.classement.replace('N', '') : null
                },
                player2: {
                    firstname: player2?.prenom,
                    lastname: player2?.nom,
                    countryCode: player2?.country_code,
                    classement: player2?.classement ? player2.classement.replace('N', '') : null
                },
                sets: lastMatch.score
            }
        }

        const newState: LiveStreamState = {
            league: this.leagueName,
            isTerminated: config.status === "termine" || config.equipe1.score === 3 || config.equipe2.score === 3,
            teams: [
                {name: formatTeamName(config.equipe1.nom), score: config.equipe1.score},
                {name: formatTeamName(config.equipe2.nom), score: config.equipe2.score}
            ],
            currentMatch
        }
        console.log("New state", JSON.stringify(newState, null, 2));
        return newState;
    }

}

export default new DafunkerLiveStream();