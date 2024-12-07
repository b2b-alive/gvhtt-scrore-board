import Bus from "./Bus";
import {useEffect, useState} from "react";
import {LiveStreamState, LiveStreamStatePlayer} from "../LiveStream";
import DafunkerLiveStream from "./DafunkerLiveStream";

export function App() {

    const [state, setState] = useState<LiveStreamState | null>(null);

    useEffect(() => {
        const onState = (event: Event) => {
            if (event instanceof CustomEvent) {
                setState(event.detail);
            }
        };

        DafunkerLiveStream.addEventListener('state', onState);
        return () => {
            DafunkerLiveStream.removeEventListener('state', onState);
        }
    }, []);


    console.log(state);

    return (
        <div>
            {state && <Event state={state}/>}
            {state?.currentMatch && <Players player1={state.currentMatch.player1} player2={state.currentMatch.player2} server={state.currentMatch.server}/>}
            {state?.currentMatch && <MatchScore score={state.currentMatch.score}/>}
            {state?.currentMatch?.sets && <Score sets={state?.currentMatch?.sets}/>}
        </div>
    );
}

type PlayersProps = {
    player1: LiveStreamStatePlayer;
    player2: LiveStreamStatePlayer;
    server: 1 | 2 | null;
}

function Players({player1, player2, server}: PlayersProps) {
    return (
        <div
            style={{
                display: 'flex',
                width: '100%'
            }}
        >
            <div
                style={{
                    color: server === 1 ? 'green' : 'black',
                    flexGrow: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '2em'
                }}
            >
                {player1.firstname} {player1.lastname} {player1.classement} {player1.countryCode}
            </div>
            <div
                style={{
                    color: server === 2 ? 'green' : 'black',
                    flexGrow: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '2em'
                }}
            >
                {player2.firstname} {player2.lastname} {player2.classement} {player2.countryCode}
            </div>
        </div>
    );
}


type ScoreProps = {
    sets: [number, number][];
}

function Score({sets}: ScoreProps) {
    {
        const lastSet = sets[sets.length - 1];
        if (!lastSet) {
            return null;
        }
        return (
            <div style={{
                display: 'flex',
                width: '100%'
            }}>
                <div style={{
                    flexGrow: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '10em'
                }}>
                    {lastSet[0]}
                </div>
                <div
                    style={{
                        flexGrow: 1,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '10em'
                    }}
                >
                    {lastSet[1]}
                </div>
            </div>
        )
    }
}

type MatchScoreProps = {
    score: [number, number];
}

function MatchScore({score}: MatchScoreProps) {
    {
        return (
            <div style={{
                display: 'flex',
                width: '100%'
            }}>
                <div style={{
                    flexGrow: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '2em'
                }}>
                    {score[0]}
                </div>
                <div
                    style={{
                        flexGrow: 1,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '2em'
                    }}
                >
                    {score[1]}
                </div>
            </div>
        )
    }
}

type EventProps = {
    state: LiveStreamState;
}

function Event({state}: EventProps) {
    return (
        <div
            style={{
                display: 'flex',
                paddingBottom: '5em'
            }}
        >
            {state.teams.map((team, index) => (
                <div key={index}
                        style={{
                            flexGrow: 1,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '1em'
                        }}
                >
                    {team.name} {team.score}
                </div>
            ))}
        </div>
    );
}

