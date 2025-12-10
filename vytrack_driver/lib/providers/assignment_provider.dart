import 'package:flutter/foundation.dart';
import '../models/assignment.dart';
import '../services/assignment_service.dart';

class AssignmentProvider extends ChangeNotifier {
  final AssignmentService _service = AssignmentService();
  Assignment? currentAssignment;
  bool isLoading = false;

  // Nota: obtener driverId desde sesión/claims; por ahora hardcode para pruebas.
  static const String demoDriverId = 'REPLACE_DRIVER_ID';

  Future<void> loadAssignments() async {
    isLoading = true;
    notifyListeners();
    try {
      final list = await _service.fetchAssignments();
      final filtered = list.where(
        (a) => a.driverId == demoDriverId && a.status != 'COMPLETED' && a.status != 'CANCELLED',
      );
      if (filtered.isNotEmpty) {
        currentAssignment = filtered.first;
      } else if (list.isNotEmpty) {
        currentAssignment = list.first;
      } else {
        currentAssignment = null;
      }
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateStatus(String status) async {
    if (currentAssignment == null) return;
    await _service.updateStatus(currentAssignment!.id, status);
    await loadAssignments();
  }
}
