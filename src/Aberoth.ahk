#NoEnv
#Persistent
SetBatchLines, -1
SendMode, Input

#Include Conf.ahk
#Include Hotkeys.ahk
#Include Router.ahk
#Include utils\Assert.ahk
#Include utils\Fetch.ahk
#Include ..\lib\Neutron\Neutron.ahk

class AberothHotkeys {
	Win := new NeutronWindow()
	Hotkeys := new Hotkeys(This)
	Router  := new Router(This.Win)

	__SaveConfig  := false
	__BindingsPath := "config\bindings.ini"
	__OptionsPath  := "config\options.ini"
	Bindings := {}
	Options  := {}

	__New() {
		This.Bindings := Conf.Load(This.__BindingsPath)
		This.Options  := Conf.Load(This.__OptionsPath)
		This.Hotkeys.Load(This.Bindings)
	}

	__Delete() {
		This.Win.Destroy()
		if (__SaveConfig) {
			Conf.Save(This.__BindingsPath, This.Bindings)
			Conf.Save(This.__OptionsPath, This.Options)
		}
	}

	__Error(title, msg) {
		MsgBox, 0x1030, Error: %title%!, % msg
	}
}

App := new AberothHotkeys()
return

HandleHotkey:
	App.Hotkeys.__Bindings[A_ThisHotkey].cb(App.Hotkeys.__Bindings[A_ThisHotkey].args*)
return
