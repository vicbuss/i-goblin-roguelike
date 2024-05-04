import { Actor, Entity } from './Entity'
import type { Tile } from './tileTypes'
import { WALL_TILE } from './tileTypes'
import { Display } from 'rot-js'
import * as ROT from 'rot-js'

export class GameMap {

  tiles: Tile[][]

  constructor(
    public width: number, 
    public height: number, 
    public display: Display,
    public entities: Entity[]
  ) {
    this.tiles = new Array(this.height)
    for (let y = 0; y < this.height; y++) {
      const row = new Array(this.width)
      for (let x = 0; x < this.width; x++) {
        row[x] = { ...WALL_TILE }
      }
      this.tiles[y] = row
    }
  }

  isInBounds(x: number, y: number) {
    return 0 <= x && x < this.width && 0 <= y && y < this.height
  }

  render() {
    for (let y = 0; y < this.tiles.length; y++) {
      const row = this.tiles[y]
      for (let x = 0; x < row.length; x++) {
        const tile = row[x]
        
        let char = ' '
        let fg = '#fff'
        let bg = '#000'

        if (tile.visible) {
          char = tile.light.char
          fg = tile.light.fg
          bg = tile.light.bg
        } else if (tile.seen) {
          char = tile.dark.char
          fg = tile.dark.fg
          bg = tile.dark.bg
        }

        this.display.draw(x, y, char, fg, bg)
      }
    }
    const sortedEntities = structuredClone(this.entities).sort((a, b) => a.renderOrder - b.renderOrder)
    sortedEntities.forEach((entity) => {
      if (this.tiles[entity.y][entity.x].visible) {
        this.display.draw(entity.x, entity.y, entity.char, entity.fg, entity.bg)
      }
    })
  }

  addRoom(x: number, y: number, roomTiles: Tile[][]) {
      for (let curY = y; curY < y + roomTiles.length; curY++) {
          const mapRow = this.tiles[curY];
          const roomRow = roomTiles[curY - y];
          for (let curX = x; curX < x + roomRow.length; curX++) {
          mapRow[curX] = roomRow[curX - x];
          }
      }
  }

  lightPasses(x: number, y: number): boolean {
    if (this.isInBounds(x, y)) {
      return this.tiles[y][x].transparent
    }
    return false
  }

  updateFov(player: Entity) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x].visible = false
      }
    }

    const fov = new ROT.FOV.PreciseShadowcasting(this.lightPasses.bind(this))
    fov.compute(player.x, player.y, 8, (x, y, _r, visibility) => {
      if (visibility === 1) {
        this.tiles[y][x].visible = true
        this.tiles[y][x].seen = true
      }
    })
  }

  getBlockingEntityAtLocation(x: number, y: number): Entity | undefined {
    return this.entities.find(
      (entity) => entity.blocksMovement && entity.x === x && entity.y === y
    )
  }

  getActorAtLocation(x: number, y: number): Actor | undefined {
    return this.actors.find(a => a.x === x && a.y === y)
  }

  public get nonPlayerEntities(): Entity[] {
    // TODO: filter using another parameter
    return this.entities.filter((e) => e.name !== 'Goblin')
  }

  public get actors(): Actor[] {
    return this.entities
    .filter(a => a instanceof Actor)
    .map(a => a as Actor)
    .filter(a => a.isAlive)
  }

}