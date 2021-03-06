import { Component, createRef } from 'react';
import { Button } from 'rsuite';
import PuzzlePieces, { Results } from './puzzlePieces';
import './rsuite/rsuite-default.css'

type PuzzleCanvasProps = {};
type PuzzleCanvasState = {
    solved: boolean | undefined
};

const c_canvasWidth = 640;
const c_canvasHeight = 480;

export class PuzzleCanvas extends Component<PuzzleCanvasProps, PuzzleCanvasState>
{
    private canvasRef = createRef<HTMLCanvasElement>(); 
    private pieces: PuzzlePieces | undefined;

    state: PuzzleCanvasState =
    {
        solved: undefined
    };

    constructor(props: PuzzleCanvasProps)
    {
        super(props);
        this.onResults = this.onResults.bind(this);
    }

    componentDidMount()
    {
        // Once render() was called, load the picture and set up the model
        var canvas = this.canvasRef.current;
        if (canvas !== undefined)
        {
            this.pieces = new PuzzlePieces(canvas!, this.onResults);
        }
    }

    tryMovePiece(e: MouseEvent) 
    {
        const leftMouseButtonPressed = (e.buttons === 1);
        const x = e.offsetX; 
        const y = e.offsetY;
        this.pieces!.tryMovePiece(x, y, leftMouseButtonPressed); 
    }

    solve()
    {
        this.pieces!.unScramblePieces();
    }

    scramble()
    {
        this.pieces!.scramblePieces();
    }

    onResults (result:Results)
    {
        this.setState({ solved: result === Results.Solved });
    }

    render()
    {
        return (
            <div>
                <canvas 
                    ref={this.canvasRef}
                    width={c_canvasWidth} height={c_canvasHeight}
                    style={{"border" : "1px solid rgb(255,0,0)"}}
                    onMouseMove={(e) => {this.tryMovePiece(e.nativeEvent)}}
                    onMouseDown={(e) => {this.tryMovePiece(e.nativeEvent)}}                    
                />
                <br />
                { this.state.solved !== undefined
                    ? this.state.solved!
                        ? "Solved"
                        : "Unsolved"
                    : "Waiting"
                }
                <br />                
                <Button onClick={() => this.solve()} appearance="primary" style={{ margin: 4 }}>Show Solved</Button>
                <Button onClick={() => this.scramble()} appearance="primary" style={{ margin: 4 }}>Scramble</Button>                
            </div>
        );
    }
}

export default PuzzleCanvas;