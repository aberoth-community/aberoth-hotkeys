Assert(expr, msg) {
	if (expr != true) {
		MsgBox, 0x1030, Error: assertion failed!, % msg
		ExitApp
	}
}
