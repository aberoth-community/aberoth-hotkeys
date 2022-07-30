import { About } from './About'
import './About.scss'

// Main
void (() => {
  ;(document.getElementById('app') as HTMLDivElement).innerHTML = About()
})()
