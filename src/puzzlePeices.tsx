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

    // If the user clicks on somewhere that's not
    // a peice, then we want to ignore the mouse
    // moves until the user releases the mouse button
    private ignoreUntilReset: boolean = false;    

    constructor()
    {
        var width = c_canvasWidth / c_gridX;
        var height = c_canvasHeight / c_gridY; 

        // Generate the peices, using a specially designed
        // example of lameness to come up with some colors.
        for (var i = 0; i < c_gridX; i++)
        {
            for (var j = 0; j < c_gridY; j++)
            {
                var x = i * width;
                var y = j * height;
                var color = `rgb(${64+191/(i+1)},${64+191/(j+1)},${64+191/(i+1)})`;
                this.pieces.push({
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    color: color
                });
            }
        }
    }

    public drawPeicesToConvas(canvas: HTMLCanvasElement | null)
    {
        var ctx = canvas?.getContext("2d");
        if (ctx !== undefined)
        { 
            ctx!.fillStyle = "white";
            ctx!.fillRect(0, 0, c_canvasWidth, c_canvasHeight);

            // Drawing in order of the array handles z-order
            // nicely
            this.pieces.forEach(peice => {
                ctx!.fillStyle = peice.color;
                ctx!.fillRect(peice.x, peice.y, peice.width, peice.height);
            });
        }
    }

    public tryMovePeice(x: number, y: number, leftButtonDown: boolean) : boolean
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
            return !this.ignoreUntilReset;            
        }
        else
        {
            // The mouse button is not down
            this.resetPeiceMove();
            return false;
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