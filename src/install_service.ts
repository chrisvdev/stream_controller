import WindowsService, {
  isWindowsServiceCompatible,
} from "@windows/service.js";

if (isWindowsServiceCompatible()) {
  console.log("Installing service...");
  const service = new WindowsService(import.meta.dirname);
  service.installService();
} else {
  console.log("The service is not compatible other than Windows. Skipping...");
}
