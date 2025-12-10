import 'package:workmanager/workmanager.dart';
import 'location_service.dart';

class BackgroundTask {
  static const String periodicTask = 'vytrack_location_task';

  // Nota: persistir vehicleId/driverId en storage; por ahora hardcode de prueba.
  static const String _demoVehicleId = 'REPLACE_VEHICLE_ID';
  static const String _demoDriverId = 'REPLACE_DRIVER_ID';

  static Future<bool> handleTask(String task, Map<String, dynamic>? inputData) async {
    if (task == periodicTask) {
      try {
        final vehicleId = inputData?['vehicleId'] as String? ?? _demoVehicleId;
        final driverId = inputData?['driverId'] as String? ?? _demoDriverId;
        await LocationService().sendLocation(vehicleId: vehicleId, driverId: driverId);
        return true;
      } catch (_) {
        return false;
      }
    }
    return false;
  }

  static Future<void> registerPeriodicTask({String? vehicleId, String? driverId}) async {
    await Workmanager().registerPeriodicTask(
      'vytrack_location_task_id',
      periodicTask,
      frequency: const Duration(minutes: 15),
      inputData: {
        'vehicleId': vehicleId ?? _demoVehicleId,
        'driverId': driverId ?? _demoDriverId,
      },
    );
  }
}
