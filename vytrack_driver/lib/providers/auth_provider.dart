import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  bool isLoading = false;
  bool isAuthenticated = false;
  String? token;

  Future<void> initSession() async {
    token = await _authService.getToken();
    isAuthenticated = token != null;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    isLoading = true;
    notifyListeners();
    try {
      await _authService.login(email, password);
      token = await _authService.getToken();
      isAuthenticated = token != null;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    token = null;
    isAuthenticated = false;
    notifyListeners();
  }
}
