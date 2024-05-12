import PanelButton from "../PanelButton";
import icons from "lib/icons";
import asusctl from "service/asusctl";

const notifications = await Service.import("notifications");
const bluetooth = await Service.import("bluetooth");
const audio = await Service.import("audio");
const network = await Service.import("network");
const powerprofiles = await Service.import("powerprofiles");

const ProfileIndicator = () =>
	Widget.Icon({ css: "padding: 0 5pt 0 0;" })
		.bind("visible", powerprofiles, "active_profile", (p) => p !== "Balanced")
		.bind(
			"icon",
			powerprofiles,
			"active_profile",
			(p) => icons.powerprofile[p],
		);

const ModeIndicator = () => {
	if (!asusctl.available) {
		return Widget.Icon({
			setup(self) {
				Utils.idle(() => (self.visible = false));
			},
		});
	}

	return Widget.Icon({
		visible: asusctl.bind("mode").as((m) => m !== "Hybrid"),
		icon: asusctl.bind("mode").as((m) => icons.asusctl.mode[m]),
	});
};

const MicrophoneIndicator = () =>
	Widget.Icon()
		.hook(
			audio,
			(self) =>
				(self.visible =
					audio.recorders.length > 0 || audio.microphone.is_muted || false),
		)
		.hook(audio.microphone, (self) => {
			const vol = audio.microphone.is_muted ? 0 : audio.microphone.volume;
			const { muted, low, medium, high } = icons.audio.mic;
			const cons = [
				[67, high],
				[34, medium],
				[1, low],
				[0, muted],
			] as const;
			self.icon = cons.find(([n]) => n <= vol * 100)?.[1] || "";
		});

const DNDIndicator = () =>
	Widget.Icon({
		visible: notifications.bind("dnd"),
		icon: icons.notifications.silent,
		css: "padding: 0 5pt 0 0;",
	});

const BluetoothIndicator = () =>
	Widget.Overlay({
		class_name: "bluetooth",
		passThrough: true,
		visible: bluetooth.bind("enabled"),
		child: Widget.Icon({
			icon: icons.bluetooth.enabled,
			css: "padding: 0 5pt 0 0;",
		}),
		overlay: Widget.Label({
			hpack: "end",
			vpack: "start",
			label: bluetooth.bind("connected_devices").as((c) => `${c.length}`),
			visible: bluetooth.bind("connected_devices").as((c) => c.length > 0),
		}),
	});

const NetworkIndicator = () =>
	Widget.Icon({ css: "padding: 0 5pt 0 0;" }).hook(network, (self) => {
		const icon = network[network.primary || "wifi"]?.icon_name;
		self.icon = icon || "";
		self.visible = !!icon;
	});

const AudioIndicator = () =>
	Widget.Icon({ css: "padding: 0 5pt 0 0;" }).hook(audio.speaker, (self) => {
		const vol = audio.speaker.is_muted ? 0 : audio.speaker.volume;
		const { muted, low, medium, high, overamplified } = icons.audio.volume;
		const cons = [
			[101, overamplified],
			[67, high],
			[34, medium],
			[1, low],
			[0, muted],
		] as const;
		self.icon = cons.find(([n]) => n <= vol * 100)?.[1] || "";
	});

export default () =>
	PanelButton({
		window: "quicksettings",
		on_clicked: () => App.toggleWindow("quicksettings"),
		on_scroll_up: () => (audio.speaker.volume += 0.02),
		on_scroll_down: () => (audio.speaker.volume -= 0.02),
		child: Widget.Box([
			ProfileIndicator(),
			ModeIndicator(),
			DNDIndicator(),
			BluetoothIndicator(),
			NetworkIndicator(),
			AudioIndicator(),
			MicrophoneIndicator(),
		]),
	});
