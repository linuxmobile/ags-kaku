import matugen from "./matugen";
import hyprland from "./hyprland";
import gtk from "./gtk";
import lowBattery from "./battery";
import notifications from "./notifications";

export default function init() {
	try {
		gtk();
		matugen();
		lowBattery();
		notifications();
		hyprland();
	} catch (error) {
		logError(error);
	}
}
