import { Display } from "rot-js";
import { Entity, spawnDwarf, spawnSlaveOgre } from "./Entity";
import { GameMap } from "./gameMap";
import { FLOOR_TILE, Tile, WALL_TILE } from "./tileTypes";

type Bounds = {
  x1: number
  y1: number
  x2: number
  y2: number
}

class RectangularRoom {
    tiles: Tile[][]
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {
        this.tiles = new Array(this.height)
        this.buildRoom()
    }

    buildRoom() {
        for (let y = 0; y < this.height; y++) {
        const row = new Array(this.width)
        for (let x = 0; x < this.width; x++) {
            const isWall =
            x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1
            row[x] = isWall ? { ...WALL_TILE } : { ...FLOOR_TILE }
        }
        this.tiles[y] = row
        }
    }

    intersects(other: RectangularRoom): boolean {
        return(
            this.x <= other.x + other.width &&
            this.x + this.width >= other.x &&
            this.y <= other.y + other.height &&
            this.y + this.width >= other.y
        )
    }

    public get center(): [number, number] {
        const centerX = this.x + Math.floor(this.width / 2)
        const centerY = this.y + Math.floor(this.height / 2)

        return [centerX, centerY]
    }

    public get bounds(): Bounds {
      return {
        x1: this.x,
        y1: this.y,
        x2: this.x + this.width - 1,
        y2: this.y + this.height - 1
      }
    }
}

function* connectRooms(
  a: RectangularRoom,
  b: RectangularRoom,
): Generator<[number, number], void, void> {
  // set the start point of our tunnel at the center of the first room
  let current = a.center;
  // set the end point at the center of the second room
  const end = b.center;

  // flip a coin to see if we go horizontally first or vertically
  let horizontal = Math.random() < 0.5;

  // we'll loop until our current is the same as the end point
  while (current[0] !== end[0] || current[1] !== end[1]) {
    if (horizontal) {
      // are we tunneling left or right?
      const direction = Math.sign(end[0] - current[0]);
      // if direction is 0 we have hit the destination in one direction
      if (direction !== 0) {
        current[0] += direction;
        yield current;
      } else {
        // we've finsihed in this direction so switch to vertical
        horizontal = false;
      }
    } else {
      const direction = Math.sign(end[1] - current[1]);
      // if direction is 0 we have hit the destination in one direction
      if (direction !== 0) {
        current[1] += direction;
        yield current;
      } else {
        // we've finsihed in this direction so switch to horizontal
        horizontal = true;
      }
    }
  }
}

function generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function placeEntities(
  room: RectangularRoom,
  dungeon: GameMap,
  maxMonsters: number
) {
  const numberOfMonstersToAdd = generateRandomNumber(0, maxMonsters)

  for (let i = 0; i < numberOfMonstersToAdd; i++) {
    const bounds = room.bounds
    const x = generateRandomNumber(bounds.x1 + 1, bounds.x2 - 1)
    const y = generateRandomNumber(bounds.y1 + 1, bounds.y2 - 1)
    // TODO: make it so an entity cannot spawn on top of the player
    if (!dungeon.entities.some((e) => e.x == x && e.y == y)) {
      if (Math.random() < 0.8) {
        dungeon.entities.push(spawnDwarf(x, y))
      } else {
        dungeon.entities.push(spawnSlaveOgre(x, y))
      }
    }
  }
}

export function generateDungeon(
    mapWidth: number,
    mapHeight: number,
    maxRooms: number,
    minSize: number,
    maxSize: number,
    maxMonsters: number,
    player: Entity,
    display: Display
): GameMap {
    const dungeon = new GameMap(mapWidth, mapHeight, display, [player])

    const rooms: RectangularRoom[] = []

    for (let count = 0; count < maxRooms; count++) {
        const width = generateRandomNumber(minSize, maxSize)
        const height = generateRandomNumber(minSize, maxSize)

        const x = generateRandomNumber(0, mapWidth - width - 1)
        const y = generateRandomNumber(0, mapHeight - height -1)

        const newRoom = new RectangularRoom(x, y, width, height)

        if (rooms.some((r) => r.intersects(newRoom))) {
            continue
        }

        dungeon.addRoom(x, y, newRoom.tiles)

        placeEntities(newRoom, dungeon, maxMonsters)

        rooms.push(newRoom)
    }

    const startPoint = rooms[0].center
    player.x = startPoint[0]
    player.y = startPoint[1]

    for (let index = 0; index < rooms.length - 1; index++) {
        const first = rooms[index]
        const second = rooms[index + 1]
        
        for (let tile of connectRooms(first, second)) {
            dungeon.tiles[tile[1]][tile[0]] = {...FLOOR_TILE}
        }
    }

    return dungeon
}