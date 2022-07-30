class RouterView {
  name := ""
  path := ""
  opts := ""
  size := ""
  
  __New(_name, _path, _opts, _size="w300 h150", _title="aberoth-hotkeys") {
    This.name := _name
    This.path := _path
    This.opts := _opts
    This.size := _size
  }
}

class Router {
  __ActiveView := ""
  __Views := {}
  Win := {}

  __New(_Win) {
    This.Win := _Win
    This.__Add(new RouterView("About", "about.html", "+AlwaysOnTop +Caption +Border", "w600 h350"))
    This.__Add(new RouterView("Alerts", "alerts.html", "", "w800 h600"))
  }

  __Add(View) {
    This.__Views[View.name] := { path: View.path, opts: View.opts, size: View.size }
  }
  
  Set(name) {
    This.__ActiveView := name
    View := This.__Views[name]
    Assert(IsObject(View), "Error: failed to find view! " . name)
    This.Win.Hide()
    This.Win.Load(View.path)
    This.Win.Show(View.size, View.title)
  }

  Get() {
    return This.__ActiveView
  }
}
