import options from "options";
import { dependencies, sh } from "lib/utils";

export type Resolution = 1920 | 1366 | 3840;
export type Market =
	| "random"
	| "en-US"
	| "ja-JP"
	| "en-AU"
	| "en-GB"
	| "de-DE"
	| "en-NZ"
	| "en-CA";

const WP = `${Utils.HOME}/.config/background`;
const RandomWallpaperDirectory = `${Utils.HOME}/.local/share/backgrounds/LinuxLightDarkWallpapers`;

class Wallpaper extends Service {
	static {
		Service.register(
			this,
			{},
			{
				wallpaper: ["string"],
			},
		);
	}

	#blockMonitor = false;

	#wallpaper() {
		if (!dependencies("swww")) return;

		sh("hyprctl cursorpos").then((pos) => {
			sh([
				"swww",
				"img",
				"--invert-y",
				"--transition-type",
				"grow",
				"--transition-pos",
				pos.replace(" ", ""),
				WP,
			]).then(() => {
				this.changed("wallpaper");
			});
		});
	}

	async #setWallpaper(path: string) {
		this.#blockMonitor = true;

		await sh(`cp ${path} ${WP}`);
		this.#wallpaper();

		await sh(`convert ${path} ${Utils.HOME}/.config/hyprlock.png`);

		this.#blockMonitor = false;
	}

	async #fetchRandomWallpaper() {
		const theme = options.theme.scheme.getValue(); // Call the function to get the theme value
		const suffix = theme === "dark" ? "-d" : "-l";

		// Ensure that RandomWallpaperDirectory contains the correct path
		const files = (await sh(`ls ${RandomWallpaperDirectory}`)).split("\n");
		const matchingFiles = files.filter(
			(file) =>
				file.includes(suffix) &&
				(file.endsWith(".jpg") || file.endsWith(".png")),
		);

		if (matchingFiles.length === 0) {
			console.warn(`No wallpapers found for the ${theme} theme.`);
			return;
		}
		const randomFile =
			matchingFiles[Math.floor(Math.random() * matchingFiles.length)];
		const filePath = `${RandomWallpaperDirectory}/${randomFile}`;
		this.#setWallpaper(filePath);
	}

	readonly random = () => {
		this.#fetchRandomWallpaper();
	};
	readonly set = (path: string) => {
		this.#setWallpaper(path);
	};
	get wallpaper() {
		return WP;
	}

	constructor() {
		super();

		if (!dependencies("swww")) return this;

		// gtk portal
		Utils.monitorFile(WP, () => {
			if (!this.#blockMonitor) this.#wallpaper();
		});

		Utils.execAsync("swww-daemon --format xrgb")
			.then(this.#wallpaper)
			.catch(() => null);
	}
}

export default new Wallpaper();
