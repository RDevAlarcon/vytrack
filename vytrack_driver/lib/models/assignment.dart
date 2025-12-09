class Assignment {
  final String id;
  final String driverId;
  final String vehicleId;
  final String? taskRef;
  final String status;
  final DateTime? startPlanned;
  final DateTime? endPlanned;

  Assignment({
    required this.id,
    required this.driverId,
    required this.vehicleId,
    this.taskRef,
    required this.status,
    this.startPlanned,
    this.endPlanned,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return Assignment(
      id: json['id'] as String,
      driverId: json['driverId'] as String,
      vehicleId: json['vehicleId'] as String,
      taskRef: json['taskRef'] as String?,
      status: json['status'] as String,
      startPlanned: json['startPlanned'] != null ? DateTime.parse(json['startPlanned']) : null,
      endPlanned: json['endPlanned'] != null ? DateTime.parse(json['endPlanned']) : null,
    );
  }
}
