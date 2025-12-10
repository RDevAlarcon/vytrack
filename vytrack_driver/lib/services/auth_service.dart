import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/api_client.dart';

class AuthService {
  static const _tokenKey = 'auth_token';
  final _storage = const FlutterSecureStorage();
  final ApiClient _client = ApiClient();

  Future<void> login(String email, String password) async {
    final res = await _client.post(
      '/auth/login',
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode == 201 || res.statusCode == 200) {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final token = body['accessToken'] as String?;
      if (token != null) {
        await _storage.write(key: _tokenKey, value: token);
      } else {
        throw Exception('Token no recibido');
      }
    } else {
      throw Exception('Login failed: ${res.statusCode}');
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<String?> getToken() async {
    return _storage.read(key: _tokenKey);
  }
}
