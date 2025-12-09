import 'package:flutter/material.dart';
import '../../models/assignment.dart';
import '../widgets/status_badge.dart';

class AssignmentDetailScreen extends StatelessWidget {
  final Assignment assignment;
  const AssignmentDetailScreen({super.key, required this.assignment});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle de asignación')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tarea: ${assignment.taskRef ?? '-'}'),
            const SizedBox(height: 8),
            Text('Vehículo: ${assignment.vehicleId}'),
            Text('Driver: ${assignment.driverId}'),
            const SizedBox(height: 8),
            StatusBadge(status: assignment.status),
          ],
        ),
      ),
    );
  }
}
