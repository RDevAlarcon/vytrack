import 'dart:convert';
import '../core/api_client.dart';
import '../models/assignment.dart';

class AssignmentService {
  final ApiClient _client = ApiClient();

  Future<List<Assignment>> fetchAssignments() async {
    final res = await _client.get('/assignments');
    if (res.statusCode == 200) {
      final list = jsonDecode(res.body) as List<dynamic>;
      return list.map((e) => Assignment.fromJson(e as Map<String, dynamic>)).toList();
    }
    throw Exception('Error al obtener asignaciones');
  }

  Future<void> updateStatus(String assignmentId, String status) async {
    final res = await _client.patch('/assignments/$assignmentId/status', body: jsonEncode({'status': status}));
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception('Error al actualizar estado');
    }
  }
}
