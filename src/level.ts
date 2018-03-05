import { Game } from ".";
import { Entity, Furniture } from "./entity";
import { IFurniture } from "./interface/entity-schema";
import { IObjectLayer, IPuzzleRoom, ITileLayer } from "./interface/puzzle-schema";


type TileID = number;

export class Level {
    public readonly width: number;
    public readonly height: number;

    public furnitures: Furniture[] = [];

    private tiles: TileID[] = [];
    private nextLevel: Level;
    private prevLevel: Level;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.nextLevel = null;
        this.prevLevel = null;
        this.tiles.fill(1, 0, width * height);
    }

    public get(x: number, y: number): TileID {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            const index = x + y * this.width;
            return this.tiles[index];
        }
        console.error("Level.get index out of bounds : " + JSON.stringify({ x, y }));
    }

    public set(x: number, y: number, tile: TileID): void {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            const index = x + y * this.width;
            this.tiles[index] = tile;
            return;
        }
        console.error("Level.set index out of bounds : " + JSON.stringify({ x, y }));
    }

    public placePuzzleAt(game: Game, px: number, py: number, puzzle: IPuzzleRoom): void {
        const getLayerByName = (name: string) => {
            for (const layer of puzzle.layers) {
                if (layer.name === name) {
                    return layer;
                }
            }
            console.error("Layer " + name + " not found in puzzle room");
        };

        console.log(puzzle);

        // Place tiles
        const tilelayer = getLayerByName("tile") as ITileLayer;
        for (let y = 0; y < puzzle.height; y++) {
            for (let x = 0; x < puzzle.width; x++) {
                const tile = tilelayer.data[x + y * puzzle.width];
                this.set(px + x, py + y, tile - 1);
            }
        }

        // Place furniture
        const furnitureLayer = getLayerByName("furniture");
        if ("objects" in furnitureLayer) {
            for (const furnitureDefinition of furnitureLayer.objects) {
                const furniture = new Furniture();
                furniture.x = furnitureDefinition.x / 16;
                furniture.y = furnitureDefinition.y / 16 - 1;
                furniture.dataRef = null;

                // If type if missing, get type from the corresponding tile
                // (because Tiled editor leaves it empty if the furniture was created
                // using the "Insert Tile" tool)
                let foundType = furnitureDefinition.type;
                if (foundType === "") {
                    if ("gid" in furnitureDefinition) {
                        const tileIndex = furnitureDefinition.gid - 1;
                        const tile = game.data.tiles[tileIndex];
                        if (tile === undefined) {
                            console.error("Tile " + furnitureDefinition.gid + " not found.");
                            continue;
                        }
                        foundType = tile.type;
                    }
                }

                const data = game.data.getByType(game.data.furnitures, foundType);
                if (data === undefined) {
                    console.error("Furniture with type " + foundType + " not found.");
                    continue;
                }
                furniture.dataRef = data as IFurniture;

                this.furnitures.push(furniture);
            }
        }
    }
}
