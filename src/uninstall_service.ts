import WindowsService, {
  isWindowsServiceCompatible,
} from "@windows/service.js";

if (isWindowsServiceCompatible()) {
  console.log("Uninstalling service...");
  const service = new WindowsService(import.meta.dirname);
  service.uninstallService();
} else {
  console.log("The service is not compatible other than Windows. Skipping...");
}
