#Include utils\Assert.ahk

class Conf {
	;; Load & parse ini file
	Load(path) {
		data := {}
		IniRead, Sections, % path
		Loop, Parse, Sections, `n`r
		{
			sName := A_LoopField
			data[sName] := {}

			IniRead, Values, % path, % sName
			Loop, Parse, Values, `n`r
			{
				StringSplit, Field, A_LoopField, =
				Assert(Field1 is not alpha || Field2 is not alpha, "Error: failed to parse field!")
				data[sName][Field1] := Field2
			}
		}
		return data
	}

	;; Serialize & save ini file
	Save(path, data) {
		For sName, Section in data {
			For k, v in Section {
				Assert(!IsObject(v), "Error: failed to serialize 3-dimensional object! " . k)
				IniWrite, % v, % path, % sName, % k
			}
		}
	}
}
