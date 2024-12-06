export type LiveStreamEventPlayer = {
    licence: string;
    prenom: string;
    nom: string;
    classement: string;
    country: string;
    country_code: string;
    photo: string;
}

type LiveStreamEventTeamAPlayers = {
    JA1: LiveStreamEventPlayer | null,
    JA2: LiveStreamEventPlayer | null,
    JA3: LiveStreamEventPlayer | null,
    JA4: LiveStreamEventPlayer | null
}

type LiveStreamEventTeamBPlayers = {
    JB1: LiveStreamEventPlayer | null,
    JB2: LiveStreamEventPlayer | null
    JB3: LiveStreamEventPlayer | null
    JB4: LiveStreamEventPlayer | null
}

export type LiveStreamEventTeam<AB extends LiveStreamEventTeamAPlayers | LiveStreamEventTeamBPlayers = any> = {
    score: number;
    clubnum: string;
    nom: string;
    joueurs: AB;
}

export type LiveStreamEventMatch = {
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

export type LiveStreamEvent = {
    id: string;
    status: string | "termine" | "bientot",
    equipe1: LiveStreamEventTeam<LiveStreamEventTeamAPlayers>
    equipe2: LiveStreamEventTeam<LiveStreamEventTeamBPlayers>
    parties: LiveStreamEventMatch[],
    headers: {
        num_specs: number;
        heure_debut: string;
    }
    date: string,
}