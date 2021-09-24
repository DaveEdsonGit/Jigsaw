// In future iterations, color will be replaced with an image of the

// part of the puzzle peice
type Piece = {
    solvedX: number;
    solvedY: number;    
    currentX: number;
    currentY: number;
    pieceWidth: number;
    pieceHeight: number;
    pictureX: number,
    pictureY: number,
    pictureWidth: number,
    pictureHeight: number
};

const c_gridX: number = 4;
const c_gridY: number = 4;
const c_imageFilename = "TicTac.png";

export enum Results {
    Solved,
    Unsolved
}

export type ResultCallback = (result:Results) => void;

export class PuzzlePieces
{
    private pieces: Piece[] = [];
    // These three fields are set to values when the user
    // clicks on a peice. Subsequent mouse moves will then be able to 
    // figure out how much to move the peice by calculating the
    // delta from last*
    //
    // activePeice is the peice the user clicked on
    private lastX: number | undefined;
    private lastY: number | undefined;    
    private activePiece: Piece | undefined;
    private picture:HTMLImageElement | undefined; 
    private canvas: HTMLCanvasElement | undefined;
    private resultCallback: ResultCallback | undefined;

    // If the user clicks on somewhere that's not
    // a peice, then we want to ignore the mouse
    // moves until the user releases the mouse button
    private ignoreUntilReset: boolean = false;    

    constructor(canvas: HTMLCanvasElement, resultCallback: ResultCallback)
    {
        this.resultCallback = resultCallback;
        this.canvas = canvas;
        this.picture = new Image();
        this.picture.onload = () => {
            console.log('Loaded the Picture');
            this.buildPieces();
            this.drawPiecesToCanvas();
        };
        this.picture.onerror = (ev) => {
            console.log('Error:');
            console.log(ev);            
        };
        var srcPath = c_imageFilename;
        this.picture.src = srcPath;
        console.log(`Loading picture at [${srcPath}]`);
    }

    private buildPieces()
    {
        var pieceWidth = this.canvas!.width / c_gridX;
        var pieceHeight = this.canvas!.height / c_gridY; 
        var pictureWidth = this.picture!.width / c_gridX;
        var pictureHeight = this.picture!.height / c_gridY; 

        this.pieces = [];
        for (var i = 0; i < c_gridX; i++)
        {
            for (var j = 0; j < c_gridY; j++)
            {
                var x = i * pieceWidth;
                var y = j * pieceHeight;
                this.pieces.push({
                    solvedX: x,
                    solvedY: y,
                    currentX: x,
                    currentY: y,
                    pieceWidth: pieceWidth,
                    pieceHeight: pieceHeight,
                    pictureX: i * pictureWidth,
                    pictureY: j * pictureHeight,
                    pictureWidth: pictureWidth,
                    pictureHeight: pictureHeight,
                });
            }
        }
        this.updateSolvedStatus();        
    }

    private wholeRandomNumber(min: number, max: number) 
    { 
        return Math.floor(Math.random() * (max - min) + min);
    } 

    public unScramblePieces()
    {
        this.pieces.forEach(piece => {
            piece.currentX = piece.solvedX;
            piece.currentY = piece.solvedY;            
        });
        this.drawPiecesToCanvas();
        this.updateSolvedStatus();        
    }

    public scramblePieces()
    {
        const scrambleCount = this.pieces.length;
        for (var i = 0; i < scrambleCount; i++)
        {
            const pieceIndexToMove = this.wholeRandomNumber(0, scrambleCount-2);
            const piece = this.pieces[pieceIndexToMove];
            this.pieces.splice(pieceIndexToMove, 1);
            this.pieces.push(piece);
            piece.currentX = this.wholeRandomNumber(0, this.canvas!.width-piece.pieceWidth);
            piece.currentY = this.wholeRandomNumber(0, this.canvas!.height-piece.pieceHeight);

        }
        this.drawPiecesToCanvas();        
        this.updateSolvedStatus();        
    }

    public drawPiecesToCanvas()
    {
        var ctx = this.canvas!.getContext("2d");
        if (ctx !== undefined)
        { 
            ctx!.fillStyle = "white";
            ctx!.fillRect(0, 0, ctx!.canvas.width, ctx!.canvas.height);

            // Drawing in order of the array handles z-order nicely
            this.pieces.forEach(piece => {
                ctx!.drawImage(
                    this.picture!, 
                    piece.pictureX, piece.pictureY, piece.pictureWidth, piece.pictureHeight,
                    piece.currentX, piece.currentY, piece.pieceWidth, piece.pieceHeight);
            });
        }
    }

    public tryMovePiece(newX: number, newY: number, dragging: boolean) 
    {
        if (dragging)
        {
            // if left button is pressed            
            if (!this.ignoreUntilReset)
            {
                // if the user has not clicked on deadspace and
                // still has the mouse button down

                if ((this.lastX === undefined) || (this.lastY === undefined) || (this.activePiece === undefined))
                {
                    // User started the click, find which peice

                    // Reverse order on the array allows the z-order to be respected
                    // when determining which peice was clicked
                    for (var i = this.pieces.length-1; i >= 0; i--)
                    {
                        var piece = this.pieces[i];
                        if (newX >= piece.currentX && newX < (piece.currentX + piece.pieceWidth) && newY >= piece.currentY && newY < (piece.currentY + piece.pieceHeight))
                        {
                            // Woot. User clicked on a peice. Set the last*
                            // values, and the active peice. Then, move the active
                            // peice to end of the array to change the z-order
                            this.lastX = newX;
                            this.lastY = newY;
                            this.activePiece = piece;

                            this.pieces.splice(i, 1);                        
                            this.pieces.push(piece);                                                
                            break;
                        }
                    }
                    if (this.activePiece === undefined)
                    {
                        // User clicked on a part of the canvas that doesn't
                        // have a peice. So we need to ignore all future mouse
                        // moves util the user lets up on the mouse or exits the
                        this.ignoreUntilReset = true;
                    }                
                }
                else
                {
                    // User moved the mouse, after the click, and it was on a peice.
                    // Figure out the deltas against the last* values, and adjust
                    // the peice's position. Afterwards, update the last* values
                    // to reflect the new mouse position
                    var dx = newX - this.lastX;
                    var dy = newY - this.lastY;
                    this.lastX = newX;
                    this.lastY = newY;
                    this.activePiece.currentX += dx;
                    this.activePiece.currentY += dy; 
                }
            }
            // Even on initial click we want to redraw, since the z-order has
            // changed. Only if we clicked on white space is there nothing to do
            if (!this.ignoreUntilReset)
            {
                this.drawPiecesToCanvas();
            }
        }
        else
        {
            // The mouse button is not down
            if (this.activePiece !== undefined)
            {
                // The user was dragging a piece. Let's snap it into
                // the nearest position. After playing around for a while,
                // it felt the most natural to use the current mouse pointer
                // position
                const gridX = Math.min(Math.max(0, Math.floor(newX /  this.activePiece.pieceWidth)), c_gridX-1);
                const gridY = Math.min(Math.max(0, Math.floor(newY /  this.activePiece.pieceHeight)), c_gridY-1);
                this.activePiece.currentX = gridX * this.activePiece.pieceWidth;
                this.activePiece.currentY = gridY * this.activePiece.pieceHeight;

                // Check for multiple pieces in the spot, if so, shift this one. This
                // needs to be done until resolved.
                // We will try to shift towards the center, so grid* values for first
                // half of range go positive, otherwise negative
                const shiftX = (this.activePiece.pieceWidth / c_gridX) * ((gridX >= c_gridX / 2) ? -1 : 1);
                const shiftY = (this.activePiece.pieceHeight / c_gridY) * ((gridY >= c_gridY / 2) ? -1 : 1);                
                while (this.numberOfPiecesAtPosition(this.activePiece.currentX, this.activePiece.currentY) > 1)
                {
                    this.activePiece.currentX += shiftX;
                    this.activePiece.currentY += shiftY;                    
                }

                this.drawPiecesToCanvas();                    
                this.resetPieceMove();
                this.updateSolvedStatus();
            }
        }
    }

    numberOfPiecesAtPosition(x: number, y: number) : number
    {
        var result = 0;

        this.pieces.forEach(piece => {
            if (piece.currentX == x && piece.currentY == y)
            {
                result++;
            }
        });

        return result;
    }

    updateSolvedStatus()
    {
        var result = Results.Solved;

        this.pieces.forEach(piece => {
            if (piece.currentX !== piece.solvedX || piece.currentY !== piece.solvedY)
            {
                result = Results.Unsolved;
                return;
            }
        });

        this.resultCallback!(result);
    }    

    resetPieceMove()
    {
        this.lastX = undefined;
        this.lastY = undefined;        
        this.activePiece = undefined;
        this.ignoreUntilReset = false;
    }    
}

export default PuzzlePieces;