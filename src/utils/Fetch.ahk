Fetch(Url, Method="GET", Headers="", Data="") {
	try {
		req:=ComObjCreate("WinHttp.WinHttpRequest.5.1")
		req.Open(Method, Url, Method != "POST")
		For k, v in Headers {
			req.SetRequestHeader(k, v)
		}
		req.Send(Data)
		req.WaitForResponse()
		MsgBox % req.ResponseText
	} catch err {
		MsgBox, 0x1030, Error: request failed!, % err
	}
}
