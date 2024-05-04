import { Engine } from "./Engine"
import { spawnPlayer } from "./Entity"

declare global {
  interface Window {
    engine: Engine
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.engine = new Engine(spawnPlayer(Engine.WIDTH / 2, Engine.HEIGHT / 2))
})