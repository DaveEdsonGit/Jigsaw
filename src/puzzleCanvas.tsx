import { Component, createRef } from 'react';
import PuzzlePieces from './puzzlePeices';

type PuzzleCanvasProps = {};
type PuzzleCanvasState = {};

// In future iterations, color will be replaced with an image of the
// part of the puzzle peice
type Piece = {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
};

const c_canvasWidth = 640;
const c_canvasHeight = 480;
const c_gridX = 8;
const c_gridY = 8;

export class PuzzleCanvas extends Component<PuzzleCanvasProps, PuzzleCanvasState>
{
    private canvasRef = createRef<HTMLCanvasElement>(); 
    private pieces: PuzzlePieces = new PuzzlePieces();

    componentDidMount()
    {
        // Once render() was called, draw the initial peices
        this.drawPeices();
    }

    drawPeices()
    {
        var canvas = this.canvasRef.current;
        this.pieces.drawPeicesToConvas(canvas);
    }

    tryMovePeice(e: MouseEvent) 
    {
        const leftMouseButtonPressed = (e.buttons === 1);
        const x = e.offsetX; 
        const y = e.offsetY;
        if (this.pieces.tryMovePeice(x, y, leftMouseButtonPressed)) 
        {
            this.drawPeices();            
        }
    }    

    render()
    {
        return (
            <div>
                <canvas 
                    ref={this.canvasRef}
                    width={c_canvasWidth} height={c_canvasHeight}
                    style={{"border" : "1px solid rgb(255,0,0)"}}
                    onMouseMove={(e) => {this.tryMovePeice(e.nativeEvent)}}
                    onMouseDown={(e) => {this.tryMovePeice(e.nativeEvent)}}                    
                />
            </div>
        );
    }
}

export default PuzzleCanvas;