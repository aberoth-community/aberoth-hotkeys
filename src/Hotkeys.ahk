class Hotkeys {
  __Label := "HandleHotkey"
  __Bindings := {}
  App := {}

  __New(_App) {
    This.App := _App
  }

  __EmoteSmile() {
    MsgBox, EmoteSmile!
  }

  __EmoteFrown() {
    MsgBox, EmoteSmile!
  }

  __FlipCoin() {
    MsgBox, FlipCoin!
  }

  __Friendly() {
    MsgBox, Friendly!
  }

  __Unfriendly() {
    MsgBox, UnFriendly!
  }

  __ToggleFriendly() {
    MsgBox, ToggleFriendly!
  }

  __ToggleBuildMode() {
    MsgBox, ToggleBuildMode!
  }

  __Save() {
    MsgBox, Save!
  }

  __Screenshot() {
    MsgBox, Screenshot!
  }

  __Quit() {
    MsgBox, Quit!
  }

  __QuitHotkeys() {
    ExitApp
  }

  __SaveAndQuit() {
    This.__Save()
    This.__Quit()
  }

  __ViewMineSweeper() {
    Run %A_AhkPath% views\MineSweeper.ahk
  }

  __ViewAbout() {
    if (This.App.Router.Get() != "About") {
      This.App.Router.Set("About")
    }
  }

  __ViewAlerts() {
    if (This.App.Router.Get() != "Alerts") {
      This.App.Router.Set("Alerts")
    }
  }

  Load(Bindings) {
    For sName, sValues in Bindings {
      For name, key in sValues {
        fName := "__" name
        if (IsFunc(This[fName])) {
          This.BindKey(key, This[fName].Bind(This))
        } else {
          This.App.__Error("Failed to find binding!", "Failed to find binding: '" fName "' in Hotkeys.ahk!")
        }
      }
    }
  }

  BindKey(key, cb, args="") {
    This.__Bindings[key] := {}
    This.__Bindings[key].cb := cb
    This.__Bindings[key].args := args
    Hotkey, % key, % This.__Label
  }

  UnBindKey(key) {
    Hotkey, % key, Off
  }
}
