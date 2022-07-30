#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%
DetectHiddenWindows, Off

#Include utils\Assert.ahk

class MineField {
	Cells := []
	dButtonSize := 40
	dRows := 0
	dCols := 0

	__New(w, h) {
		This.dHeight := h
		This.dWidth  := w
		This.dButtonSize := 40
	}

	__GenerateCellValue() {
		Random, cv, 0, 100
		return cv < 25 ? -2 : -1
	}

	__Generate(x, y) {
		global
		This.Cells := []
		This.dRows := y
		This.dCols := x
		Loop % x * y {
			cy := Floor((A_Index - 1) * 0.1) * This.dButtonSize
			cx := (A_Index * This.dButtonSize - This.dButtonSize) - ((cy / This.dButtonSize) * this.dHeight)
			;; MsgBox, x: %cx%, y: %cy%

			Gui, Add, Button, w40 h40 x%cx% y%cy% v%A_Index% gCellOnClicked
			This.Cells.Push(This.__GenerateCellValue())
		}
	}

	Get(x, y) {
		return This.Cells[y * This.dCols + x]
	}

	Set(x, y, cell) {
		This.Cells[y * This.dCols + x] := cell
	}

	Len() {
		return This.dCols * This.dRows
	}

	Value(x, y) {
		dCellValue := 0
		if (This.Get(x - 1, y) == -2)
			dCellValue++
		if (This.Get(x + 1, y) == -2)
			dCellValue++
		if (This.Get(x, y - 1) == -2)
			dCellValue++
		if (This.Get(x, y + 1) == -2)
			dCellValue++
		return dCellValue
	}
}

class MineSweeper {
	Field := ""
	bFirstMove := true
	dWinHeight := 0
	dWinWidth := 0

	__New() {
		Gui, New,, MineSweeper
		This.bFirstMove := true
		This.dWinHeight := 400
		This.dWinWidth  := 400
		This.Field := new MineField(This.dWinWidth, This.dWinHeight)
	}

	Reveal(cell, cv) {
		x := Mod(cell, 10)
		y := Floor(cell * 0.1)
		;; MsgBox, Clicked cell! x: %x%, y: %y%, cv: %cv%
		if (cv == -1 || This.bFirstMove) {
			This.bFirstMove := false
			GuiControl, Text, % cell, % This.Field.Value(x, y)
			GuiControl, Disable, % cell
		} else {
			GuiControl, Text, % cell, *
			GuiControl, Disable, % cell
			MsgBox, Dead!
			ExitApp
		}
	}

	Start() {
		This.Field.__Generate(10, 10)
		Gui, Show, % "w" This.dWinWidth " h" This.dWinHeight
	}
}

Game := new MineSweeper()
Game.Start()
return

CellOnClicked:
	Game.Reveal(A_GuiControl, Game.Field.Cells[A_GuiControl])
return

GuiClose:
	Gui, Destroy
	ExitApp
