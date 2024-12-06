import {LiveStreamConfig} from "./LiveStreamConfig";
import {io, Socket} from "socket.io-client";
import MatchsLoader from "./MatchsLoader";
import {LiveStreamEvent} from "./types/LiveStream";
import {formatTeamName, getPlayer, getServer} from "./Utils";

type LiveStreamStatePlayer = {
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
    sets: [number, number][];
}

type LiveStreamState = {
    league: string | null;
    isTerminated: boolean;
    teams: {
        name?: string;
        score?: number;
    }[],
    currentMatch: LiveStreamStateMatch | null;
}

export class LiveStream {
    private currentConfig: LiveStreamConfig | null = null;
    private currentMatchId: string | null = null;
    private leagueName: string | null = null;

    private matchSocket: null | Socket = null;

    set config(config: LiveStreamConfig) {

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

        socket.on('update_global', (config: LiveStreamEvent) => {
            this.parseUpdateGlobal(config);
        });

        this.matchSocket = socket;
    }

    private parseUpdateGlobal(config: LiveStreamEvent) {
        console.log("Parsing update global", JSON.stringify(config, null, 2));


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

        console.log("Last match", lastMatch);

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

            currentMatch = {
                id: lastMatch.id,
                status,
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
    }

}