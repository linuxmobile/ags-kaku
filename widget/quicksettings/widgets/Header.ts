import icons from "lib/icons";
import { uptime } from "lib/variables";
import options from "options";
import powermenu, { Action } from "service/powermenu";

const battery = await Service.import("battery");
// const { image, size } = options.quicksettings.avatar

function up(up: number) {
	const h = Math.floor(up / 60);
	const m = Math.floor(up % 60);
	return `${h}h ${m < 10 ? "0" + m : m}m`;
}

function formatTimeUntilCharged(seconds: number) {
	const hours: number = Math.floor(seconds / 3600);
	const minutes: number = Math.floor((seconds % 3600) / 60);

	let result: string = "";
	if (hours > 0) {
		result += hours + " hour";
		if (hours > 1) result += "s";
	}
	if (minutes > 0) {
		if (result !== "") result += " ";
		result += minutes + " minute";
		if (minutes > 1) result += "s";
	}
	return result;
}

const TimeRemaining = () => {
	return Widget.Box([
		Widget.Icon({ icon: battery.bind("icon_name") }),
		Widget.Label({
			class_name: "time-remaining",
			hpack: "start",
			label: Utils.merge(
				[battery.bind("time-remaining"), battery.bind("charging")],
				(tr: number, charging: boolean) => {
					const hoursMinutes = formatTimeUntilCharged(tr);

					if (charging) {
						return hoursMinutes === ""
							? "Charging"
							: `${hoursMinutes} until fully charged`;
					} else {
						return hoursMinutes === ""
							? "Discharging"
							: `About ${hoursMinutes} left`;
					}
				},
			),
			css: "padding: 0 0 0 5pt;",
		}),
	]);
};

// const Avatar = () => Widget.Box({
//     class_name: "avatar",
//     css: Utils.merge([image.bind(), size.bind()], (img, size) => `
//         min-width: ${size}px;
//         min-height: ${size}px;
//         background-image: url('${img}');
//         background-size: cover;
//     `),
// })

const SysButton = (action: Action) =>
	Widget.Button({
		vpack: "center",
		child: Widget.Icon(icons.powermenu[action]),
		on_clicked: () => powermenu.action(action),
	});

export const Header = () =>
	Widget.Box(
		{ class_name: "header horizontal" },
		// Avatar(),
		Widget.Box({
			vertical: true,
			vpack: "center",
			children: [
				Widget.Box({
					visible: battery.bind("available"),
					children: [
						Widget.Icon({ icon: battery.bind("icon_name") }),
						Widget.Label({
							label: battery.bind("percent").as((p) => `${p}%`),
							css: "padding: 0 0 0 5pt;",
						}),
					],
				}),
				TimeRemaining(),
				// Widget.Box([
				// 	Widget.Icon({ icon: icons.ui.time }),
				// 	Widget.Label({
				// 		label: uptime.bind().as(up),
				// 		css: "padding: 0 0 0 5pt;",
				// 	}),
				// ]),
			],
		}),
		Widget.Box({ hexpand: true }),
		Widget.Button({
			vpack: "center",
			child: Widget.Icon(icons.ui.settings),
			on_clicked: () => {
				App.closeWindow("quicksettings");
				App.closeWindow("settings-dialog");
				App.openWindow("settings-dialog");
			},
		}),
		SysButton("shutdown"),
	);
