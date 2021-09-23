import { Component } from "react";
import PuzzleCanvas from "./puzzleCanvas";

type AppProps = {};
type AppState = {};

export class App extends Component<AppProps, AppState>
{
    render()
    {
      return (
        <div>
          <p>Hello Jigsaw!</p>
          <br />
          <PuzzleCanvas />
        </div>
      );
    }
}

export default App;