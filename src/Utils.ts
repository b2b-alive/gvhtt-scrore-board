import {LiveStreamEvent, LiveStreamEventMatch, LiveStreamEventPlayer, LiveStreamEventTeam} from "./types/LiveStream";

export const formatTeamName = function (teamName: string | undefined): string | undefined
{
    if (teamName === 'NIMES / MONTPELLIER ALLIANCE 1')
    {
        return 'ANM TT';
    }
    else if (teamName === 'ROMAGNE (LA) 1')
    {
        return 'LA ROMAGNE';
    }

    if (teamName)
    {
        teamName = teamName.replace(' TT 1', '');
        teamName = teamName.replace(/ 1$/, '');
    }

    return teamName;
};

export const getPlayer = function (
    teamNumber: number,
    partie: LiveStreamEventMatch | undefined,
    json: LiveStreamEvent | undefined,
): LiveStreamEventPlayer | null
{
    if (json && partie)
    {
        const slotId: string = (partie as any)[`joueur${teamNumber}`].slotId;

        const equipe: LiveStreamEventTeam = (json as any)[`equipe${teamNumber}`] as LiveStreamEventTeam;
        const joueur = equipe.joueurs[slotId];

        if (joueur) joueur.fullname = `${joueur.nom} ${joueur.prenom}`;

        return joueur;
    }

    return null;
};

export function getServer(partie: LiveStreamEventMatch | undefined) {
    const premierServeur = partie?.premier_serveur === 'JB'? 2: 1;
    const otherServeur = premierServeur === 1? 2: 1;

    if (partie?.score?.length)
    {
        const sets = partie.score;
        const currentSetId = sets.length - 1;
        const currentSet = sets[currentSetId];
        const totalPoints = currentSet[0] + currentSet[1];

        if (totalPoints >= 20) {
            return ((totalPoints + currentSetId) % 2 === 0 ? premierServeur : otherServeur);
        } else {
            const d2 = Math.floor(totalPoints / 2);
            return ((d2 + currentSetId) % 2 === 0 ? premierServeur : otherServeur);
        }
    }
    return null;
}