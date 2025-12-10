import 'package:http/http.dart' as http;
import '../core/config.dart';
import '../services/auth_service.dart';

class ApiClient {
  final AuthService _auth = AuthService();

  Future<Map<String, String>> _headers(Map<String, String>? headers) async {
    final token = await _auth.getToken();
    final base = <String, String>{
      'Content-Type': 'application/json',
    };
    if (token != null) {
      base['Authorization'] = 'Bearer $token';
    }
    if (headers != null) {
      base.addAll(headers);
    }
    return base;
  }

  Uri _buildUri(String path, [Map<String, dynamic>? query]) {
    return Uri.parse('$apiBaseUrl$path').replace(queryParameters: query?.map((k, v) => MapEntry(k, '$v')));
  }

  Future<http.Response> get(String path, {Map<String, String>? headers, Map<String, dynamic>? query}) async {
    return http.get(_buildUri(path, query), headers: await _headers(headers));
  }

  Future<http.Response> post(String path, {Map<String, String>? headers, Object? body}) async {
    return http.post(_buildUri(path), headers: await _headers(headers), body: body);
  }

  Future<http.Response> patch(String path, {Map<String, String>? headers, Object? body}) async {
    return http.patch(_buildUri(path), headers: await _headers(headers), body: body);
  }
}
