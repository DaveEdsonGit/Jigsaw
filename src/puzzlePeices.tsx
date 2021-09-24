// In future iterations, color will be replaced with an image of the

// part of the puzzle peice
type Piece = {
    x: number;
    y: number;
    width: number;
    height: number;
    pictureX: number,
    pictureY: number,
    pictureWidth: number,
    pictureHeight: number
};

const c_gridX = 4;
const c_gridY = 4;
const c_imageFilename = "TicTac.png";

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
    private activePeice: Piece | undefined;
    private picture:HTMLImageElement | undefined; 
    private canvas: HTMLCanvasElement | undefined;

    // If the user clicks on somewhere that's not
    // a peice, then we want to ignore the mouse
    // moves until the user releases the mouse button
    private ignoreUntilReset: boolean = false;    

    constructor(canvas: HTMLCanvasElement)
    {
        this.canvas = canvas;
        this.picture = new Image();
        this.picture.onload = () => {
            console.log('Loaded the Picture');
            this.buildPieces();
            this.drawPeicesToCanvas();
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
        var width = this.canvas!.width / c_gridX;
        var height = this.canvas!.height / c_gridY; 

        var pictureWidth = this.picture!.width / c_gridX;
        var pictureHeight = this.picture!.height / c_gridY; 

        this.pieces = [];
        for (var i = 0; i < c_gridX; i++)
        {
            for (var j = 0; j < c_gridY; j++)
            {
                var x = i * width;
                var y = j * height;
                this.pieces.push({
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    pictureX: i * pictureWidth,
                    pictureY: j * pictureHeight,
                    pictureWidth: pictureWidth,
                    pictureHeight: pictureHeight,
                });
            }
        }
    }

    private randomNumber(min: number, max: number) 
    { 
        return Math.floor(Math.random() * (max - min) + min);
    } 

    public unScramblePieces()
    {
        this.buildPieces();
        this.drawPeicesToCanvas();
    }

    public scramblePieces()
    {
        const scrambleCount = this.pieces.length;
        for (var i = 0; i < scrambleCount; i++)
        {
            const pieceIndexToMove = this.randomNumber(0, scrambleCount-2);
            const piece = this.pieces[pieceIndexToMove];
            piece.x = this.randomNumber(0, this.canvas!.width-piece.width);
            piece.y = this.randomNumber(0, this.canvas!.height-piece.height);
            this.pieces.slice(pieceIndexToMove, 1);
            this.pieces.push(piece);
        }
        this.drawPeicesToCanvas();        
    }

    public drawPeicesToCanvas()
    {
        var ctx = this.canvas!.getContext("2d");
        if (ctx !== undefined)
        { 
            ctx!.fillStyle = "white";
            ctx!.fillRect(0, 0, ctx!.canvas.width, ctx!.canvas.height);

            // Drawing in order of the array handles z-order nicely
            this.pieces.forEach(peice => {
                ctx!.drawImage(
                    this.picture!, 
                    peice.pictureX, peice.pictureY, peice.pictureWidth, peice.pictureHeight,
                    peice.x, peice.y, peice.width, peice.height);
            });
        }
    }

    public tryMovePeice(x: number, y: number, leftButtonDown: boolean) 
    {
        if (leftButtonDown)
        {
            // if left button is pressed            
            if (!this.ignoreUntilReset)
            {
                // if the user has not clicked on deadspace and
                // still has the mouse button down

                if ((this.lastX === undefined) || (this.lastY === undefined) || (this.activePeice === undefined))
                {
                    // User started the click, find which peice

                    // Reverse order on the array allows the z-order to be respected
                    // when determining which peice was clicked
                    for (var i = this.pieces.length-1; i >= 0; i--)
                    {
                        var peice = this.pieces[i];
                        if (x >= peice.x && x < (peice.x + peice.width) && y >= peice.y && y < (peice.y + peice.height))
                        {
                            // Woot. User clicked on a peice. Set the last*
                            // values, and the active peice. Then, move the active
                            // peice to end of the array to change the z-order
                            this.lastX = x;
                            this.lastY = y;
                            this.activePeice = peice;
                            this.pieces.splice(i, 1);                        
                            this.pieces.push(peice);                                                
                            break;
                        }
                    }
                    if (this.activePeice === undefined)
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
                    var dx = x - this.lastX;
                    var dy = y - this.lastY;
                    this.lastX = x;
                    this.lastY = y;
                    this.activePeice.x += dx;
                    this.activePeice.y += dy; 
                }
            }
            // Even on initial click we want to redraw, since the z-order has
            // changed. Only if we clicked on white space is there nothing to do
            if (!this.ignoreUntilReset)
            {
                this.drawPeicesToCanvas();
            }
        }
        else
        {
            // The mouse button is not down
            this.resetPeiceMove();
        }
    }    

    resetPeiceMove()
    {
        this.lastX = undefined;
        this.lastY = undefined;        
        this.activePeice = undefined;
        this.ignoreUntilReset = false;
    }    
}

export default PuzzlePieces;