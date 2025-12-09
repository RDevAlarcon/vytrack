import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/assignment_provider.dart';
import '../../providers/location_provider.dart';
import '../widgets/primary_button.dart';
import '../widgets/status_badge.dart';
import '../../services/background_task.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    final assignments = context.read<AssignmentProvider>();
    assignments.loadAssignments();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final assignments = context.watch<AssignmentProvider>();
    final location = context.watch<LocationProvider>();
    final current = assignments.currentAssignment;
    final hasAssignment = current != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('VyTrack Driver'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              auth.logout();
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Asignación actual', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (!hasAssignment)
                      const Text('No hay asignaciones', style: TextStyle(color: Colors.red))
                    else ...[
                      Text('Tarea: ${current.taskRef ?? '-'}'),
                      Text('Vehículo: ${current.vehicleId}'),
                      Text('Driver: ${current.driverId}'),
                      const SizedBox(height: 4),
                      StatusBadge(status: current.status),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: PrimaryButton(
                              label: 'Iniciar viaje',
                              onPressed: () async {
                                await assignments.updateStatus('IN_PROGRESS');
                                await location.startForegroundTracking(
                                  vehicleId: current.vehicleId,
                                  driverId: current.driverId,
                                );
                                await BackgroundTask.registerPeriodicTask(
                                    vehicleId: current.vehicleId, driverId: current.driverId);
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: PrimaryButton(
                              label: 'Pausar',
                              color: Colors.orange,
                              onPressed: () async {
                                await assignments.updateStatus('PAUSED');
                                location.stopForegroundTracking();
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      PrimaryButton(
                        label: 'Finalizar',
                        color: Colors.red,
                        onPressed: () async {
                          await assignments.updateStatus('COMPLETED');
                          location.stopForegroundTracking();
                        },
                      ),
                    ]
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Ubicación', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Tracking: ${location.trackingEnabled ? 'Activo' : 'Detenido'}'),
                    if (location.lastUpdate != null)
                      Text(
                          'Último envío: ${location.lastUpdate!.timestamp.toLocal()} (${location.lastUpdate!.lat}, ${location.lastUpdate!.lng})'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
