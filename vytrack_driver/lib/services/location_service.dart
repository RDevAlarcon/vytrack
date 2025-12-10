import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import '../core/api_client.dart';

class LocationService {
  final ApiClient _client = ApiClient();

  Future<void> ensurePermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      throw Exception('Permiso de ubicación denegado');
    }
  }

  Future<Position> getCurrentPosition() {
    return Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
  }

  double? _toKmh(double? speedMs) {
    if (speedMs == null) return null;
    return speedMs * 3.6;
  }

  Future<Map<String, dynamic>> sendLocation({required String vehicleId, required String driverId}) async {
    await ensurePermission();
    final pos = await getCurrentPosition();
    final body = {
      "vehicleId": vehicleId,
      "driverId": driverId,
      "timestamp": DateTime.now().toUtc().toIso8601String(),
      "lat": pos.latitude,
      "lng": pos.longitude,
      "speedKmh": _toKmh(pos.speed),
      "heading": pos.heading,
      "accuracyM": pos.accuracy,
      "source": "APP",
      "deviceId": null,
      "raw": null
    };
    final res = await _client.post('/locations', body: jsonEncode(body));
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception('Error al enviar ubicación');
    }
    return body;
  }
}
