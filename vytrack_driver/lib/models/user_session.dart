class UserSession {
  final String token;
  // Pending: add companyId/driverId from backend claims when available.
  UserSession({required this.token});
}
