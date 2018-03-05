import { Color } from "./color";
import { Game } from "./index";
import { Level } from "./level";
import { PixiRenderer } from "./pixirenderer";

export interface IMouseEvent {
    mx: number; // Mouse X
    my: number; // Mouse Y
    tx: number; // Tile X
    ty: number; // Tile Y
}

export class Renderer {
    private game: Game;
    private renderer: PixiRenderer;

    constructor(game: Game) {
        this.game = game;
        this.renderer = new PixiRenderer(Game.WIDTH, Game.HEIGHT);
        this.renderer.initialize();

        window.addEventListener("resize", this.renderer.resize.bind(this.renderer));
        this.renderer.resize();
    }

    public addClickListener(callback: (e: IMouseEvent) => void) {
        this.renderer.getCanvas().addEventListener("click", (event) => {
            const rect = this.renderer.getCanvas().getBoundingClientRect();
            const mx = Math.floor(((event.clientX - rect.left) / rect.width) * Game.WIDTH);
            const my = Math.floor(((event.clientY - rect.top) / rect.height) * Game.HEIGHT);
            const tx = Math.floor(mx / 16);
            const ty = Math.floor(my / 16);
            callback({ mx, my, tx, ty });
        });
    }

    public async loadGraphics() {
        return new Promise((resolve, reject) => {
            this.renderer.loadAssets(["font.png", "tileset.png"], resolve);
        });
    }

    public renderGame() {
        const level = this.game.getCurrentLevel();

        this.renderer.clear();
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const tile = level.get(x, y);
                this.renderer.drawTexture(x * 16, y * 16, tile);
            }
        }

        const furnitures = this.game.getCurrentLevel().furnitures;
        for (const furniture of furnitures) {
            // const furId = this.game.data.getByType(this.game.data.furnitures, furniture.dataType);
            // const furDef = this.game.data.furnitures[furId];
            this.renderer.drawTexture(furniture.x * 16, furniture.y * 16, furniture.dataRef.icon);
        }

        // Draw descriptions (for debugging purposes)
        for (const desc of this.game.getCurrentLevel().descriptions) {
            this.renderer.drawRect(desc.x * 16, desc.y * 16, desc.w * 16, desc.h * 16, true, Color.red);
        }

        const player = this.game.player;
        if (player.currentbody === null) {
            this.renderer.drawTexture(player.x * 16, player.y * 16, player.dataRef.id);
        } else {
            this.renderer.drawTexture(player.x * 16, player.y * 16, player.currentbody.dataRef.id);
        }

        // this.renderer.drawRect(0, 0, 64, 64, true);
        this.renderer.render();
    }
}
