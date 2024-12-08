import Bus from "./Bus";
import {useEffect, useState} from "react";
import {LiveStreamState, LiveStreamStatePlayer} from "../LiveStream";
import DafunkerLiveStream from "./DafunkerLiveStream";

export function App() {

    const [state, setState] = useState<LiveStreamState | null>(null);

    const [scale, setScale] = useState(1);

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


    useEffect(() => {
        const onResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const scale = Math.min(width / 1920, height / 1080);
            setScale(scale);
        }
        window.addEventListener('resize', onResize);
        onResize();
        return () => {
            window.removeEventListener('resize', onResize);
        }
    }, []);



    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            //backgroundColor: 'red',
            //transform: `scale(${scale})`,
            transformOrigin: 'top left',
            transform: `scale(0.6666666666666666)`,
        }}>
            {state && <Event state={state}/>}
            {state?.currentMatch && <Players player1={state.currentMatch.player1} player2={state.currentMatch.player2} server={state.currentMatch.server} score={[
                state.currentMatch.score[0],
                state.currentMatch.score[1]
            ]}/>}
            {state?.currentMatch?.sets && <Score sets={state?.currentMatch?.sets}/>}
        </div>
    );
}

type PlayersProps = {
    player1: LiveStreamStatePlayer;
    player2: LiveStreamStatePlayer;
    server: 1 | 2 | null;
    score: [number, number];
}

function Players({player1, player2, server, score}: PlayersProps) {
    return (
        <div
            style={{
                display: 'flex',
                width: '100%',
                position: 'absolute',
                top: '350px',
                color: 'white',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    color: server === 1 ? 'green' : 'white',
                    textAlign: 'center',
                    fontSize: '4em',
                    width: '800px',
                }}
            >
                <strong>{player1.lastname}</strong> {player1.firstname}
                {/*{player1.classement} {player1.countryCode}*/}
            </div>
            <div
                style={{
                    flexGrow: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '4em'
                }}
            >
                {score[0]} - {score[1]}
            </div>
            <div
                style={{
                    color: server === 2 ? 'green' : 'white',
                    textAlign: 'center',
                    fontSize: '4em',
                    width: '800px',
                }}
            >
                <strong>{player2.lastname}</strong> {player2.firstname}
                {/*{player2.classement} {player2.countryCode}*/}
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
                position: 'absolute',
                top: '500px',
                display: 'flex',
                width: '100%',
                fontWeight: 'bold',
                fontSize: '20em',
                color: 'white'
            }}>
                <div style={{
                    flexGrow: 1,
                    textAlign: 'center',
                }}>
                    {lastSet[0]}
                </div>
                <div
                    style={{
                        flexGrow: 1,
                        textAlign: 'center',
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
                position: 'absolute',
                top: '150px',
                width: '100%',
                color: 'white',
                textAlign: 'center',
            }}>

                {score[0]} - {score[1]}

                {/*<div style={{*/}
                {/*    flexGrow: 1,*/}
                {/*    textAlign: 'center',*/}
                {/*    fontWeight: 'bold',*/}
                {/*    fontSize: '2em'*/}
                {/*}}>*/}
                {/*    {score[0]}*/}
                {/*</div>*/}
                {/*<div*/}
                {/*    style={{*/}
                {/*        flexGrow: 1,*/}
                {/*        textAlign: 'center',*/}
                {/*        fontWeight: 'bold',*/}
                {/*        fontSize: '2em'*/}
                {/*    }}*/}
                {/*>*/}
                {/*    {score[1]}*/}
                {/*</div>*/}
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
                position: 'absolute',
                top: '50px',
                width: '100%',
                display: 'flex',
                //paddingBottom: '5em',
                fontWeight: 'bold',
                fontSize: '3em',
                alignItems: 'center',
            }}
        >
            <div
                 style={{
                     width: '40%',
                     textAlign: 'right',
                 }}
            >
                {state.teams[0].name}
            </div>
            <div
                style={{
                    width: '20%',
                    color: 'white',
                    flexDirection: 'row',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    padding: '0 1em',
                    fontSize: '1.3em',
                }}
            >
                <div>
                    {state.teams[0].score}
                </div>
                <div>
                    {state.teams[1].score}
                </div>
            </div>
            <div
                style={{
                    width: '40%',
                    textAlign: 'left',
                }}
            >
                {state.teams[1].name}
            </div>
        </div>
    );
}

