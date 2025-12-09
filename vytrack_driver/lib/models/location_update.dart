class LocationUpdate {
  final double lat;
  final double lng;
  final double? speedKmh;
  final double? heading;
  final double? accuracyM;
  final DateTime timestamp;

  LocationUpdate({
    required this.lat,
    required this.lng,
    required this.timestamp,
    this.speedKmh,
    this.heading,
    this.accuracyM,
  });
}
