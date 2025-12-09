import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/location_update.dart';
import '../services/location_service.dart';

class LocationProvider extends ChangeNotifier {
  final LocationService _service = LocationService();
  LocationUpdate? lastUpdate;
  bool trackingEnabled = false;
  Timer? _timer;

  Future<void> startForegroundTracking({required String vehicleId, required String driverId}) async {
    trackingEnabled = true;
    notifyListeners();
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) async {
      try {
        final body = await _service.sendLocation(vehicleId: vehicleId, driverId: driverId);
        lastUpdate = LocationUpdate(
          lat: (body['lat'] as num).toDouble(),
          lng: (body['lng'] as num).toDouble(),
          speedKmh: (body['speedKmh'] as num?)?.toDouble(),
          heading: (body['heading'] as num?)?.toDouble(),
          accuracyM: (body['accuracyM'] as num?)?.toDouble(),
          timestamp: DateTime.parse(body['timestamp'] as String),
        );
        notifyListeners();
      } catch (_) {
        // ignore for now
      }
    });
  }

  void stopForegroundTracking() {
    trackingEnabled = false;
    _timer?.cancel();
    notifyListeners();
  }
}
